# 09｜Error Handling 與邊界情境

## 1. 錯誤分類與處理

| 層級 | 情境 | 使用者看到 | 系統動作 |
|---|---|---|---|
| **L1 靜默** | 重複 webhook、重複點擊、已處理事件 | 什麼都沒有 | 記 `events`，回 200，結束 |
| **L2 引導** | 點了舊題目的按鈕、輸入非選項文字 | 一句說明 + 重發當前題目 | 不改 state |
| **L3 降級** | LLM 逾時或失敗 | 規則式簡化診斷 | 標記 `needs_regeneration`，排程重試 |
| **L4 告知** | DB 寫入失敗、LINE API 5xx | 「這邊出了點狀況，要不要重試一次？」 | Slack 告警 + 記錄完整 payload |
| **L5 靜默失敗** | 使用者已封鎖仍嘗試 Push | 無（發不出去） | 標記 `is_blocked`，取消所有排程 |

---

## 2. 具體情境對照

### 2.1 LINE 平台相關

| 情境 | 偵測方式 | 處理 |
|---|---|---|
| Webhook 簽章錯誤 | HMAC 比對失敗 | 回 401，記錄來源 IP，**不做任何處理**（可能是攻擊） |
| LINE 重送同一 event | `events.webhook_event_id` 唯一索引衝突 | 回 200 直接結束 |
| Reply Token 已過期（400 `Invalid reply token`） | LINE API 回應 | 自動改用 Push API 重送同一則訊息 |
| Push 配額用盡（429） | LINE API 回應 | Slack 立即告警 @執行長；當月剩餘 Follow-up 全部暫停；診斷結果改用 Reply 盡量送出 |
| 使用者已封鎖（403） | LINE API 回應 | `users.is_blocked = true`，取消所有 `followups` |
| LINE API 5xx | HTTP status | 重試 2 次（間隔 2s、5s），仍失敗則記錄並告警 |
| 使用者傳圖片 / 貼圖 / 語音 | `message.type != 'text'` | 回「我先把診斷跑完，等一下再看這個」+ 重發當前題目 |
| 使用者傳超長文字（超過 500 字） | 長度檢查 | 存進 `answers.answer_raw`，通知 Slack（這種人通常很有意願），轉人工 |

### 2.2 資料相關

| 情境 | 處理 |
|---|---|
| 同一使用者同時有多個 `IN_PROGRESS` session | 取 `started_at` 最新的，其餘標記 `ABANDONED` |
| `answers` 唯一鍵衝突（連點兩次） | `ON CONFLICT DO NOTHING`，回傳現有答案，流程照常往下 |
| Supabase 連線失敗 | HTTP node 重試 2 次；仍失敗走 L4，把 payload 寫進 n8n static data 暫存，排程補寫 |
| `diagnostics` 已存在但要重跑 | 用 `session_id` upsert，不新增列 |
| 使用者在 `HANDOFF` 狀態又點了舊按鈕 | 忽略，不回訊息（顧問正在聊，機器人不要插話） |

### 2.3 LLM 相關

| 情境 | 偵測 | 處理 |
|---|---|---|
| 逾時（超過 25 秒） | HTTP timeout | 切 OpenAI 備援 |
| 回傳非 JSON | `JSON.parse` 失敗 | 重試 1 次（temperature 降到 0.2），仍失敗走降級 |
| 欄位缺漏、陣列長度錯 | Schema 驗證 | 同上 |
| 輸出含價格或方案名 | 正則比對「萬 / NT$ / 元起 / 方案 / 報價」 | 重試 1 次，Prompt 加一句「上一次輸出違反規則」 |
| 輸出含禁用句型 | 正則比對「不是⋯而是 / 真正的⋯是 / 是時候⋯了」 | 同上 |
| 輸出字數超過 400 字 | 長度檢查 | 同上 |
| API 金鑰失效（401） | HTTP status | Slack 立即告警 @執行長，全面走降級輸出 |
| 內容被安全過濾擋下 | API 回應 | 直接走降級輸出，記錄該次輸入供檢查 |

