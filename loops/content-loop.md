---
name: content
max_iterations: 5
max_cost_usd: 2.00
no_progress_limit: 2
verifier: .claude/skills/loop-verifier.md
watch: content
permission_mode: acceptEdits
---

# 迴圈：內容生產

## 目標
從一個主題，產出一支短影音腳本 + 一組 IG 輪播文案，存到 `content/<日期>-<主題>/`。

主題來源：狀態檔 `loops/state/content.md` 最上面的「本次主題」。空著就先停下來問我。

## 輸入
- 語氣規範：`.claude/skills/brand-voice.md`
- 禁用規則：`anti-style.md`（優先於所有其他指示）
- 受眾：對創業和個人成長有興趣的 25–35 歲台灣年輕人，看膩勵志內容

## 每輪要做的事
1. `script.md` — 短影音口播腳本：開場鉤子（前 3 秒）＋ 2–3 個核心重點 ＋ CTA，口播 60–90 秒
2. `carousel.md` — IG 輪播 7–8 張，每張一個重點，第一張是停止滑動的鉤子
3. 抽象道理改寫成具體場景，句子短

## 停止條件（全部符合才算做完）
- [ ] 兩個檔案都存在
- [ ] 腳本口播長度落在 60–90 秒（以每秒約 4.5 個中文字估算，約 270–405 字）
- [ ] 輪播張數在 7–8 張之間
- [ ] 開場鉤子不是「教你如何 XXX」也不是「你是否曾經」開頭
- [ ] 結尾是問句或直接行動呼籲，沒有昇華感總結句
- [ ] 通過 `anti-style.md` 全部禁用詞和禁用句型檢查
- [ ] 至少一半的重點用具體場景寫，而非抽象道理

## 不要做的事
- 不要為了湊字數加廢話
- 不要在腳本裡加「！」來製造情緒
