# 04｜AI Ready Score 與 LLM Prompt

## 設計原則：分數用規則算，敘述用 LLM 寫

| 產出 | 由誰計算 | 理由 |
|---|---|---|
| AI Ready Score（0–100） | 規則式程式碼 | 同樣答案必須給同樣分數。顧問要能對客戶解釋分數怎麼來的 |
| AI Maturity Level 名稱 | 規則式 | 同上 |
| 瓶頸分析、觀察、建議步驟 | LLM | 這部分要根據答案組合做判斷，規則寫不完 |

如果分數也交給 LLM，同一個人重測會得到不同分數，顧問在客戶面前會很難解釋。這條線要劃清楚。

---

## 1. AI Ready Score 計算規則

```
AI Ready Score = Maturity(0–40) + Readiness(0–35) + Clarity(0–25)
```

### 1.1 Maturity（0–40）— 來自 AX1 或 U1

| Level | 代碼 | 分數 | Level 名稱 |
|---|---|---|---|
| 0 幾乎沒在用 | `L0` | 5 | AI Explorer |
| 1 偶爾用 ChatGPT | `L1` | 14 | AI Explorer |
| 2 員工各自在用 | `L2` | 22 | AI User |
| 3 開始建工作流程 | `L3` | 30 | AI Operator |
| 4 已有自動化在跑 | `L4` | 36 | AI Integrator |
| 5 已有內部 AI 系統 | `L5` | 40 | AI Native |

### 1.2 Readiness（0–35）— 組織執行條件

基準 35 分，依卡點扣分。下限 5 分。

| 答案 | 扣分 | 理由 |
|---|---|---|
| AX3 `messy_data` | −12 | 資料亂是 AI 導入最貴的前置成本 |
| AX3 `no_process` | −10 | 沒流程就沒有可自動化的對象 |
| AX3 `no_skill` | −8 | 可用訓練解決，但需要時間 |
| AX3 `no_usecase` | −8 | 缺的是判斷力，不是工具 |
| AX3 `no_integration` | −6 | 相對好解，屬於工程問題 |
| AX3 `no_roi` | −5 | 屬於衡量設計問題，最好解 |
| GM3 `no_data` | −12 | 同 messy_data |
| GM3 `no_owner` | −10 | 沒有人負責，導入什麼都會停 |
| GM3 `no_strategy` | −8 | |
| GM3 `unstable` / `cost_up` / `no_conversion` | −5 | 屬於成效問題，不影響導入條件 |
| PO2 `gt30` | −6 | 時間全被佔滿，沒有餘裕做改善 |
| PO2 `10to30` | −3 | |
| BC2 `startup` | −8 | 制度未定型 |
| BC2 `transformation` | −4 | 有動能但也在動盪 |
| CT2 `1to10` | −5 | 規模小，內部分工不足 |

未作答的題目不扣分。

### 1.3 Clarity（0–25）— 問題描述的清晰度

| 條件 | 分數 |
|---|---|
| 第一層非 Discovery，且所有題目都選了具體選項 | 25 |
| 第一層非 Discovery，但有選到「不確定 / 都想」 | 14 |
| 第一層是 Discovery，DS1 + DS2 都回答 | 12 |
| 只完成一半就中斷（不出分數，不發診斷） | — |

### 1.4 分數分級與對應建議路線

| 分數 | 級別 | 判斷 | 建議主線 |
|---|---|---|---|
| 80–100 | **Ready** | 有流程也有動能 | AI Agent / 系統整合專案 |
| 60–79 | **Buildable** | 方向清楚，缺系統 | AI Workflow Audit + 導入專案 |
| 40–59 | **Foundational** | 有意願，基礎待補 | 流程盤點 + 企業內訓 |
| 0–39 | **Discovery** | 問題尚未定義 | 企業診斷 + 策略工作坊 |

### 1.5 Pseudocode

