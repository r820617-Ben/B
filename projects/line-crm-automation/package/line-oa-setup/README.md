# 知育行銷 LINE 官方帳號｜企業診斷流程佈署工具

把 `@520vqabi` 從客服帳號改成「60 秒企業診斷」入口。這個套件包含全部內容資料、
一支可靠的 API 佈署腳本、一支需要人看著的瀏覽器自動化腳本。

給接手的工程師或 agent：**先讀第 1 節再動手**，那一節決定你該花力氣在哪裡。

---

## 1. 先搞清楚哪些能自動、哪些不能

LINE 有兩套後台，能力完全不同。這是整個任務的關鍵事實。

| 要設定的東西 | 在哪裡 | 有 API 嗎 | 這個套件怎麼處理 |
|---|---|---|---|
| 圖文選單（圖片、六格點擊區、設為預設） | Messaging API | **有** | `src/richmenu.mjs`，可靠、可重跑 |
| 自動回應訊息 27 則 | OA Manager | 沒有 | `src/oa-manager.mjs`，瀏覽器自動化 |
| 加入好友的歡迎訊息 | OA Manager | 沒有 | 手動，內容在 `data/greeting.json` |
| 基本檔案、狀態消息 | OA Manager | 沒有 | 手動，內容在 `data/settings.json` |
| 聊天標籤 14 個 | OA Manager | 沒有 | 手動 |
| 問卷調查 9 題 | OA Manager | 沒有 | 手動 |

**不要試圖用 Messaging API 做自動回應訊息，那個端點不存在。**
`/v2/bot/message/reply` 是給你自己的 webhook 伺服器用的，跟後台的「自動回應訊息」是兩回事。
要走那條路就是完整版架構（Webhook + n8n + 資料庫），不在這個套件的範圍。

實際工時分配：圖文選單腳本 5 分鐘跑完；27 則自動回應是真正的瓶頸，
即使自動化順利也要 20 到 30 分鐘，手動貼大約 90 分鐘。

---

## 2. 安裝

需要 Node 18.17 以上。

```bash
npm install                              # 只有 playwright 一個選用依賴
npx playwright install chromium          # 只有要跑瀏覽器自動化才需要
cp .env.example .env                     # 填入 Channel Access Token
```

取得 Channel Access Token：
LINE Developers Console → 選到這個帳號的 Messaging API channel → Channel access token → Issue。

---

## 3. 執行順序

```bash
npm run verify          # 1  確認 token 有效、看現況，不做任何修改
npm run richmenu        # 2  建立圖文選單並設為預設
npm run export:txt      # 3  產出純文字版全部內容，備查
npm run oa:assist       # 4  半自動貼 27 則自動回應
```

### 3.1 `npm run verify`

唯讀。印出帳號名稱、聊天模式、訊息額度、現有圖文選單、目前的預設選單。
**動任何東西之前先跑這一支**，確認你連到的是正確的帳號。

### 3.2 `npm run richmenu`

三步：建立選單物件、上傳圖片到 `api-data.line.me`、設為所有使用者的預設選單。

送出前會自己驗證尺寸、分區座標、圖片大小，錯的話直接擋下來不送。

```bash
npm run richmenu -- --dry      # 只印出要送什麼，不呼叫 API
npm run richmenu:clean         # 先刪掉同名舊選單再建，避免重跑累積
```

成功後 `richMenuId` 會寫進 `output/richmenu-result.json`。

驗收：手機上封鎖再重新加入官方帳號，看到深底金字的六格選單，
點任一格會以使用者身分送出對應的 `#` 代碼。

### 3.3 `npm run oa:assist`

半自動。開一個瀏覽器（第一次要手動登入，登入狀態存在 `.browser-profile/`），
然後逐則把訊息內文放進剪貼簿並印出關鍵字，你在後台貼上、按 Enter 換下一則。

選擇器全錯也能用。**建議先用這個模式**，27 則大概 20 分鐘。

### 3.4 全自動（選用，工作量較大）

後台的 DOM 我沒辦法先知道，而且會改版，所以選擇器必須實際檢查後填。

```bash
node src/oa-manager.mjs --inspect
```

會在 `output/` 產出：

| 檔案 | 用途 |
|---|---|
| `autoresponse-page.html` | 整頁 HTML |
| `autoresponse-page.png` | 整頁截圖 |
| `selector-candidates.json` | 所有可見的可互動元素，含 id、class、data-testid、aria-label |

照著填 `data/selectors.json` 的九個欄位，把 `_filled` 改成 `true`，然後：

```bash
npm run oa:auto
```

每則失敗會停下來問要不要繼續，全程紀錄寫進 `output/oa-manager-log.json`。

**選 data-testid 或 aria-label，不要選 class。** LINE 的 class 是編譯產生的雜湊，改版必壞。

---

## 4. 內容資料

全部文案都在 `data/`，改文案不用改程式。

| 檔案 | 內容 |
|---|---|
| `auto-replies.json` | 27 則自動回應：關鍵字、比對方式、完整內文 |
| `greeting.json` | 2 則加入好友歡迎訊息 |
| `richmenu.json` | 圖文選單定義，含六格的像素座標 |
| `settings.json` | 回應設定、基本檔案、14 個聊天標籤、問卷 9 題 |
| `selectors.json` | 瀏覽器自動化用的選擇器，需人工填 |

`assets/richmenu-2500x1686.png` 是選單圖，132 KB，在 LINE 的 1 MB 限制內。

### 內容邏輯

使用者點選單或輸入 `#` 代碼 → 收到第一層追問 → 回覆代碼（M1、A2、P3 之類）→
收到對應的診斷結果 → 回覆「顧問」→ 收到問卷連結。

六條路線，每條兩層，共 15 種診斷結果，加 3 個不確定路由、3 個功能型回應。

---

## 5. 安全

| 項目 | 處理 |
|---|---|
| `LINE_CHANNEL_ACCESS_TOKEN` | 機密。已在 `.gitignore`。工作結束到 Console 撤銷重發 |
| `.browser-profile/` | 等同登入憑證，已在 `.gitignore`，不要打包外流 |
| `output/` | 可能含帳號資訊，已在 `.gitignore` |

這個套件不會蒐集、上傳、或對外傳送任何使用者資料。所有呼叫只送到 `api.line.me` 與 `api-data.line.me`。

---

## 6. 驗收標準

- [ ] `npm run verify` 印出的帳號名稱是知育行銷的官方帳號
- [ ] 圖文選單在手機上顯示正常，六格文字沒有被裁切
- [ ] 六格各點一次，送出的代碼與 `data/richmenu.json` 一致
- [ ] 後台的自動回應列表有 27 筆，關鍵字與 `data/auto-replies.json` 一致
- [ ] 比對方式全部是「完全一致」
- [ ] 從手機走一次完整流程：點選單 → 追問 → 代碼 → 診斷結果 → 回覆「顧問」
- [ ] 後台的「AI 自動回應訊息」是關閉狀態

最後一項最容易漏。沒關的話它會跟關鍵字回應搶著回，使用者會收到不相干的內容。

---

## 7. 這個套件不做的事

完整版的 AI 即時診斷、Lead 自動評分、顧問自動通知、Day 1/3/7 追蹤，都需要
Webhook 伺服器、n8n、資料庫。規格在上層專案的 `01` 到 `11` 號文件，不在這裡。

先把這一版上線，收 50 到 100 筆真實回答，再決定要不要投入完整版。
