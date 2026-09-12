# 07｜n8n Workflow 架構

分成 5 個獨立 Workflow，不要全部塞在一個。單一巨大 workflow 在 n8n 裡除錯是災難。

| # | Workflow | 觸發方式 | 職責 |
|---|---|---|---|
| WF-1 | `line-inbound-gateway` | Webhook | 收 LINE event、驗簽、冪等、分派 |
| WF-2 | `diagnostic-engine` | 被 WF-1 呼叫 | 狀態機、出題、存答案 |
| WF-3 | `ai-analysis` | 被 WF-2 呼叫 | 計分、LLM、Flex 推播 |
| WF-4 | `lead-qualification` | 被 WF-1 呼叫 | 收集資料、計分、通知顧問 |
| WF-5 | `scheduler` | Cron | Follow-up、逾時回收、重生成、報表 |

---

## WF-1｜line-inbound-gateway

```
[Webhook: POST /webhook/line/inbound]
      ↓
[Code: 驗證 X-Line-Signature]
      ↓ 驗簽失敗 → [Respond 401] ⛔
      ↓
[Respond to Webhook: 200 OK]  ← 先回 200，之後全部非同步
      ↓
[Split In Batches: events[]]
      ↓
[Supabase: INSERT events (webhook_event_id)]
      ↓ 衝突（重複事件）→ [NoOp] ⛔
      ↓
[Supabase: SELECT user by line_user_id]
      ↓
[Switch: event.type]
      ├── follow    → [WF: handle-follow]
      ├── unfollow  → [Supabase: UPDATE users SET is_blocked=true, unfollowed_at=now()]
      ├── postback  → [Switch: postback type]
      │                   ├── seg / ans → [Execute WF-2]
      │                   ├── cta       → [Execute WF-2 (cta handler)]
      │                   └── lead      → [Execute WF-4]
      ├── message(text) → [WF: handle-freetext]
      └── 其他       → [NoOp]
```

### 節點細節

**驗證簽章（Code node）**

```javascript
const crypto = require('crypto');
const secret = $env.LINE_CHANNEL_SECRET;
const body   = JSON.stringify($input.first().json.body);
const sig    = $input.first().json.headers['x-line-signature'];
const hash   = crypto.createHmac('SHA256', secret).update(body).digest('base64');
if (hash !== sig) throw new Error('INVALID_SIGNATURE');
return $input.all();
```

注意：n8n 的 Webhook node 要設 `Raw Body = true`，否則 JSON 重新序列化後簽章一定對不上。這是最常見的踩雷點。

**先回 200 的理由**

LINE 要求 Webhook 快速回應。LLM 分析要 5–15 秒，等它做完才回 200 會被 LINE 判定逾時並重送，造成使用者收到兩份診斷。`Respond to Webhook` 節點必須放在所有耗時節點之前。

**handle-freetext 分支**

```
[Code: 關鍵字比對]
  ├── /handled|/release|/done/ 且來自顧問 → 更新 state
  ├── /找真人|客服|專人|電話/ → [Execute WF-4 (handoff)]
  ├── /刪除我的資料|退出|不要再傳/ → [WF: privacy-request]
  ├── state 在 LEAD_1/LEAD_2 → 當作答案存入 [Execute WF-4]
  └── 其他 → [Reply: 「我先把診斷跑完⋯」+ 重發當前題目]
```

---

## WF-2｜diagnostic-engine

```
[Execute Workflow Trigger]
      ↓
[Code: 解析 postback data → {type, qid, value}]
      ↓
[Supabase: SELECT user + 最新 IN_PROGRESS session]
      ↓
[IF: 有進行中的 session?]
      ├── 無 → [Supabase: INSERT diagnostic_sessions]
      └── 有 → 繼續
      ↓
[IF: state 與 postback 的 qid 相符?]        ← 防呆：使用者點了舊訊息的按鈕
      ├── 不符 → [Reply: 「這是上一題的選項，我們已經到下一題了」+ 重發當前題目] ⛔
      └── 相符 → 繼續
      ↓
[Supabase: INSERT answers (ON CONFLICT DO NOTHING)]
      ↓
[Code: 狀態機 nextState()]
      ↓
[Switch: nextState 是否為 DIAG_GENERATING?]
      ├── 否 → [Code: 組下一題 message + quickReply]
      │           ↓
      │        [HTTP: LINE Reply API]
      │           ↓
      │        [Supabase: UPDATE users SET current_state]
      │
      └── 是 → [HTTP: LINE Reply API（過場訊息）]
                  ↓
               [Supabase: UPDATE session completed_all, completed_at]
                  ↓
               [Execute WF-3: ai-analysis]
```