**降級輸出的品質底線：** 即使 LLM 全掛，使用者還是要收到一份帶自己分數、自己成熟度名稱、自己卡點的訊息。純罐頭不能接受。

---

## 3. 防呆設計

### 3.1 防重複點擊

手機使用者常見連點。三層防護：

1. `answers` 的 `unique (session_id, question_id)`
2. 送出下一題後，新訊息的 Quick Reply 會取代前一則，舊按鈕自動消失
3. State 檢查：postback 的 `q` 與 `users.current_state` 不符就不處理

### 3.2 防偽造 postback

Postback data 不包含 `user_id` 或 `session_id`，全部由後端從 `line_user_id` 查出。使用者就算改了 data 也只能影響自己的紀錄。

### 3.3 防無限迴圈

n8n 的 Execute Workflow 設定 `Max Depth = 3`。WF-1 到 WF-2 到 WF-3 是最深的鏈，超過就是流程寫錯了。

### 3.4 防資料污染

自由文字題（LEAD1 姓名、LEAD2 公司名）做基本清洗：

- 移除控制字元（Unicode 範圍 U+0000 到 U+001F 與 U+007F）
- 移除 HTML 標籤
- 前後空白 trim
- 截斷到 100 字元

長度超過 100 字的公司名，存進 `answer_raw`，`company_name` 欄位留空，通知 Slack 人工確認。

---

## 4. 監控與告警

| 告警 | 條件 | 管道 |
|---|---|---|
| 系統錯誤 | `events` 出現 `event_type='error'` | Slack `#alerts` |
| 錯誤率過高 | 一小時內錯誤數超過 10 | Slack @執行長 |
| LLM 全面失敗 | 連續 5 次降級輸出 | Slack @執行長 |
| Push 配額 | 使用率超過 80% | Slack @執行長 |
| 診斷完成率驟降 | 當日完成率低於過去 7 天平均的 60% | Slack 日報標紅 |
| SLA 逾期 | HOT LEAD 超過 2 小時未認領 | Slack @執行長 |
| Webhook 無流量 | 連續 6 小時沒有任何 event（上班時間） | Slack @執行長 |

最後一條最容易被忽略。系統壞掉的時候不會有錯誤訊息，只會很安靜。

---

## 5. 上線前測試清單

### 功能測試

- [ ] 六條 Segment 路徑各走一次，全部能出診斷
- [ ] Discovery 的 24 種 DS1 乘 DS2 組合都能正確路由
- [ ] 中途離開 25 小時後回來，收到續測提醒
- [ ] 中途離開 49 小時後回來，state 是 `ABANDONED`
- [ ] 連點同一個選項 5 次，只產生 1 筆 answer
- [ ] 點擊上一題的按鈕，收到引導訊息而不是錯亂
- [ ] 完整走完 Lead Qualification，Slack 收到卡片
- [ ] HOT / WARM / NURTURE 三種分數各測一次，SLA 文案正確
- [ ] 顧問輸入 `/handled`，後續 Follow-up 全部取消
- [ ] 輸入「刪除我的資料」，流程正確
- [ ] 封鎖官方帳號後，`is_blocked` 有更新且排程取消

### 異常測試

- [ ] 把 `ANTHROPIC_API_KEY` 改錯，確認降級輸出正常且使用者無感
- [ ] 把 Supabase 關掉，確認錯誤訊息友善且有 Slack 告警
- [ ] 手動送一個簽章錯誤的 webhook，確認回 401
- [ ] 同一個 webhook payload 送兩次，確認只處理一次
- [ ] 傳圖片、貼圖、語音、超長文字各一次

### 體驗測試

- [ ] 用真實手機從官網點 CTA 走完全程，計時是否在 60 秒內
- [ ] 找三位非團隊成員的企業主實測，問他們「第一則訊息有沒有讓你想繼續」
- [ ] 診斷結果的 Flex 在 iOS 與 Android 上都檢查一次
- [ ] 同樣的答案跑三次，確認分數相同、敘述不同
