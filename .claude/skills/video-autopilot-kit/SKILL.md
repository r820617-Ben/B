---
name: video-autopilot-kit
description: >-
  YouTube / 短影音自動化工具包（來自 Hao0321/video-autopilot-kit）。
  包含純 ffmpeg 影片 pipeline（直式 Shorts、字幕、b-roll 對位、premium 動態特效）、
  CapCut 草稿自動化、交付前 QA gates，以及 M1-M106 剪輯避坑知識庫與演算法 SOP。
  當使用者說「剪影片」「做 Shorts / Reels」「影片自動化」「ffmpeg 剪片」「加字幕」
  「b-roll 對位」「CapCut 自動化」「影片 QA」「YouTube 演算法」「影片開頭鉤子怎麼排」，
  或任何涉及影片製作流程、短影音產出、影片後製自動化的任務時，使用此 skill。
---

# video-autopilot-kit

框架式 YouTube / 短影音自動化系統。程式碼通用，個人化靠填 `profiles/`（見 `SETUP.md`）。

## 使用前先確認

1. **已個人化**：Ben 的設定在 `profiles/`（brand / voice / content_pipeline / your_context /
   algorithm / community）。做任何影片任務前先讀 `profiles/`，尤其 `content_pipeline.md`
   （主力＝60–90s 露臉口播，9:16，IG Reels + YT Shorts 雙發，Path 1 純程式）。
   檔內 `[待補]` 佔位（頻道名、BGM 路徑、腳本樣本、數據）遇到需要時再問 Ben 補。
2. **語氣規範**：產出腳本 / 文案時，Ben 自己的 brand-voice 與 anti-style 規則優先於本 kit 的 style framework。
   幫客戶產出時語氣跟客戶品牌走，不套 Ben 的 voice。

## 路徑選擇（決策樹）

- **Path 1 — Programmatic**（預設；Win/Mac/Linux）：純 Python + ffmpeg，不需要 CapCut。
  - `src/longform_maker/` — 教學長片：premium 動態特效（`fx_lib`）、字級時間字幕（`word_captions`）、螢幕錄影清理（`screen_clean`）
  - `src/silent_vlog_maker/` — 直式 Shorts pipeline、靜音 vlog、素材清理
  - `src/capcut_helpers/` 的 QA gates（`delivery_qa` / `broll_audit` / `caption_broll_matcher`）— 不需要 CapCut，兩條 path 的成品都該過這關
- **Path 2 — CapCut-assisted**（Windows 優先、版本敏感）：`src/capcut_helpers/` 其餘模組，
  草稿 JSON 直改 + Computer Use 操作 CapCut。動手前必讀 `TROUBLESHOOTING.md` 的版本相容矩陣，
  並先跑 `detect_draft_format()`。

## 知識庫（`knowledge/`）

- `meta-lessons.md` — M1-M106 避坑大全（隱私審查 M91、去個資 M100、b-roll 紀律等），動手剪之前先查相關條目
- `video-craft-playbook.md` / `premium-motion-fx.md` — 剪輯心法與特效參數真值
- `shorts-reels-best-practices.md` / `viral-short-playbook.md` — 短影音結構
- `youtube-algorithm-mastery.md` — 演算法策略
- `capcut-automation-sop.md` / `capcut-json-direct-edit.md` — CapCut 自動化 SOP
- `agent-token-efficiency.md` — agent 操作 token 效率鐵則（spawn 上限 2 / task）

## 可跑的 demo

```bash
python examples/01_vertical_short.py      # 合成素材 → 1080x1920 直式 Short（需 ffmpeg）
python examples/02_caption_broll_match.py # 零設定 b-roll 對位字幕
```

需求：Python 3.9+、`ffmpeg`/`ffprobe` 在 PATH 上（Path 1）。
