# 01｜系統架構與環境設定

## 1. 架構原則

先能上線，再談擴充。MVP 只用五個元件：

```
LINE Platform ── Webhook ──► n8n ──► Supabase (Postgres)
                              │
                              ├──► Claude API (診斷分析)
                              ├──► Slack Webhook (HOT LEAD 通知)
                              └──► LINE Messaging API (Reply / Push)
```

不做 API Gateway、不做微服務、不自建前端。n8n 同時扮演 Webhook Server、State Machine、排程器三個角色。

---

## 2. 元件選型與理由

| 元件 | 選用 | 理由 | 替代方案 |
|---|---|---|---|
| 對話通道 | LINE Messaging API | 台灣中小企業主唯一天天開的 App | — |
| 流程引擎 | n8n（self-host on Zeabur / Render） | 視覺化、好交接、非工程師可改文案 | Make.com（節點貴）、自寫 Node.js |
| 資料庫 | Supabase Postgres | 有 REST API、免費額度夠、支援 RLS | Airtable（列數上限）、Google Sheets（併發會爆） |
| LLM | Claude API（`claude-sonnet-5`） | 中文商業分析語感穩、JSON 輸出可靠 | OpenAI GPT 當備援 |
| 通知 | Slack Incoming Webhook + Gmail | 顧問已在用 Slack | LINE Notify（已停止服務，不要用） |
| 監控 | n8n Execution Log + Supabase `events` 表 | 夠用 | Sentry |

**不要用 Google Sheets 當主資料庫。** 診斷流程每個使用者會寫入 8–15 筆答案，Sheets 的併發寫入會掉資料。Sheets 只適合當「顧問看的唯讀報表」，用 n8n 每小時同步一次。

---

## 3. LINE Messaging API 設定清單

### 3.1 Channel 設定（LINE Developers Console）

| 項目 | 值 | 說明 |
|---|---|---|
| Channel 類型 | Messaging API | 掛在知育的 Provider 下 |
| Channel Secret | `LINE_CHANNEL_SECRET` | 用於 Webhook 簽章驗證 |
| Channel Access Token | `LINE_CHANNEL_ACCESS_TOKEN` | 建議用 Stateless Channel Access Token（v2.1），有效期 15 分鐘、自動換發 |
| Webhook URL | `https://n8n.zhiyu.tw/webhook/line/inbound` | 必須 HTTPS、必須回 200 |
| Use webhook | ON | |
| Webhook redelivery | ON | 網路瞬斷時 LINE 會重送 |
| Error statistics aggregation | ON | |

### 3.2 LINE Official Account Manager 設定

| 項目 | 值 | 理由 |
|---|---|---|
| 回應模式 | 聊天機器人 + 手動聊天（混合） | 顧問要能隨時接手 |
| 自動回應訊息 | **關閉** | 會跟 Webhook 打架，重複發訊息 |
| 加入好友的歡迎訊息 | **關閉** | 歡迎訊息改由 Webhook 的 follow event 發送，才能帶 Quick Reply 和 Source |
| 聊天室相關設定 → Webhook | ON | |
| 圖文選單 (Rich Menu) | 兩格：`重新診斷` / `找顧問聊聊` | 診斷完成後才切換 Rich Menu |

### 3.3 必要的環境變數

```bash
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
LINE_OA_BASIC_ID=@520vqabi

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

ANTHROPIC_API_KEY=
OPENAI_API_KEY=              # 備援

SLACK_WEBHOOK_URL=
CONSULTANT_EMAIL=

N8N_WEBHOOK_BASE=https://n8n.zhiyu.tw
LIFF_ID=                      # V1.5 才需要
```

---

## 4. LINE API 限制對照表（開發前必讀）

這幾條限制直接決定 UI 設計，不要等到開發到一半才發現。