### 狀態機 Code node

```javascript
const FLOW = {
  GM: ['Q_GM_1','Q_GM_2','Q_GM_3','Q_U_1'],
  AX: ['Q_AX_1','Q_AX_2','Q_AX_3'],
  PO: ['Q_PO_1','Q_PO_2','Q_U_1'],
  CT: ['Q_CT_1','Q_CT_2','Q_CT_3','Q_U_1'],
  BC: ['Q_BC_1','Q_BC_2','Q_U_1'],
};

const DS_MATRIX = {
  revenue:  { overloaded:'PO', underdemand:'GM', plateau:'BC', solo:'GM' },
  process:  { overloaded:'PO', underdemand:'PO', plateau:'PO', solo:'AX' },
  strategy: { overloaded:'BC', underdemand:'BC', plateau:'BC', solo:'BC' },
  team:     { overloaded:'CT', underdemand:'CT', plateau:'CT', solo:'CT' },
  content:  { overloaded:'AX', underdemand:'GM', plateau:'GM', solo:'AX' },
  ai:       { overloaded:'AX', underdemand:'AX', plateau:'AX', solo:'AX' },
};

function nextState(session, answers) {
  const cur = session.current_state;

  if (cur === 'SEG_SELECT') {
    const seg = answers.SEG;
    if (seg === 'DS') return { state: 'Q_DS_1', segment: 'DS' };
    return { state: FLOW[seg][0], segment: seg };
  }

  if (cur === 'Q_DS_1') return { state: 'Q_DS_2', segment: 'DS' };

  if (cur === 'Q_DS_2') {
    const routed = DS_MATRIX[answers.DS1][answers.DS2];
    return { state: FLOW[routed][0], segment: routed, routedFrom: 'DS', dsShort: true };
  }

  const seg  = session.current_segment;
  const path = FLOW[seg];
  const idx  = path.indexOf(cur);

  // Discovery 路由過來的只問該 Segment 第 1 題，直接跳 U1
  if (session.routed_from === 'DS' && idx === 0) {
    return seg === 'AX' ? { state: 'DIAG_GENERATING' } : { state: 'Q_U_1', segment: seg };
  }
  if (cur === 'Q_U_1' || idx === path.length - 1) return { state: 'DIAG_GENERATING' };
  return { state: path[idx + 1], segment: seg };
}
```

### 題庫資料

題目文字、選項、承接句全部放在 n8n 的一個 **Static Data / Set node** 或 Supabase 的 `questions` 設定表。**不要寫死在十幾個 IF node 裡。** 文案一定會改，改題目不該需要改流程圖。

建議做法：建一張 `question_bank` 表，欄位 `question_id, state, prompt_text, transition_text, options jsonb, order_no`，n8n 用一次查詢取出組訊息。非工程師（執行長或企劃）可以直接在 Supabase Table Editor 改文案。

---

## WF-3｜ai-analysis

```
[Execute Workflow Trigger]
      ↓
[Supabase: SELECT answers WHERE session_id]
      ↓
[Code: 聚合 + 白名單過濾 + 計算 AI Ready Score]
      ↓
[Supabase: INSERT diagnostics（先寫分數，AI 欄位留空）]
      ↓
[HTTP: Anthropic Messages API]
      │  timeout 25s, retry 1
      ├── 失敗 → [HTTP: OpenAI API（備援）]
      │              └── 再失敗 → [Code: 降級輸出] → 標記 needs_regeneration
      ↓
[Code: parse JSON + 驗證（長度、欄位、禁用詞）]
      ├── 驗證失敗 → 重試一次 → 仍失敗 → 降級輸出
      ↓
[Supabase: UPDATE diagnostics SET 分析欄位]
      ↓
[Code: 組 Flex Message JSON]
      ↓
[HTTP: LINE Push API]（不用 Reply，Token 可能已過期）
      ↓
[HTTP: LINE Push API（文字版分析）]
      ↓
[Supabase: UPDATE users SET current_state='DIAG_SENT']
      ↓
[Supabase: INSERT user_tags（DIAG_COMPLETED, AI_LEVEL_x, SERVICE_x）]
      ↓
[Supabase: INSERT followups（D1 / D3 / D7 排程）]
      ↓
[HTTP: LINE Rich Menu 切換為「已診斷」版]
```

### 為什麼先寫入分數再呼叫 LLM

如果 LLM 掛掉、n8n 重啟、或流程中斷，至少分數已經落地，重生成排程可以撿起來繼續。這是把「不可靠的外部呼叫」跟「可靠的內部計算」分開的基本做法。

---

