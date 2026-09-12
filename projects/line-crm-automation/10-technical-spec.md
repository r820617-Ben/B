# 10｜Technical Spec（可直接交付工程師）

## 0. 一頁摘要

建一個 LINE 官方帳號的對話式企業診斷系統。使用者加好友後回答 3–4 題，系統用規則計算 AI Ready Score，用 LLM 生成瓶頸分析，以 Flex Message 回傳。有意願的使用者再收集 8 項資料，計算 Lead Score，通知顧問接手。

技術棧：LINE Messaging API + n8n + Supabase(Postgres) + Anthropic API + Slack。

工期估計 11–16 個工作天。

---

## 1. Webhook Endpoint 規格

### 1.1 入口

```
POST https://n8n.zhiyu.tw/webhook/line/inbound
Content-Type: application/json
X-Line-Signature: {base64 HMAC-SHA256}
```

### 1.2 回應要求

| 情境 | Status | Body |
|---|---|---|
| 正常 | `200` | `{"ok":true}` |
| 簽章錯誤 | `401` | `{"error":"invalid_signature"}` |
| 其他錯誤 | `200` | `{"ok":true}`（仍回 200，避免 LINE 重送造成重複訊息；錯誤走內部告警） |

**回應時間必須小於 1 秒。** 所有耗時處理放在 `Respond to Webhook` 節點之後。

### 1.3 需處理的 Event Type

| Event | 觸發 | 動作 |
|---|---|---|
| `follow` | 加好友或解除封鎖 | upsert user、發歡迎訊息、state 設 `SEG_SELECT` |
| `unfollow` | 封鎖或刪除好友 | `is_blocked = true`、取消 followups |
| `postback` | 點 Quick Reply 或 Flex 按鈕 | 依 `data` 的 `type` 分派 |
| `message` (text) | 使用者打字 | 關鍵字比對或引導 |
| `message` (其他) | 圖片、貼圖、語音 | 引導訊息 |

其餘 event（`join`、`leave`、`memberJoined` 等）直接忽略。

### 1.4 Postback Data Schema

```
type=seg&v={GM|AX|PO|CT|BC|DS}
type=ans&q={QID}&v={VALUE}
type=cta&v={consult|solutions|later|later_month|stop}
type=lead&q={LEAD1..LEAD8}&v={VALUE}
type=sys&v={resume|restart|privacy|delete_confirm}
```

限制：`data` 不超過 300 bytes。不放 user_id、session_id、簽章。

---

## 2. 內部 API 契約

n8n 內部以 Execute Workflow 呼叫，payload 格式固定。

### 2.1 WF-2 `diagnostic-engine`

**Input**

```json
{
  "line_user_id": "U1234...",
  "user_id": "uuid",
  "reply_token": "abcdef...",
  "postback": { "type": "ans", "q": "GM2", "v": "meta" },
  "event_id": "01H..."
}
```

**Output**

```json
{
  "state_before": "Q_GM_2",
  "state_after": "Q_GM_3",
  "session_id": "uuid",
  "trigger_analysis": false
}
```

### 2.2 WF-3 `ai-analysis`

**Input**

```json
{ "session_id": "uuid", "user_id": "uuid", "line_user_id": "U1234..." }
```

**Output**

```json
{
  "diagnostic_id": "uuid",
  "ai_ready_score": 72,
  "tier": "Buildable",
  "is_fallback": false,
  "pushed": true
}
```

### 2.3 WF-4 `lead-qualification`

**Input**

```json
{
  "line_user_id": "U1234...",
  "user_id": "uuid",
  "reply_token": "abcdef...",
  "postback": { "type": "lead", "q": "LEAD7", "v": "b10to30" },
  "text": null
}
```

**Output**

```json
{ "lead_id": "uuid", "lead_score": 88, "status": "HOT", "notified": true }
```

---

## 3. 外部 API 呼叫

### 3.1 LINE Reply Message

```
POST https://api.line.me/v2/bot/message/reply
Authorization: Bearer {CHANNEL_ACCESS_TOKEN}

{ "replyToken": "...", "messages": [ ... ] }   // messages 最多 5 則
```

### 3.2 LINE Push Message

```
POST https://api.line.me/v2/bot/message/push
Authorization: Bearer {CHANNEL_ACCESS_TOKEN}
X-Line-Retry-Key: {uuid}                       // 防重複發送，必填

{ "to": "U1234...", "messages": [ ... ] }
```

`X-Line-Retry-Key` 用 `session_id + step` 產生固定 UUID，重試時不會重複發送。

### 3.3 Anthropic Messages API

```
POST https://api.anthropic.com/v1/messages
x-api-key: {ANTHROPIC_API_KEY}
anthropic-version: 2023-06-01

{
  "model": "claude-sonnet-5",
  "max_tokens": 1200,
  "temperature": 0.4,
  "system": "{{SYSTEM_PROMPT}}",
  "messages": [
    { "role": "user", "content": "{{USER_PROMPT}}" },
    { "role": "assistant", "content": "{" }
  ]
}
```

