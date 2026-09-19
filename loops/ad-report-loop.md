---
name: ad-report
max_iterations: 4
max_cost_usd: 2.50
no_progress_limit: 2
verifier: .claude/skills/loop-verifier.md
watch: reports
permission_mode: acceptEdits
---

# 迴圈：廣告成效報告

## 目標
把客戶當期的廣告數據，做成一份可以直接寄出的成效報告，存到 `reports/<客戶>-<年月>.md`。

## 輸入
- 數據來源：`reports/raw/` 底下的 CSV 或貼進狀態檔的原始數據
- 語氣規範：`.claude/skills/data-analysis.md`
- 客戶背景：對應的 `clients/<客戶>/CLAUDE.md`

## 每輪要做的事
1. 讀數據，算出這期對上期的變化
2. 寫成報告：標題（時間範圍＋主題）→ 三句話摘要 → 詳細數據條列 → 三個建議行動
3. 每個數字後面用白話說它代表什麼
4. 建議要具體到可以照做，例如「把 A 組合預算砍一半移到 B 組合」

## 停止條件（全部符合才算做完）
- [ ] `reports/` 底下有這期的報告檔
- [ ] 摘要在三句話以內
- [ ] 每項數據都有一句白話解釋，沒有裸數字
- [ ] 結尾剛好三個建議行動，每個都寫了「為什麼」和「具體怎麼做」
- [ ] 沒有「可以考慮優化」這類模糊建議
- [ ] 通過 `anti-style.md` 全部禁用詞和禁用句型檢查

## 不要做的事
- 缺數據就在狀態檔寫清楚缺哪一段，不要自己編數字
- 不要寄出，只產檔案
