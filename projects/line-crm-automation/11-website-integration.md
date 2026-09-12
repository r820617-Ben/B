# 11｜官網串接與 Source Tracking

## 1. 先講一個技術事實

`https://lin.ee/8Ieo7Rk` 這種短網址**無法夾帶自訂參數傳進 Webhook**。LINE 的 `follow` event 只會給你 `userId` 和時間戳，不會告訴你這個人從哪個頁面來。

很多提案會寫「加上 UTM 追蹤來源」，實際做下去才發現做不到。這裡給三種真的可行的做法，依成本排序。

---

## 2. 三種 Source Tracking 做法

### 方案 A｜oaMessage 預填訊息（MVP 採用）

官網每個頁面的 CTA 指向不同的 LINE URL Scheme：

```
https://line.me/R/oaMessage/@520vqabi/?{urlencoded 文字}
```

使用者點擊後會開啟知育官方帳號的聊天室，輸入框已經帶好一段文字，按送出即可。

| 官網頁面 | CTA 連結 | 預填文字 | 解析成 Source |
|---|---|---|---|
| 首頁 | `.../%E9%96%8B%E5%A7%8B%E4%BC%81%E6%A5%AD%E8%A8%BA%E6%96%B7` | 開始企業診斷 | `WEBSITE_HOME` |
| AI 導入 | `.../%23AI%20%E5%B0%8E%E5%85%A5` | #AI 導入 | `WEBSITE_AI` |
| 企業內訓 | `.../%23%E4%BC%81%E6%A5%AD%E5%85%A7%E8%A8%93` | #企業內訓 | `WEBSITE_TRAINING` |
| 企業診斷 | `.../%23%E4%BC%81%E6%A5%AD%E8%A8%BA%E6%96%B7` | #企業診斷 | `WEBSITE_CONSULTING` |
| 行銷服務 | `.../%23%E8%A1%8C%E9%8A%B7%E6%9C%8D%E5%8B%99` | #行銷服務 | `WEBSITE_MARKETING` |
| 案例頁 | `.../%23%E7%9C%8B%E9%81%8E%E6%A1%88%E4%BE%8B` | #看過案例 | `WEBSITE_CASE` |

**Webhook 處理邏輯**

`follow` event 之後 30 秒內，若收到 `message` 且文字以 `#` 開頭或符合上表，就把 `users.source` 更新為對應值，並把這則訊息當作「開始診斷」的信號，直接送客製版歡迎訊息。

| 優點 | 缺點 |
|---|---|
| 零開發成本，只要改官網連結 | 使用者要多按一次「送出」 |
| 不需要 LINE Login | 有人會把預填文字刪掉再送別的 |
| 立刻可用 | 已經是好友的人點進去不會觸發 follow |

**多按一次送出的損耗約 10–15%。** MVP 階段可以接受，換來的是三天就能上線。

### 方案 B｜LIFF 中轉頁（V1.5 採用）

官網 CTA 指向 LIFF 頁面：

```
https://liff.line.me/{LIFF_ID}?src=ai&utm_campaign=spring
```

LIFF 頁面內：

```javascript
await liff.init({ liffId: LIFF_ID });
if (!liff.isLoggedIn()) { liff.login(); }

const profile = await liff.getProfile();   // 取得 userId（不需要是好友）
const params  = new URLSearchParams(location.search);

await fetch('https://n8n.zhiyu.tw/webhook/liff/source', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    line_user_id: profile.userId,
    source: params.get('src'),
    utm: Object.fromEntries(params),
    referrer: document.referrer
  })
});

// 已是好友直接進聊天室，不是好友則導到加好友頁
liff.openWindow({ url: 'https://line.me/R/ti/p/@520vqabi', external: false });
```

n8n 把 `line_user_id` 與 `source` 存進暫存表（TTL 24 小時）。之後 `follow` event 進來時，用 `userId` 查暫存表拿到來源。

| 優點 | 缺點 |
|---|---|
| 完全準確，使用者無感 | 需要建 LIFF App + LINE Login Channel |
| 可以帶完整 UTM | 多一次跳轉，載入時間約 1 秒 |
| 已是好友的人也能追蹤 | 使用者要授權 profile 權限（會跳一次同意畫面） |

**開發成本約 1 天。** 加好友數穩定超過每月 100 人之後再做。

### 方案 C｜多組官方帳號（不建議）

