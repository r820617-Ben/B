# 05｜Lead Scoring、CRM Tag 與 Human Handoff

## 1. Lead Scoring Logic

Lead Score 與 AI Ready Score 是兩件事，不要混在一起。

| | AI Ready Score | Lead Score |
|---|---|---|
| 衡量 | 這間公司導入 AI 的條件 | 這個人現在有多接近成交 |
| 給誰看 | 使用者 | 顧問 |
| 何時算 | 診斷完成時 | Lead Qualification 完成時 |
| 範圍 | 0–100 | 0–100 |

一間 AI Ready Score 只有 35 分的公司，可能是最好的 Lead（有預算、有急迫性、老闆親自來問）。

### 1.1 加分項

| 維度 | 條件 | 分數 |
|---|---|---|
| **導入時程** | 立即 | +25 |
| | 1–3 個月 | +20 |
| | 3–6 個月 | +10 |
| | 只是了解 | 0 |
| **決策權** | 負責人 / 執行長 / 總經理 | +20 |
| | 副總 / 總監 / 協理 | +15 |
| | 經理 / 主管 | +10 |
| | 專員 / 助理 | 0 |
| **預算** | 30 萬以上 | +25 |
| | 10–30 萬 | +20 |
| | 5–10 萬 | +12 |
| | 5 萬以下 | +5 |
| | 尚未確認 | 0 |
| **公司規模** | 50 人以上 | +15 |
| | 20–49 人 | +10 |
| | 6–19 人 | +5 |
| | 1–5 人 | 0 |
| **需求明確度** | 診斷 + Lead 全部完成，且需求非「只是了解」 | +10 |
| **參與度** | 完成全部診斷題（未中斷） | +5 |
| **來源意圖** | 從服務頁進入（AI / Training / Consulting） | +5 |
| | 從案例頁進入 | +3 |
| | 從首頁進入 | 0 |
| **AI 成熟度** | Level 2–4（有動能但缺系統，最好談） | +8 |
| | Level 5 | +3 |
| | Level 0–1 | 0 |

`lead_score = min(100, Σ 加分 + Σ 扣分)`

### 1.2 扣分項（避免業務跑錯對象）

| 條件 | 分數 | 判斷來源 |
|---|---|---|
| 產業選「學生 / 個人」 | −30 | LEAD3 |
| 職稱包含「學生」「求職」「顧問同業」 | −25 | LEAD4 自由文字 |
| 公司規模 1–5 人 且 預算「5 萬以下」 | −15 | LEAD5 × LEAD7 |
| 同一 LINE User ID 24 小時內第 3 次以上重測 | −10 | `diagnostic_sessions` 計數 |

### 1.3 分級與 SLA

| 分數 | 等級 | 通知方式 | 顧問 SLA | 首次接觸腳本 |
|---|---|---|---|---|
| 80–100 | **HOT** | Slack `#leads-hot` @channel + Email | 上班時間 2 小時內、非上班時間隔日上午 | 直接約 30 分鐘線上會議 |
| 50–79 | **WARM** | Slack `#leads` 一般訊息 | 24 小時內 | 先傳一份對應案例，再問要不要聊 |
| 0–49 | **NURTURE** | 每日彙總報表 | 不主動打擾 | 進 Day 1/3/7 內容流程 |

### 1.4 Pseudocode