| 限制 | 數值 | 對設計的影響 |
|---|---|---|
| Quick Reply 項目數 | 最多 13 個 | 第一層六選一沒問題，診斷題目最多不超過 8 選項 |
| Quick Reply label 長度 | 20 字元 | 「想導入 AI，但不知道怎麼開始」超過 → 必須縮短成「想導入 AI 但沒方向」 |
| Postback `data` 長度 | 300 bytes | 用短代碼，不要塞 JSON 全文 |
| 單次 Reply 訊息數 | 5 則 | 診斷結果用 1 則 Flex + 1 則文字，夠用 |
| Reply Token 有效期 | 約 1 分鐘、只能用一次 | LLM 生成要 5–15 秒，會超時風險 → 診斷結果改用 Push Message |
| Flex Message `altText` | 400 字元 | 通知列顯示用，寫摘要 |
| Flex Bubble JSON 大小 | 10 KB | 單一 bubble 夠用 |
| Push Message 免費額度 | 輕用量方案 200 則/月 | Follow-up 一人 3 則 → 66 人就爆。**上線前必須升級到中用量以上** |
| Webhook 回應時間 | 建議 1 秒內回 200 | n8n 必須「先回 200，再非同步處理」 |
| Rich Menu 數量 | 1000 個 | 夠用 |

### 4.1 Reply Token 超時的正確處理

LLM 生成診斷需要 5–15 秒，Reply Token 雖然是 1 分鐘，但 Webhook 必須先回 200。正確做法：

1. Webhook 收到最後一題的 postback → **立刻用 Reply Token 回一則「正在分析中」的過場訊息**
2. 非同步分支呼叫 LLM
3. 生成完成 → 用 **Push Message** 發送 Flex 診斷結果

過場訊息本身就是體驗的一部分，不是敷衍：

> 收到。我正在把你剛剛的回答跟我們手上的企業案例對照，大概 15 秒。

---

## 5. 資料流（Sequence）

```
使用者                LINE            n8n              Supabase        Claude API
  │                    │               │                   │               │
  │── 加好友 ─────────►│               │                   │               │
  │                    │── follow ────►│                   │               │
  │                    │               │── upsert user ───►│               │
  │                    │◄── reply ─────│                   │               │
  │◄── 歡迎+QuickReply │               │                   │               │
  │                    │               │                   │               │
  │── 點選項 ─────────►│               │                   │               │
  │                    │── postback ──►│                   │               │
  │                    │               │── get state ─────►│               │
  │                    │               │── save answer ───►│               │
  │                    │◄── reply ─────│                   │               │
  │◄── 下一題          │               │                   │               │
  │        （重複 2–3 輪）             │                   │               │
  │                    │               │                   │               │
  │── 最後一題 ───────►│               │                   │               │
  │                    │── postback ──►│                   │               │
  │                    │◄── reply ─────│  (過場訊息)        │               │
  │◄── 分析中…         │               │── aggregate ─────►│               │
  │                    │               │── analyze ────────────────────────►│
  │                    │               │◄── JSON ───────────────────────────│
  │                    │               │── save diagnostic►│               │
  │                    │               │── lead score ────►│               │
  │                    │◄── push ──────│                   │               │
  │◄── Flex 診斷結果   │               │                   │               │
```

---

## 6. 部署與環境

| 環境 | 用途 | LINE Channel |
|---|---|---|
| `dev` | 開發測試 | 另開一個測試用 Messaging API Channel，**不要用正式帳號測試** |
| `prod` | 正式 | `@520vqabi` |

n8n 建議部署在 Zeabur 或 Render 的最小方案（月費約 USD 5–10）。Supabase 免費方案（500 MB）可撐約 20,000 次診斷，超過再升級。

**成本估算（月 300 人完成診斷）**

| 項目 | 成本 |
|---|---|
| n8n 主機 | NT$ 300 |
| Supabase | NT$ 0（免費額度內） |
| Claude API（300 次 × 約 2,500 tokens） | NT$ 150 |
| LINE 官方帳號中用量方案 | NT$ 1,200 |
| **合計** | **約 NT$ 1,650 / 月** |

一個成交的企業輔導案就回本超過 100 倍。