每個服務開一個 LINE 官方帳號。追蹤最準，但要管理五個帳號、五份訊息額度、五個 Webhook。中小企業不要這樣做。

---

## 3. 官網 CTA 設計

### 3.1 按鈕文案

| 位置 | 文案 | 副標 |
|---|---|---|
| 首頁 Hero | 開始企業診斷 | 60 秒，AI 幫你找出最該改善的地方 |
| 服務頁底 | 先看看我的狀況 | 加入 LINE，直接跑一次診斷 |
| 案例頁底 | 我的公司會是哪一種？ | 60 秒診斷，看你的狀況接近哪個案例 |
| 側邊常駐 | 60 秒企業診斷 | — |
| 文章頁底 | 這篇講的問題，你有嗎？ | 做一次診斷就知道 |

**不要寫「加入 LINE 好友」。** 那是要求使用者付出，不是給他價值。寫「開始企業診斷」，加好友變成過程而不是目的。

### 3.2 CTA 附近要有的三件事

1. **時間承諾**：60 秒
2. **產出承諾**：一份 AI Ready Score 與改善優先順序
3. **不用付出**：不用填表、不用留電話

範例區塊：

```
開始企業診斷

60 秒，4 個問題，AI 幫你找出公司目前最該改善的地方，
以及哪些工作適合先導入 AI。

不用填表，不用留電話。

[ 加入 LINE｜開始企業診斷 ]

已有 {{count}} 位企業主完成診斷
```

最後一行的數字從 `v_daily_funnel` 抓，超過 100 再顯示。低於 100 不要放。

### 3.3 追蹤埋點

官網 CTA 點擊事件送 GA4：

```javascript
gtag('event', 'line_diagnostic_start', {
  source_page: 'ai_transformation',
  cta_position: 'hero'
});
```

用這個對比 `users.source` 的實際加好友數，就能算出每個頁面的 CTA 轉換率與 LINE 跳轉損耗。

---

## 4. 依來源客製第一題

有 Source 的使用者，可以跳過第一層分流，直接進該 Segment 的第一題。題數從 4 題降到 3 題。

| Source | 開場句 | 直接進入 |
|---|---|---|
| `WEBSITE_AI` | 看到你剛剛在看 AI 導入。我先從公司的 AI 成熟度幫你盤一次。 | `Q_AX_1` |
| `WEBSITE_TRAINING` | 看到你剛剛在看企業內訓。我先確認訓練對象和目標。 | `Q_CT_1` |
| `WEBSITE_CONSULTING` | 看到你剛剛在看企業診斷。那我們直接開始。 | `Q_BC_1` |
| `WEBSITE_MARKETING` | 看到你剛剛在看行銷服務。我先問三題，找出成效卡在哪。 | `Q_GM_1` |
| `WEBSITE_CASE` | 看到你剛剛在看案例。我先看看你的狀況接近哪一個。 | 六選一（不跳過） |
| `WEBSITE_HOME` / 無 | — | 六選一 |

**這個設計是整套體驗的第一個驚喜點。** 使用者剛看完 AI 導入頁面，加好友後第一句話就提到 AI 導入，會立刻意識到這個帳號不一樣。

要注意：開場句要說「看到你剛剛在看」，不要說「系統偵測到」。前者像人，後者像監控。

---

## 5. 加好友後 60 秒的體驗節奏

| 秒數 | 發生什麼 | 使用者的感受 |
|---|---|---|
| 0 | 加好友 | — |
| 1 | 收到歡迎訊息，提到他剛看的頁面 | 咦，它知道我從哪來 |
| 5 | 第一題，選項貼近他的實際處境 | 這問題問得滿準的 |
| 20 | 第二題，承接句回應了他上一個答案 | 它有在聽 |
| 40 | 最後一題 | 快好了 |
| 42 | 「我正在把你的回答跟企業案例對照」 | 它真的在算東西 |
| 55 | Flex 卡片：AI Ready Score 72 / 100 | 喔，這不是一般官方 LINE |
| 58 | 文字分析，指出他沒想到的關聯 | 這個觀察有點東西 |

**第 55 秒那張卡片是整套系統的核心。** 分數、等級、優先順序、下一步，四個資訊在一個畫面上，而且全部是根據他自己的回答算出來的。

這就是「知育在賣 AI 落地能力」這件事的證明，而不是說明。