```javascript
function calcAiReadyScore(answers) {
  const MATURITY = { L0: 5, L1: 14, L2: 22, L3: 30, L4: 36, L5: 40 };
  const LEVEL_NAME = { L0: 'AI Explorer', L1: 'AI Explorer', L2: 'AI User',
                       L3: 'AI Operator', L4: 'AI Integrator', L5: 'AI Native' };
  const PENALTY = {
    'AX3:messy_data': 12, 'AX3:no_process': 10, 'AX3:no_skill': 8,
    'AX3:no_usecase': 8,  'AX3:no_integration': 6, 'AX3:no_roi': 5,
    'GM3:no_data': 12, 'GM3:no_owner': 10, 'GM3:no_strategy': 8,
    'GM3:unstable': 5, 'GM3:cost_up': 5, 'GM3:no_conversion': 5,
    'PO2:gt30': 6, 'PO2:10to30': 3,
    'BC2:startup': 8, 'BC2:transformation': 4,
    'CT2:1to10': 5
  };

  const level = answers.AX1 || answers.U1 || 'L0';
  const maturity = MATURITY[level];

  let readiness = 35;
  for (const [qid, value] of Object.entries(answers)) {
    readiness -= (PENALTY[`${qid}:${value}`] || 0);
  }
  readiness = Math.max(5, readiness);

  const vague = ['unsure', 'other'];
  let clarity;
  if (answers._segment === 'DS') clarity = 12;
  else clarity = Object.values(answers).some(v => vague.includes(v)) ? 14 : 25;

  const score = Math.min(100, maturity + readiness + clarity);
  const tier = score >= 80 ? 'Ready'
             : score >= 60 ? 'Buildable'
             : score >= 40 ? 'Foundational'
             : 'Discovery';

  return { score, tier, maturityLevel: level, maturityName: LEVEL_NAME[level] };
}
```

---

## 2. LLM 設定

| 項目 | 值 |
|---|---|
| 主要模型 | `claude-sonnet-5` |
| 備援模型 | OpenAI `gpt-4.1`（Claude 逾時或 5xx 時切換） |
| `max_tokens` | 1200 |
| `temperature` | 0.4（要有變化，但不能亂編） |
| 逾時設定 | 25 秒，逾時走降級輸出 |
| 重試 | 1 次，間隔 2 秒 |
| 輸出格式 | JSON（用 prefill 強制） |

---

## 3. System Prompt

```
你是一位企業 AI 與數位轉型顧問，服務對象是台灣中小企業的負責人與主管。

你要根據使用者在 LINE 上的一份快速診斷回答，找出這間公司真正的 business bottleneck。

## 你的判斷原則

1. 使用者選的選項是「表面症狀」，你的工作是推測底層原因。
2. 不要直接推薦 AI 工具名稱。使用者要的是判斷，不是工具清單。
3. 如果資訊不足以下判斷，明講哪一部分需要進一步了解，不要硬掰。
4. 不誇大效益，不承諾具體百分比的成長數字。
5. 不出現任何價格、方案名稱、或促銷語句。

## 分析結構

依序思考這七件事，但只輸出後面指定的欄位：
1. 表面問題
2. 可能根因
3. 可改善的流程
4. AI Opportunity
5. Marketing Opportunity
6. Management Opportunity
7. Recommended Next Step

## 語氣

專業、精簡、冷靜。像一個看過三百間公司的顧問在講話。
用「你」稱呼對方，不用「您」。
不用驚嘆號。
不使用這些詞彙：賦能、加值、全方位、一站式、無縫、顛覆、革命性。
不使用「不是⋯⋯而是⋯⋯」「真正的⋯⋯是⋯⋯」「是時候⋯⋯了」這類句型。

## 字數

current_state：40–60 字
每個 priority：12–20 字
insight：60–90 字
opportunity：40–60 字
每個 step：15–25 字
全部合計控制在 200–350 字。

## 輸出

只輸出 JSON，不要有任何其他文字、不要用 markdown code fence。
```

---

## 4. User Prompt 模板

```
以下是這間公司在 LINE 診斷中的回答。

【來源】
從官網 {{source_page}} 頁面進入

【第一層自述問題】
{{segment_label}}

【診斷回答】
{{#each answers}}
- {{question_text}}：{{answer_label}}
{{/each}}

【系統計算結果】
AI Ready Score：{{score}} / 100
AI Maturity Level：{{maturity_name}}（Level {{maturity_level}}）
Readiness 分項：{{readiness}} / 35
Clarity 分項：{{clarity}} / 25
分級：{{tier}}

【知育可提供的服務類型】（供你判斷方向，不要在輸出中提到方案名稱）
- Business Consulting：企業診斷、成長策略、流程改善
- AI Transformation：AI 導入、Workflow、Agent、Automation、Knowledge Base
- Growth Marketing：Meta、Google、SEO、Social、LINE、GA4、內容、轉換
- Corporate Training：AI、數位行銷、品牌、SEO、廣告、Automation 企業內訓

請輸出 JSON。
```

