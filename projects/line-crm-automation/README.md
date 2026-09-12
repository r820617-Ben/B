# 知育 AI 企業診斷 LINE Funnel｜技術規格總覽

官網 → LINE@ → AI 企業診斷 → 分流 → Lead Qualification → 顧問接手。

LINE 官方帳號：`@520vqabi`　加入連結：https://lin.ee/8Ieo7Rk

---

## 這套系統要證明的一件事

使用者加入好友後 60 秒內，會收到一份根據他自己的回答生成的企業診斷。
不是罐頭訊息，是動態產出的 AI Ready Score、瓶頸判斷、下一步建議。

這就是知育在賣的東西本身。官方帳號是產品的第一個 Demo。

---

## 交付清單

| # | 文件 | 內容 |
|---|---|---|
| 01 | `01-architecture.md` | 系統架構、元件選型、LINE 設定清單、API 限制對照 |
| 02 | `02-flow-question-tree.md` | 全流程 Flowchart、State Machine、Question Tree、Quick Reply 設計 |
| 03 | `03-conversation-copy.md` | 所有對話文案（可直接貼進 n8n） |
| 04 | `04-llm-prompt.md` | System Prompt、User Prompt 模板、輸出 JSON 契約、參數 |
| 05 | `05-lead-scoring-crm.md` | Lead Scoring 演算法、CRM Tag 結構、Human Handoff 規則 |
| 06 | `06-database-schema.sql` / `.md` | Postgres DDL 與欄位說明、隱私設計 |
| 07 | `07-n8n-workflow.md` | n8n 節點逐一規格、分支條件、錯誤路徑 |
| 08 | `08-followup-automation.md` | Day 1 / Day 3 / Day 7 追蹤自動化 |
| 09 | `09-error-handling.md` | 例外情境、降級策略、防呆 |
| 10 | `10-technical-spec.md` | Webhook 規格、內部 API 契約、驗收標準 |
| 11 | `11-website-integration.md` | 官網 CTA、Source Tracking 三種做法與取捨 |
| 12 | `12-line-oa-manager-setup.md` | **無代碼版**：只用 LINE 官方帳號後台，一個下午可上線 |
| — | `flex/*.json` | 可直接使用的 Flex Message JSON |

**先做第 12 份。** 完整版需要工程師 11 到 16 天；無代碼版今天下午就能上線，先收 50 到 100 筆真實回答，再用這些資料校準完整版的題目與文案。

---

## MVP 第一版開發順序

分成 5 個 Sprint，每個 Sprint 結束都有可測試的東西。

### Sprint 1｜骨架能通（2–3 天）
1. LINE Messaging API Channel 建立、Webhook URL 設定、簽章驗證
2. n8n Webhook 節點接收 follow / message / postback 三種 event
3. Supabase 建表（users / sessions / answers）
4. follow event → 寫入 users → 回覆歡迎訊息 + 六選一 Quick Reply

驗收：新帳號加好友，收到歡迎訊息，點任一選項後 DB 有紀錄。

### Sprint 2｜問答狀態機（3–4 天）
5. State Machine 實作（`current_state` 讀寫）
6. 六個 Segment 的 Question Tree（GM/AX/PO/CT/BC/DS）
7. 每題答案寫入 `answers`
8. 答完最後一題 → 狀態切到 `DIAG_GENERATING`

驗收：六條路徑都能從第一題走到最後一題，中途離開再回來能接續。

### Sprint 3｜AI 診斷（2–3 天）
9. 聚合答案 → 組 Prompt → 呼叫 LLM（Claude API 為主，OpenAI 為備援）
10. 解析 JSON 輸出 → 寫入 `diagnostics`
11. 組 Flex Message → 回傳診斷結果
12. LLM 失敗時的規則式降級診斷

驗收：六條路徑各跑三次，輸出內容不同、格式穩定、字數在 200–350 字。

### Sprint 4｜Lead Qualification（2–3 天）
13. 「交給顧問」按鈕 → 逐題收集聯絡資訊
14. Lead Scoring 計算
15. CRM Tag 寫入（DB + LINE 官方帳號標籤）
16. HOT LEAD → Slack + Email 通知顧問

驗收：跑一次完整流程，Slack 收到含診斷摘要的通知卡片。

### Sprint 5｜追蹤與上線（2–3 天）
17. Day 1 / 3 / 7 Follow-up（n8n Schedule Trigger）
18. 官網 CTA 與 Source Tracking
19. 隱私聲明、錯誤處理、超時回收
20. 壓測與上線

**總工時估計：11–16 個工作天（1 位全端 + 1 位負責文案與 Prompt 調校）。**

---

## 不要做的事（避免過度工程化）

MVP 階段不需要：
- LINE Login 完整登入流程（除非要做會員中心）
- 自建 Admin 後台（Supabase Table Editor 夠用）
- 向量資料庫 / RAG（診斷不需要檢索知識庫）
- 多語系
- 即時客服轉接系統（用 LINE 官方帳號的聊天模式手動接手就好）

---

## V2 可升級功能

| 功能 | 價值 | 前置條件 |
|---|---|---|
| LIFF 中轉頁 Source Tracking | 知道使用者從哪個服務頁進來，第一題就客製 | LIFF App |
| LIFF 診斷報告網頁版 | 完整版報告、可下載 PDF、可轉寄給老闆 | LIFF + PDF 產生器 |
| AI 追問（自由文字輸入） | 使用者可以直接打字描述問題，AI 追問兩輪 | LLM 對話記憶 |
| 產業對標數據 | 「你的同業平均是 X」→ 說服力大幅上升 | 累積 200+ 診斷樣本 |
| 顧問端 Copilot | 顧問接手前，AI 先生成提案大綱與報價區間 | 案例庫建置 |
| Re-diagnosis 提醒 | 90 天後自動邀請重測，看進步幅度 | Follow-up 引擎 |
| 官網 Chat Widget 同引擎 | 同一套診斷跑在官網，不強迫加 LINE | Web 前端 |
| 與 Notion / HubSpot 雙向同步 | 顧問在 Notion 更新狀態，回寫 LINE 標籤 | CRM 決策 |

---

## 一句話老闆版

這不是 LINE 客服，是一台 24 小時運作的業務開發機器：它先幫客戶做完診斷，再把有預算、有時程、有決策權的名單送到顧問桌上。