## WF-4｜lead-qualification

```
[Execute Workflow Trigger]
      ↓
[Switch: state]
      ├── DIAG_SENT + cta=consult → [Reply: Lead 開場] → state=LEAD_1
      ├── DIAG_SENT + cta=later   → state=NURTURE → [Reply: 追蹤說明]
      ├── DIAG_SENT + cta=solutions → [Tag: VIEWED_SOLUTIONS] (URI action 不進 webhook，靠 LIFF 或短網址追蹤)
      ├── LEAD_1..LEAD_8 → [存答案] → [下一題] 
      └── LEAD_8 完成 → 繼續往下
      ↓
[Supabase: INSERT/UPDATE companies]
      ↓
[Supabase: SELECT diagnostics + session]
      ↓
[Code: calcLeadScore()]
      ↓
[Supabase: INSERT leads（含 score_breakdown, sla_due_at）]
      ↓
[Supabase: INSERT user_tags（等級、角色、規模、產業、時程、預算）]
      ↓
[HTTP: LINE Push（完成訊息，SLA 文案依等級變化）]
      ↓
[Switch: status]
      ├── HOT  → [Slack: #leads-hot @channel] + [Gmail: 顧問信箱] + [Supabase: sla_due_at = now()+2h]
      ├── WARM → [Slack: #leads] + [sla_due_at = now()+24h]
      └── NURTURE → [Supabase: followups 排程]
      ↓
[Supabase: UPDATE users SET current_state='HANDOFF'（HOT/WARM）或 'NURTURE']
      ↓
[HTTP: LINE 官方帳號標籤 API（同步 6 個關鍵 Tag）]
```

---

## WF-5｜scheduler

四個 Cron 分支。

### 5.1 Follow-up 發送（每 15 分鐘）

```
[Cron: */15 * * * *]
      ↓
[Supabase: SELECT followups WHERE scheduled_at <= now() AND sent_at IS NULL AND cancelled_at IS NULL]
      ↓
[Supabase: 檢查 users.current_state]
      ↓
[IF: state IN ('HANDOFF') OR do_not_contact OR is_blocked]
      ├── 是 → [UPDATE followups SET cancelled_at, cancel_reason='handed_off'] ⛔
      └── 否 → 繼續
      ↓
[Code: 組訊息（帶入該使用者的診斷內容）]
      ↓
[HTTP: LINE Push API]
      ↓
[Supabase: UPDATE followups SET sent_at]
```

**取消檢查一定要做。** 顧問已經在跟客戶談，自動訊息插進來會很尷尬。

### 5.2 逾時回收（每小時）

```
[Cron: 0 * * * *]
      ├── [SELECT sessions WHERE status='IN_PROGRESS' AND started_at < now()-24h AND 未提醒]
      │       → Push 一次提醒「你上次做到一半」→ 標記已提醒
      └── [SELECT sessions WHERE status='IN_PROGRESS' AND started_at < now()-48h]
              → UPDATE status='ABANDONED' → Tag DIAG_ABANDONED → state='ABANDONED'
```

### 5.3 診斷重生成（每 15 分鐘）

```
[Cron: */15 * * * *]
      ↓
[SELECT diagnostics WHERE needs_regeneration = true AND created_at > now()-24h]
      ↓
[Execute WF-3 的 LLM 分支]
      ↓ 成功 → [Push 完整版] + [UPDATE needs_regeneration=false]
```

### 5.4 SLA 逾期與日報（每小時 / 每日 09:00）

```
[Cron: 0 * * * *]  → [SELECT leads WHERE sla_due_at < now() AND contact_status='NEW']
                        → [Slack: @執行長 逾期提醒]

[Cron: 0 1 * * *（UTC，即台灣 09:00）]
                     → [SELECT * FROM v_daily_funnel LIMIT 7]
                        → [Slack: 每日漏斗報表]
                        → [Google Sheets: 同步名單給顧問]
```

---

## 錯誤處理節點設定

每個 Workflow 都設 **Error Workflow**（n8n Settings → Error Workflow），指向一個共用的 `error-handler`：

```
[Error Trigger]
      ↓
[Supabase: INSERT events (event_type='error', payload=$json)]
      ↓
[IF: 錯誤發生在使用者對話流程中?]
      ├── 是 → [LINE Push: 「這邊出了點狀況⋯要不要重試一次？」]
      └── 否 → [NoOp]
      ↓
[Slack: #alerts 通知（含 execution URL）]
```

每個 HTTP Request node 都要設：`Retry On Fail = true`、`Max Tries = 2`、`Continue On Fail = true`，讓流程能走到錯誤分支而不是整個中斷。