---

## 5. 輸出 JSON 契約

```json
{
  "current_state": "string，40–60 字，描述這間公司現在的處境",
  "priorities": [
    "string，12–20 字",
    "string，12–20 字",
    "string，12–20 字"
  ],
  "insight": "string，60–90 字。指出表面症狀與底層原因的落差",
  "opportunity": "string，40–60 字。可以用 AI 或數位方式處理的切入點",
  "steps": [
    "string，15–25 字",
    "string，15–25 字",
    "string，15–25 字"
  ],
  "primary_service": "consulting | ai | marketing | training",
  "secondary_service": "consulting | ai | marketing | training",
  "next_step_title": "string，8–14 字，會顯示在 Flex 卡片上",
  "confidence": "high | medium | low"
}
```

### 5.1 Prefill（強制 JSON）

Claude API 的 `messages` 最後一則放 assistant turn：

```json
{ "role": "assistant", "content": "{" }
```

回傳時在前面補回 `{` 再 parse。

### 5.2 輸出驗證

解析後必須檢查，任一項失敗就重試一次，再失敗走降級輸出：

- `priorities` 長度 = 3，`steps` 長度 = 3
- `insight` 長度在 40–150 字之間
- `primary_service` 在四個允許值內
- 全文不含價格數字（正則 `/\d{1,3}\s*萬|NT\$|元起/`）
- 全文不含禁用句型（正則 `/不是.{2,12}而是|真正的.{1,8}是|是時候.{1,10}了/`）

---

## 6. 降級輸出（LLM 不可用時）

不要讓使用者看到錯誤訊息。用規則式輸出一份簡化診斷，品質降低但仍然個人化。

```
完整分析我晚一點補給你。先給你三個從回答就看得出來的重點：

① 你的 AI 成熟度是 {{maturity_name}}，在台灣中小企業屬於{{percentile_text}}。
② 你選的最大卡點是「{{blocker_label}}」，這一類問題通常不是換工具能解決的。
③ 以你目前的狀況，先做{{tier_recommendation}}會比直接導入工具有效。

完整版我整理好會再傳給你。
```

`tier_recommendation` 對照：

| Tier | 文案 |
|---|---|
| Ready | 系統整合盤點 |
| Buildable | AI Workflow 盤點 |
| Foundational | 流程盤點與團隊訓練 |
| Discovery | 一次企業診斷會議 |

降級輸出後，把這筆 session 標記 `needs_regeneration = true`，n8n 每 15 分鐘重跑一次未生成的診斷，成功後 Push 完整版。

---

## 7. 範例輸出（給工程師測試用）

**輸入**

```
Segment: GM
GM1: revenue（營業額）
GM2: meta（Meta 廣告）
GM3: no_owner（沒有人專職在做）
U1: L1（偶爾用 ChatGPT）
Score: Maturity 14 + Readiness 25 (35 - 10 因 no_owner) + Clarity 25 = 64 / 100, Tier: Buildable
```

**期望輸出**

```json
{
  "current_state": "有在投廣告，也想把營業額做起來，但行銷這件事目前沒有固定的人負責，執行節奏會跟著老闆的空檔浮動。",
  "priorities": [
    "確立行銷負責人與每週產出節奏",
    "建立廣告成效的基本追蹤看板",
    "把素材產製流程標準化"
  ],
  "insight": "你選的是想做營業額，但同時選了沒有專職人員。以這個組合來看，廣告成效的波動比較可能來自素材更新不規律，而不是投放策略本身。這種狀況換代理商通常沒有用。",
  "opportunity": "素材發想、文案初稿、成效摘要這三件事可以先用 AI 固定產出節奏，讓沒有專職人員的狀況下也能維持穩定投放。",
  "steps": [
    "盤點目前廣告素材的產出流程與頻率",
    "建立一份每週行銷數據摘要模板",
    "指定一位內部窗口，先做三個月"
  ],
  "primary_service": "marketing",
  "secondary_service": "ai",
  "next_step_title": "行銷節奏盤點",
  "confidence": "high"
}
```