回傳的 `content[0].text` 前面補回 `{` 再 `JSON.parse`。

### 3.4 Supabase REST

```
POST   {SUPABASE_URL}/rest/v1/{table}
PATCH  {SUPABASE_URL}/rest/v1/{table}?id=eq.{uuid}
GET    {SUPABASE_URL}/rest/v1/{table}?select=*&line_user_id=eq.{id}

apikey: {SERVICE_ROLE_KEY}
Authorization: Bearer {SERVICE_ROLE_KEY}
Prefer: return=representation,resolution=ignore-duplicates
```

---

## 4. 環境變數清單

見 `01-architecture.md` 第 3.3 節。全部存在 n8n Credentials，不寫在 workflow JSON 裡。

---

## 5. 驗收標準

工程師交付時，以下每一條都要能現場演示。

### 5.1 功能

| # | 驗收項目 | 通過條件 |
|---|---|---|
| 1 | 加好友 | 3 秒內收到兩則歡迎訊息，第二則帶 6 個 Quick Reply |
| 2 | 六條路徑 | GM/AX/PO/CT/BC/DS 各走一次，都能走到診斷結果 |
| 3 | 題數 | 任一路徑從第一題到結果不超過 4 題 |
| 4 | 完成時間 | 熟悉的使用者從加好友到看到結果，60 秒內 |
| 5 | 分數一致性 | 同樣答案重測三次，`ai_ready_score` 完全相同 |
| 6 | 敘述個人化 | 同樣答案重測三次，`insight` 文字不同但判斷方向一致 |
| 7 | Flex 渲染 | iOS 與 Android 上分數條長度正確反映分數 |
| 8 | Lead 流程 | 點「交給顧問」後 8 題，全部完成後 Slack 收到卡片 |
| 9 | Lead Score | 三組預設測資分別落在 HOT / WARM / NURTURE |
| 10 | 顧問接手 | 輸入 `/handled` 後，所有排程 Follow-up 被取消 |
| 11 | 續測 | 中斷 25 小時後回來，收到續測卡片並能接續 |
| 12 | 冪等 | 同一 webhook payload 送兩次，只產生一筆 answer |

### 5.2 容錯

| # | 驗收項目 | 通過條件 |
|---|---|---|
| 13 | LLM 失效 | 故意用錯誤 API Key，使用者仍收到帶個人數據的降級診斷 |
| 14 | 重生成 | 降級後 15 分鐘內，自動補送完整版 |
| 15 | 簽章 | 偽造簽章的請求回 401 且不寫入任何資料 |
| 16 | 連點 | 連點同一選項 5 次，`answers` 只有 1 筆 |
| 17 | 錯位點擊 | 點前一題的按鈕，收到引導訊息，state 不變 |

### 5.3 資料

| # | 驗收項目 | 通過條件 |
|---|---|---|
| 18 | 完整性 | 每個完成的 session 都有對應的 diagnostics 與至少 3 筆 answers |
| 19 | Tag | 診斷完成後自動產生 `DIAG_COMPLETED`、`AI_LEVEL_x`、`SERVICE_x` |
| 20 | 報表 | `v_daily_funnel` 與 `v_lead_board` 兩個 View 有正確資料 |
| 21 | 隱私 | 送到 LLM 的 payload 中不含 line_user_id、姓名、公司名、Email、電話 |
| 22 | 刪除 | 「刪除我的資料」流程完整執行，個資欄位清空 |

### 5.4 效能

| 指標 | 標準 |
|---|---|
| Webhook 回應時間 | P95 小於 500 ms |
| 題目回覆延遲（使用者點選到收到下一題） | P95 小於 1.5 秒 |
| 診斷生成時間 | P95 小於 20 秒 |
| 同時併發 | 30 人同時作答不掉訊息 |

---

## 6. 交付物清單

工程師需交付：

1. n8n workflow JSON 匯出檔 5 個（WF-1 到 WF-5）+ 1 個 error-handler
2. Supabase migration SQL（即 `06-database-schema.sql`，含 seed 的 `question_bank` 資料）
3. `.env.example`
4. README：如何在新環境從零重建（含 LINE Channel 設定步驟截圖）
5. 三組測資的執行紀錄（HOT / WARM / NURTURE 各一）
6. 測試清單勾選完成的截圖

---

## 7. 不在這次範圍內

明確排除，避免範圍蔓延：

- LIFF 網頁版報告
- 官網 Chat Widget
- 自建管理後台
- 多顧問派單邏輯（MVP 只有一個收件匣）
- 付費或簽約流程
- 與 Notion / HubSpot 同步
- 英文版