```javascript
function calcLeadScore(lead, diagnostic, session) {
  const TIMELINE = { now: 25, m1to3: 20, m3to6: 10, exploring: 0 };
  const ROLE     = { owner: 20, vp: 15, manager: 10, staff: 0 };
  const BUDGET   = { b30plus: 25, b10to30: 20, b5to10: 12, b_lt5: 5, unknown: 0 };
  const SIZE     = { s50plus: 15, s20to49: 10, s6to19: 5, s1to5: 0 };
  const SOURCE   = { WEBSITE_AI: 5, WEBSITE_TRAINING: 5, WEBSITE_CONSULTING: 5,
                     WEBSITE_MARKETING: 5, WEBSITE_CASE: 3, WEBSITE_HOME: 0, UNKNOWN: 0 };

  let s = 0;
  s += TIMELINE[lead.timeline] ?? 0;
  s += ROLE[lead.role_tier]    ?? 0;
  s += BUDGET[lead.budget]     ?? 0;
  s += SIZE[lead.company_size] ?? 0;
  s += SOURCE[session.source]  ?? 0;

  if (session.completed_all && lead.timeline !== 'exploring') s += 10;
  if (session.completed_all) s += 5;

  const lv = parseInt(String(diagnostic.maturity_level).replace('L', ''), 10);
  if (lv >= 2 && lv <= 4) s += 8;
  else if (lv === 5) s += 3;

  if (lead.industry === 'personal')            s -= 30;
  if (/學生|求職|同業/.test(lead.role_raw||'')) s -= 25;
  if (lead.company_size === 's1to5' && lead.budget === 'b_lt5') s -= 15;
  if (session.retest_count_24h >= 3)            s -= 10;

  const score  = Math.max(0, Math.min(100, s));
  const status = score >= 80 ? 'HOT' : score >= 50 ? 'WARM' : 'NURTURE';
  return { score, status };
}
```

### 1.5 分數要能被解釋

寫入 `leads.score_breakdown` 一個 JSON，記錄每一項得分。Slack 通知直接列出來，顧問才知道為什麼這是 HOT：

```json
{
  "timeline": { "value": "m1to3", "points": 20 },
  "role": { "value": "owner", "points": 20 },
  "budget": { "value": "b10to30", "points": 20 },
  "size": { "value": "s20to49", "points": 10 },
  "completed": { "value": true, "points": 15 },
  "maturity": { "value": "L3", "points": 8 },
  "source": { "value": "WEBSITE_AI", "points": 5 },
  "total": 98
}
```

---

## 2. CRM Tag 結構

Tag 同時寫在兩個地方：

1. **Supabase `user_tags` 表** — 給 n8n 和報表用，是真正的來源
2. **LINE 官方帳號的「標籤」功能** — 給顧問在聊天室手動看，只同步關鍵的 6 個

### 2.1 完整 Tag 清單

| 類別 | Tag | 寫入時機 |
|---|---|---|
| **來源** | `SOURCE_WEBSITE` | follow event |
| | `SOURCE_WEBSITE_AI` | follow，帶 Source |
| | `SOURCE_WEBSITE_TRAINING` | 同上 |
| | `SOURCE_WEBSITE_CONSULTING` | 同上 |
| | `SOURCE_WEBSITE_MARKETING` | 同上 |
| | `SOURCE_WEBSITE_CASE` | 同上 |
| | `SOURCE_OFFLINE` | 手動（實體課、展場） |
| | `SOURCE_REFERRAL` | 手動 |
| **服務意向** | `SERVICE_AI` | 診斷完成，依 `primary_service` |
| | `SERVICE_MARKETING` | 同上 |
| | `SERVICE_CONSULTING` | 同上 |
| | `SERVICE_TRAINING` | 同上 |
| | `SERVICE_AUTOMATION` | Segment = PO，或 AX2 選 `admin`/`data` |
| **AI 成熟度** | `AI_LEVEL_0` ~ `AI_LEVEL_5` | 診斷完成 |
| **Lead 等級** | `HOT_LEAD` / `WARM_LEAD` / `NURTURE` | Lead Scoring 完成 |
| **角色** | `DECISION_MAKER` | LEAD4 = owner / vp |
| | `INFLUENCER` | LEAD4 = manager |
| **公司規模** | `SME`（1–49 人） | LEAD5 |
| | `ENTERPRISE`（50 人以上） | LEAD5 |
| **產業** | `IND_FOOD` `IND_RETAIL` `IND_MFG` `IND_SERVICE` `IND_EDU` `IND_MEDICAL` `IND_B2B` `IND_OTHER` | LEAD3 |
| **時程** | `TIMELINE_NOW` `TIMELINE_Q` `TIMELINE_H` `TIMELINE_EXPLORING` | LEAD6 |
| **預算** | `BUDGET_HIGH`（10 萬以上）/ `BUDGET_MID`（5–10 萬）/ `BUDGET_LOW` / `BUDGET_UNKNOWN` | LEAD7 |
| **流程狀態** | `DIAG_COMPLETED` | 診斷送出 |
| | `DIAG_ABANDONED` | 48 小時未完成 |
| | `LEAD_SUBMITTED` | Lead 資料收齊 |
| | `CONTACTED` | 顧問手動標記 |
| | `MEETING_BOOKED` | 顧問手動標記 |
| | `PROPOSAL_SENT` | 顧問手動標記 |
| | `WON` / `LOST` | 顧問手動標記 |
| **行為** | `VIEWED_SOLUTIONS` | 點「看解決方案」 |
| | `RETESTED` | 重做診斷 |
| | `FOLLOWUP_D1_OPENED` 等 | Follow-up 有回應 |

