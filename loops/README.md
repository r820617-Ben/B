# loops/ — 自動化迴圈

這個資料夾放迴圈定義。方法論在 `.claude/skills/loop-engineering.md`。

## 怎麼跑

```bash
# 先看提示詞長什麼樣，不花錢
loops/run-loop.sh loops/content-loop.md --dry-run

# 真的跑
loops/run-loop.sh loops/content-loop.md
```

跑完看 `loops/state/<迴圈名>.md`（每輪紀錄和驗證結果）和 `loops/state/<迴圈名>.log`（執行日誌）。

## 現有迴圈

| 檔案 | 做什麼 | 產出到 |
|---|---|---|
| `ad-report-loop.md` | 廣告成效報告 | `reports/` |
| `content-loop.md` | 短影音腳本 + IG 輪播 | `content/<日期>-<主題>/` |
| `marketing-plan-loop.md` | 客戶行銷企劃 | `proposals/<客戶>-<日期>.md` |

## 迴圈定義檔格式

檔案開頭是設定區，夾在兩行 `---` 之間：

```yaml
---
name: 迴圈名稱              # 決定狀態檔和日誌檔名
max_iterations: 5          # 護欄一：次數上限
max_cost_usd: 2.00         # 護欄二：累計花費上限（美元）
no_progress_limit: 2       # 護欄三：連續幾輪檔案沒變就停
verifier: .claude/skills/loop-verifier.md
watch: content             # 偵測進展時要盯的資料夾
permission_mode: acceptEdits
input: path/to/brief.md    # 選填，這次要處理的輸入，整段貼進提示詞
model: claude-opus-5       # 選填，留空用預設
---
```

`input:` 是換案子的開關。行銷企劃迴圈要換客戶，只改這一行指到新的 brief，
定義檔正文一個字都不用動。指到不存在的檔案，迴圈會在第一輪之前就停下來告訴你。

下面是正文，會整段餵給生產者和驗證者。正文一定要有 **停止條件**，而且每一條都要驗得出來。

寫得出來的停止條件：「腳本字數落在 270–405 字」
驗不出來的停止條件：「內容要有吸引力」

## 已驗證的執行紀錄

| 迴圈 | 結果 | 輪數 | 花費 |
|---|---|---|---|
| marketing-plan | PASS | 2 / 5 | $1.16 |

第 1 輪被驗證者擋下來的原因：預算表兩列金額同為 5,000，佔比卻寫成 8.3% 和 8.4%，
是為了湊滿 100% 硬調的。第 2 輪用最大餘數法改掉才過。

## 新增一個迴圈

複製一份現成的定義檔改，或直接跟 Claude 說「幫我建一個 XXX 的迴圈」，
它會讀 `.claude/skills/loop-engineering.md` 照格式寫。

## 運作方式

```
啟動
 ├─ 生產者（Claude 第一次呼叫）：讀定義 + 狀態檔 + 上輪驗證意見 → 改檔案
 ├─ 無進展偵測：檔案指紋和上輪一樣就累加，達上限停手
 ├─ 驗證者（Claude 第二次呼叫，獨立）：只看成品和停止條件 → PASS / FAIL
 │    ├─ PASS → 結束
 │    └─ FAIL → 把意見寫進狀態檔，回到生產者
 └─ 任一護欄觸發 → 結束並寫下停止原因
```

生產者和驗證者分開呼叫，驗證者拿不到生產者的推理過程，只看成品。
同一個模型寫完自己打分，幾乎一定給自己過。
