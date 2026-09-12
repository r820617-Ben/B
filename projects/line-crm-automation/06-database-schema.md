# 06｜資料表設計說明與隱私

DDL 見 `06-database-schema.sql`。

## 1. 資料表關係

```
users (1) ──< diagnostic_sessions (N) ──< answers (N)
  │                    │
  │                    └──(1)── diagnostics
  │
  ├──< companies (N)
  ├──< leads (N) ────────► 關聯 session + company
  ├──< user_tags (N)
  ├──< followups (N)
  └──< events (N)
```

**設計重點：診斷是 session-based，不是 user-based。** 同一個人半年後重測，會產生新的 session 和新的 diagnostics，舊的保留。這樣才能看出企業的進步幅度，也是 V2「Re-diagnosis」功能的前提。

---

## 2. 關鍵欄位說明

### `users.current_state`
整個系統的核心。所有 webhook 進來第一件事就是讀這個欄位。用 `text` 不用 enum，因為狀態會隨著題目增減而變動，enum 改欄位要停機。

### `users.source`
只在 follow event 寫入一次，之後不覆蓋。使用者封鎖再加回來會產生新的 follow event，這時才更新，並在 `source_detail` 保留歷史。

### `answers` 的 `unique (session_id, question_id)`
防止重複作答。使用者連點兩次 Quick Reply（手機常見）會送兩次 postback，靠這個唯一鍵擋掉。n8n 用 `ON CONFLICT DO NOTHING`。

### `events.webhook_event_id`
LINE 的 webhook redelivery 會重送同一個 event。`idx_events_dedupe` 這個唯一索引是冪等的關鍵。n8n 收到 webhook 第一件事就是嘗試寫入 events，寫入衝突就直接回 200 並結束，不做任何處理。

### `diagnostics.raw_response`
保留 LLM 原始回傳。Prompt 調整後要比對品質差異時，這是唯一的依據。約佔每列 3 KB，免費方案可存約 15 萬筆。

### `leads.score_breakdown`
不要只存總分。顧問問「為什麼這是 HOT」的時候，要能一秒回答。

### `user_tags` 只加不刪
`revoked_at` 而不是 `DELETE`。Lead 從 NURTURE 升到 WARM 是有價值的資訊，刪掉就沒了。

---

## 3. 索引策略

| 索引 | 用途 | 查詢頻率 |
|---|---|---|
| `users.line_user_id` (unique) | 每個 webhook 都要查 | 最高 |
| `idx_users_state` | 逾時掃描（找 48 小時未動的 session） | 每小時 |
| `idx_followups_due` (partial) | 排程掃描 | 每 15 分鐘 |
| `idx_events_dedupe` (partial unique) | 冪等檢查 | 每個 webhook |
| `idx_leads_sla` (partial) | SLA 逾期提醒 | 每小時 |

Partial index（帶 `where` 條件）在這裡很重要。`followups` 表會累積十萬列，但待發送的永遠只有幾十列。

---

## 4. Row Level Security

Supabase 預設開 RLS。這套系統的寫入全部來自 n8n（server-side），使用 **Service Role Key**，繞過 RLS。

**Service Role Key 絕對不能出現在任何前端、LIFF 頁面、或 GitHub。** 只存在 n8n 的 Credential 裡。

V2 做 LIFF 報告頁時，才需要設計 RLS policy：使用者只能讀自己 `line_user_id` 對應的 diagnostics，透過 LINE Login 取得的 JWT 驗證。

---

## 5. 資料隱私設計

### 5.1 蒐集原則

| 原則 | 實作 |
|---|---|
| 最小化 | 診斷階段完全不問姓名、電話、公司。只有使用者主動選「交給顧問」才開始問 |
| 目的明確 | 歡迎訊息第二則就寫清楚用途 |
| 可撤回 | 輸入「刪除我的資料」觸發刪除流程 |
| 不外流 | 資料不傳給廣告平台、不做 Custom Audience 上傳 |

### 5.2 明確不蒐集

身分證字號、財務報表、客戶名單、員工個資、生物特徵。診斷模型不需要這些，多存一筆就多一份風險。

### 5.3 LLM 傳送的內容

送到 Claude API 的只有：

- 使用者選擇的選項代碼與標籤
- 計算出的分數
- 來源頁面

**不送：** LINE User ID、顯示名稱、公司名稱、Email、電話。

送出前在 n8n 做一次白名單過濾，只挑允許的欄位組 Prompt，不要直接把整個 row 丟進去。

Anthropic API 預設不使用 API 輸入內容訓練模型，這點要寫進隱私政策讓客戶安心。

### 5.4 保留期限

| 資料 | 期限 | 處理 |
|---|---|---|
| `answers` / `diagnostics` | 24 個月 | 保留（去識別化後可做產業對標） |
| `leads.contact_email` / `contact_phone` | 24 個月 | 清空 |
| `users.display_name` / `picture_url` | 24 個月 | 清空 |
| `users.line_user_id` | 24 個月 | 雜湊化 |
| `events.payload` | 90 天 | 刪除（只留 event_type 與時間） |

`anonymize_stale_users()` 每月 1 號排程執行。

### 5.5 刪除請求處理流程

1. 使用者輸入「刪除我的資料」
2. 機器人確認一次（避免誤觸）
3. 確認後：`users.do_not_contact = true`、立即執行該 user 的匿名化、取消所有 followups
4. Slack 通知，顧問確認
5. 3 個工作天內完成，回覆使用者一則確認訊息

---

## 6. 報表查詢範例

**本月各 Segment 的完成率**

```sql
select segment,
       count(*) as started,
       count(*) filter (where status = 'COMPLETED') as completed,
       round(100.0 * count(*) filter (where status = 'COMPLETED') / count(*), 1) as rate
from diagnostic_sessions
where started_at >= date_trunc('month', now())
group by segment
order by rate desc;
```

**哪一題流失最多（找出該砍的題目）**

```sql
select a.question_id, count(*) as reached,
       count(*) filter (where s.status = 'ABANDONED') as dropped,
       round(100.0 * count(*) filter (where s.status = 'ABANDONED') / count(*), 1) as drop_rate
from answers a
join diagnostic_sessions s on s.id = a.session_id
group by a.question_id
order by drop_rate desc;
```

**AI 成熟度分布（做簡報和貼文用的素材）**

```sql
select maturity_name, count(*),
       round(100.0 * count(*) / sum(count(*)) over (), 1) as pct
from diagnostics
group by maturity_name
order by count(*) desc;
```

第三個查詢的結果，累積到 200 筆以上就是一份可以直接發的產業報告。這是這套系統的隱藏資產。