### 2.2 同步到 LINE 官方帳號的 6 個 Tag

LINE 標籤數量上限與管理成本考量，只同步顧問在聊天室當下需要看的：

`HOT_LEAD`、`WARM_LEAD`、`DECISION_MAKER`、`SERVICE_AI`、`SERVICE_TRAINING`、`TIMELINE_NOW`

其餘一律在 Supabase 與 Slack 卡片上呈現。

### 2.3 Tag 命名規則

- 全大寫、底線分隔
- 前綴表示類別（`SOURCE_` `SERVICE_` `AI_LEVEL_` `IND_` `TIMELINE_` `BUDGET_`）
- 不用中文 Tag。中文在 n8n 的條件判斷容易踩到編碼問題
- Tag 只加不改。等級變動時新增 `WARM_LEAD` 並把舊的 `NURTURE` 設 `revoked_at`，保留歷史

---

## 3. Human Handoff Logic

### 3.1 觸發條件

| 觸發 | 動作 | 機器人是否停止 |
|---|---|---|
| 使用者點「交給顧問」並完成 LEAD8 | 建立 Lead、通知顧問、state → `HANDOFF` | 停止自動回覆 |
| 使用者輸入「找真人」「客服」「專人」「電話」 | 即刻通知 Slack、state → `HANDOFF` | 停止 |
| 使用者連續 2 則自由文字（非選項） | 通知 Slack，機器人發一則「我幫你轉給顧問」 | 停止 |
| 使用者輸入負面關鍵字（「不要再傳」「退訂」「檢舉」） | 通知 Slack、標記 `DO_NOT_CONTACT` | 停止且不再 Follow-up |
| HOT LEAD 產生 | 通知 Slack | 不停止（仍走 Follow-up） |

### 3.2 顧問接手流程

1. Slack 收到卡片（含診斷摘要、Lead Score 分項、LINE 聊天室深連結）
2. 顧問點連結 → 開啟 LINE 官方帳號後台該使用者的聊天室
3. 在 LINE Official Account Manager 把該聊天室切到「聊天模式」
4. 顧問在聊天室輸入 `/handled` → n8n 偵測到後把 state 設為 `HANDOFF`，停止所有自動訊息
5. 案件結束後顧問輸入 `/done won` 或 `/done lost` → 寫回 `leads.contact_status`

**第 4 步的 `/handled` 指令很重要。** 沒有這個機制，顧問在跟客戶講話的同時，Day 3 的自動追蹤訊息會插進來，非常尷尬。

### 3.3 Slack 通知卡片格式

```
🔥 HOT LEAD｜{{company_name}}

{{name}}｜{{role}}｜{{industry}}｜{{company_size}}
Lead Score {{lead_score}}/100　AI Ready {{ai_ready_score}}/100（{{maturity_name}}）

需求　{{segment_label}}
時程　{{timeline_label}}
預算　{{budget_label}}

AI 診斷摘要
{{insight}}

建議切入
{{primary_service_label}}　→　{{next_step_title}}

得分明細　時程 +{{p_timeline}}｜決策 +{{p_role}}｜預算 +{{p_budget}}｜規模 +{{p_size}}

[ 開啟 LINE 聊天室 ]　[ 看完整診斷 ]
```

SLA 提醒：HOT LEAD 建立後 2 小時內若沒有顧問在 Slack 上按「我接」，n8n 自動 @ 執行長。

### 3.4 回到機器人

顧問輸入 `/release` → state 從 `HANDOFF` 回到 `NURTURE`，重新啟用自動追蹤。
