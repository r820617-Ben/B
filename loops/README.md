# loops/ — 自動化迴圈

單關用 `run-loop.sh`，整條流程用 `run-pipeline.sh`。
方法論在 `.claude/skills/loop-engineering.md`。

---

## 整條流程跑一次

```bash
# 1. 客戶原始資料丟進 intake/，逐字稿、LINE 對話、來信都可以，不用整理
vim intake/如記食品.md

# 2. 跑
loops/run-pipeline.sh loops/pipelines/marketing-campaign.md --client 如記食品
```

四關依序跑，前一關的產出就是下一關的輸入：

```
intake/<客戶>.md
   │  ① brief-loop          需求整理
   ▼
proposals/briefs/<客戶>.md
   │  ② marketing-plan-loop  八章節企劃
   ▼
proposals/<客戶>-<日期>.md
   │  ③ content-loop         第一個月腳本與輪播
   ├─────────────────────┐
   ▼                     │  ④ schedule-loop  逐則發文排程
content/<客戶>-<日期>/    ▼
                    schedules/<客戶>-<日期>.md
```

任何一關沒產出檔案就停整條線。修完接著跑：

```bash
loops/run-pipeline.sh loops/pipelines/marketing-campaign.md --client 如記食品 --from 3
loops/run-pipeline.sh loops/pipelines/marketing-campaign.md --client 如記食品 --only 2
```

總帳寫在 `loops/state/pipeline-campaign-<客戶>.md`，每一關的停止原因和花費都在裡面。
流水線有自己的總成本上限，跑到上限就停，不會因為某一關便宜就一路燒下去。

---

## 單獨跑一關

```bash
loops/run-loop.sh loops/content-loop.md --dry-run          # 只印提示詞，不花錢
loops/run-loop.sh loops/marketing-plan-loop.md \
  --input proposals/briefs/如記食品.md \
  --target proposals/如記食品-20260920.md \
  --client 如記食品
```

跑完看 `loops/state/<迴圈名>.md`（每輪紀錄和驗證結果）和 `.log`（執行日誌）。

---

## 現有迴圈

| 檔案 | 做什麼 | 產出 |
|---|---|---|
| `brief-loop.md` | 原始資料 → 結構化 brief | `proposals/briefs/` |
| `marketing-plan-loop.md` | brief → 八章節行銷企劃 | `proposals/` |
| `content-loop.md` | 企劃 → 腳本與輪播 | `content/<客戶>-<日期>/` |
| `schedule-loop.md` | 企劃 → 逐則發文排程 | `schedules/` |
| `ad-report-loop.md` | 廣告數據 → 成效報告 | `reports/` |

`pipelines/marketing-campaign.md` 把前四個串成一條。

---

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
input: path/to/brief.md    # 選填，這次要處理的輸入，整段貼進提示詞
target: path/to/out.md     # 選填，這一關要產出的檔案，跑完會檢查它在不在
model: claude-opus-5       # 選填，留空用預設
---
```

正文會整段餵給生產者和驗證者，一定要有 **停止條件**，而且每一條都要驗得出來。

寫得出來的停止條件：「腳本字數落在 270–405 字」
驗不出來的停止條件：「內容要有吸引力」

`{{client}}` 和 `{{date}}` 會被代換成實際的客戶名稱和日期，
所以同一份定義檔可以跑所有客戶，不用為每個客戶複製一份。

---

## 流水線定義檔格式

```
---
name: campaign
client:                    # 留空，用 --client 指定
max_cost_usd: 9.00         # 整條線的總上限，跟各關自己的上限分開算
---

## 階段
1. loops/brief-loop.md | intake/{{client}}.md | proposals/briefs/{{client}}.md
2. loops/marketing-plan-loop.md | proposals/briefs/{{client}}.md | proposals/{{client}}-{{date}}.md
```

每一行：`順序. 迴圈定義 | 輸入路徑 | 產出路徑`。

---

## 已驗證的執行紀錄

整條流水線從一份 9/18 的會議逐字稿跑到發文排程表，四關全過。

| 關 | 迴圈 | 結果 | 輪數 | 花費 |
|---|---|---|---|---|
| 1 | brief | PASS | 2 / 4 | $0.94 |
| 2 | marketing-plan | PASS | 4 / 5 | $2.61 |
| 3 | content | PASS | 1 / 5 | $2.36 |
| 4 | schedule | PASS | 4 / 4 | $2.83 |

總計 $8.74，11 輪，產出 brief、八章節企劃、12 支腳本與輪播、23 則發文排程。

驗證者擋下來過的東西：

- 把 900 × 0.4% 算出來的「4 筆」當成客戶提供的基準值寫進目標和 KPI
- 策略主軸寫了「二代出鏡敢講真話」，但執行方案的 Meta 廣告那一列讀起來
  換成任何一家調味品廠都能套用
- 正文 1531 字，超過 1500 字上限
- 排程表把 IG 貼文排在第 1 週，但企劃自己寫第 1 週還在拍攝和腳本定稿
- 把「廣告帳戶設定準備」當成一則發文列進上線日
- 10/10 是星期六（驗證者用 `date -d` 核對過）

預算表那次是更早的單關測試：兩列金額同為 5,000，佔比卻寫成 8.3% 和 8.4%，
為了湊滿 100% 硬調的，第 2 輪用最大餘數法改掉才過。

---

## 新增一個迴圈

複製一份現成的定義檔改，或直接跟 Claude 說「幫我建一個 XXX 的迴圈」，
它會讀 `.claude/skills/loop-engineering.md` 照格式寫。

## 一關的運作方式

```
啟動
 ├─ 生產者（Claude 第一次呼叫）：讀定義 + 輸入 + 狀態檔 + 上輪驗證意見 → 改檔案
 ├─ 無進展偵測：檔案指紋和上輪一樣就累加，達上限停手
 ├─ 驗證者（Claude 第二次呼叫，獨立）：只看成品和停止條件 → PASS / FAIL
 │    ├─ PASS → 檢查 target 檔案真的在，才算結束
 │    └─ FAIL → 把意見寫進狀態檔，回到生產者
 └─ 任一護欄觸發 → 結束並寫下停止原因
```

生產者和驗證者分開呼叫，驗證者拿不到生產者的推理過程，只看成品。
同一個模型寫完自己打分，幾乎一定給自己過。
