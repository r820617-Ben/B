# Content Pipeline — Ben

## 內容類型

### 類型 A：短影音口播（主力）
- 長度：60–90 秒，露臉 talking-head
- 平台 / 比例：9:16 直式，**IG Reels + YouTube Shorts 雙發**
  - 雙發規則：字幕和重點文字放兩平台安全區交集（避開 YT Shorts 右側按鈕列和 IG 底部 caption 區）
- 主題：創業、個人成長、真實人生觀察
- 腳本：用 `/script` skill 產（語氣直接、真實、不說教），再套本 kit 的 pipeline
- 字幕風格：基本多色字幕（`silent_vlog_maker` shorts pipeline）
- 預設 BGM：`[待補 — Ben 的 BGM 庫路徑和命名規則]`
- 開頭 hook：前 3 秒給「為什麼要看」，具體場景開場（見 voice.md）
- 結尾：露臉口播，問句或行動呼籲（見 brand.md outro）

### 類型 B：IG 輪播（7–8 張）
- 非影片，不走本 kit pipeline；文案用 `/post` skill
- 列在這裡是因為同一主題常「短影音 + 輪播」雙形式產出——先寫腳本再改輪播

## 發布前 checklist
- [ ] 素材 fps 對齊 timeline
- [ ] b-roll 已去背景音
- [ ] 畫面跟旁白對得上（講什麼 show 什麼）
- [ ] b-roll/stock 占比 < 露臉主素材（用 `audit_broll_main_ratio` 驗）
- [ ] 同一支 stock clip 不重複出現
- [ ] BGM 短於影片 → loop 填滿 + 平滑接縫
- [ ] timeline 修剪到旁白真結尾（`detect_voice_end`）
- [ ] 匯出 player-safe
- [ ] 螢幕錄影素材過 chrome 審查 + 隱私掃描（M91：工具列/通知/私人後台不入鏡）
- [ ] 字幕文案過 anti-style.md 檢查（禁用詞句型）
