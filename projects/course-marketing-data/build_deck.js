"use strict";
/**
 * 行銷數據解讀與成效分析基礎｜8H 企業課程簡報
 * 講師：黃皇賓（知育行銷有限公司）
 * 版型引擎：SOIL 教學節奏（引起動機 → 維持注意 → 喚起行動）
 */
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";            // 13.333 x 7.5
pres.author = "黃皇賓";
pres.company = "知育行銷有限公司";
pres.title = "行銷數據解讀與成效分析基礎";

// ── 色票（大地色系／高級感，強調色只有兩種）────────────────
const C = {
  ink: "221F1C", deep: "3A352E", cream: "FAF6F0", white: "FFFFFF",
  card: "F1EAE0", line: "DED4C6", muted: "8A8177", body: "4A443C",
  terra: "B45B33", terraBg: "F2DED2", sage: "6E7A61", sageBg: "E3E7DD",
};
const F = { h: "Microsoft JhengHei", b: "Microsoft JhengHei" };
const FOOT = "行銷數據解讀與成效分析基礎｜黃皇賓｜知育行銷";
let PAGE = 0;

// ── 基礎頁（淺底）────────────────────────────────────────
function page(opt = {}) {
  const s = pres.addSlide();
  s.background = { color: opt.bg || C.cream };
  PAGE += 1;
  if (opt.badge) {
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.7, y: 0.42, w: badgeW(opt.badge), h: 0.36, rectRadius: 0.18,
      fill: { color: opt.accent === C.sage ? C.sageBg : C.terraBg },
      line: { color: opt.accent === C.sage ? C.sageBg : C.terraBg },
    });
    s.addText(opt.badge, {
      x: 0.7, y: 0.42, w: badgeW(opt.badge), h: 0.36, isTextBox: true, margin: 0,
      align: "center", valign: "middle", fontFace: F.h, fontSize: 13, bold: true,
      color: opt.accent || C.terra,
    });
  }
  if (opt.title) {
    s.addText(opt.title, {
      x: 0.68, y: opt.badge ? 0.88 : 0.55, w: 11.9, h: 0.78, isTextBox: true, margin: 0,
      fontFace: F.h, fontSize: opt.titleSize || 34, bold: true, color: C.ink,
      align: "left", valign: "middle",
    });
  }
  if (opt.sub) {
    s.addText(opt.sub, {
      x: 0.7, y: opt.badge ? 1.62 : 1.3, w: 11.9, h: 0.42, isTextBox: true, margin: 0,
      fontFace: F.b, fontSize: 16, color: C.muted, align: "left", valign: "middle",
    });
  }
  if (opt.title) {
    s.addShape(pres.ShapeType.rect, {
      x: 0.7, y: opt.sub ? 2.08 : (opt.badge ? 1.72 : 1.42), w: 1.1, h: 0.06,
      fill: { color: opt.accent || C.terra }, line: { color: opt.accent || C.terra },
    });
  }
  foot(s);
  return s;
}
function badgeW(t) { return Math.max(1.0, t.length * 0.19 + 0.45); }
function foot(s) {
  s.addText(FOOT, {
    x: 0.7, y: 6.95, w: 8.5, h: 0.32, isTextBox: true, margin: 0,
    fontFace: F.b, fontSize: 10, color: C.muted, align: "left", valign: "middle",
  });
  s.addText(String(PAGE), {
    x: 11.6, y: 6.95, w: 1.0, h: 0.32, isTextBox: true, margin: 0,
    fontFace: F.b, fontSize: 10, color: C.muted, align: "right", valign: "middle",
  });
  // 進度條（>15 頁的長簡報減壓）
  s.addShape(pres.ShapeType.rect, { x: 0, y: 7.44, w: 13.333, h: 0.06, fill: { color: C.line }, line: { color: C.line } });
  s.addShape(pres.ShapeType.rect, { x: 0, y: 7.44, w: Math.min(13.333, 13.333 * (PAGE / 68)), h: 0.06, fill: { color: C.terra }, line: { color: C.terra } });
}

// ── 深底頁（封面、過場、行動、結語）──────────────────────
function darkPage() {
  const s = pres.addSlide();
  s.background = { color: C.ink };
  PAGE += 1;
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.26, h: 7.5, fill: { color: C.terra }, line: { color: C.terra } });
  return s;
}

// ── 元件 ──────────────────────────────────────────────
function bullets(s, items, o = {}) {
  s.addText(items.map((t, i) => ({
    text: t, options: { bullet: { code: "25CF" }, breakLine: i !== items.length - 1 },
  })), {
    x: o.x ?? 0.75, y: o.y ?? 2.4, w: o.w ?? 11.8, h: o.h ?? 4.2, isTextBox: true,
    fontFace: F.b, fontSize: o.size || 19, color: C.body, lineSpacing: 26,
    paraSpaceAfter: o.gap ?? 12, valign: "top",
  });
}
// 卡片網格：items = [{n, title, body}]
function cards(s, items, o = {}) {
  const cols = o.cols || items.length;
  const rows = Math.ceil(items.length / cols);
  const y0 = o.y ?? 2.45, gap = o.gap ?? 0.28;
  const w = (11.93 - gap * (cols - 1)) / cols;
  const h = o.h ?? (rows === 1 ? 3.9 : 1.85);
  items.forEach((it, i) => {
    const cx = 0.7 + (i % cols) * (w + gap);
    const cy = y0 + Math.floor(i / cols) * (h + gap);
    s.addShape(pres.ShapeType.roundRect, {
      x: cx, y: cy, w, h, rectRadius: 0.1,
      fill: { color: o.fill || C.white }, line: { color: C.line, width: 1 },
    });
    s.addShape(pres.ShapeType.rect, {
      x: cx, y: cy, w: 0.07, h, fill: { color: o.accent || C.terra }, line: { color: o.accent || C.terra },
    });
    let ty = cy + 0.24;
    if (it.n) {
      s.addText(it.n, {
        x: cx + 0.32, y: ty, w: w - 0.6, h: 0.42, isTextBox: true, margin: 0,
        fontFace: F.h, fontSize: 22, bold: true, color: o.accent || C.terra, valign: "middle",
      });
      ty += 0.46;
    }
    s.addText(it.title, {
      x: cx + 0.32, y: ty, w: w - 0.6, h: 0.44, isTextBox: true, margin: 0,
      fontFace: F.h, fontSize: o.tSize || 19, bold: true, color: C.ink, valign: "middle",
    });
    if (it.body) {
      const bodyH = (cy + h) - (ty + 0.44) - 0.12;
      if (bodyH < 0.3) throw new Error(`卡片內文區過窄（${bodyH.toFixed(2)}"），請加高卡片：${it.title}`);
      s.addText(it.body, {
        x: cx + 0.32, y: ty + 0.44, w: w - 0.6, h: bodyH, isTextBox: true, margin: 0,
        fontFace: F.b, fontSize: o.bSize || 15, color: C.body, valign: "top", lineSpacing: 21,
      });
    }
  });
}
// 雙欄對照
function twoCol(s, L, R, o = {}) {
  const y = o.y ?? 2.45, h = o.h ?? 4.0, w = 5.82;
  [[0.7, L, L.accent || C.muted], [7.15, R, R.accent || C.sage]].forEach(([x, col, ac]) => {
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w, h, rectRadius: 0.1, fill: { color: col.fill || C.white }, line: { color: C.line, width: 1 },
    });
    s.addShape(pres.ShapeType.rect, { x, y, w, h: 0.5, fill: { color: ac }, line: { color: ac } });
    s.addText(col.title, {
      x: x + 0.28, y, w: w - 0.56, h: 0.5, isTextBox: true, margin: 0,
      fontFace: F.h, fontSize: 18, bold: true, color: C.white, valign: "middle",
    });
    s.addText(col.items.map((t, i) => ({
      text: t, options: { bullet: { code: "25CF" }, breakLine: i !== col.items.length - 1 },
    })), {
      x: x + 0.3, y: y + 0.68, w: w - 0.6, h: h - 0.9, isTextBox: true,
      fontFace: F.b, fontSize: o.size || 17, color: C.body, lineSpacing: 24, paraSpaceAfter: 10, valign: "top",
    });
  });
}
// 迷思澄清
function myth(s, wrong, right, o = {}) {
  twoCol(s, { title: "✕　常見誤解", items: wrong, accent: "9A5B4A", fill: "F6EAE4" },
            { title: "✓　正確理解", items: right, accent: C.sage, fill: C.white }, o);
}
// 橫向流程
function flow(s, steps, o = {}) {
  const y = o.y ?? 2.7, h = o.h ?? 1.5, gap = 0.2;
  const w = (11.93 - gap * (steps.length - 1)) / steps.length;
  steps.forEach((st, i) => {
    const x = 0.7 + i * (w + gap);
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w, h, rectRadius: 0.08,
      fill: { color: i === (o.hot ?? -1) ? C.terraBg : C.white }, line: { color: C.line, width: 1 },
    });
    s.addText(st.k, {
      x, y: y + 0.18, w, h: 0.4, isTextBox: true, margin: 0, align: "center",
      fontFace: F.h, fontSize: 18, bold: true, color: i === (o.hot ?? -1) ? C.terra : C.ink,
    });
    s.addText(st.v, {
      x: x + 0.15, y: y + 0.62, w: w - 0.3, h: h - 0.75, isTextBox: true, margin: 0, align: "center",
      fontFace: F.b, fontSize: 14, color: C.body, lineSpacing: 19, valign: "top",
    });
    if (i < steps.length - 1) {
      s.addShape(pres.ShapeType.rightArrow, {
        x: x + w + 0.02, y: y + h / 2 - 0.09, w: gap - 0.04, h: 0.18,
        fill: { color: C.muted }, line: { color: C.muted },
      });
    }
  });
}
// 大數字
function stats(s, arr, o = {}) {
  const y = o.y ?? 2.6, gap = 0.3;
  const w = (11.93 - gap * (arr.length - 1)) / arr.length;
  arr.forEach((it, i) => {
    const x = 0.7 + i * (w + gap);
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w, h: o.h ?? 2.5, rectRadius: 0.1,
      fill: { color: it.hot ? C.ink : C.white }, line: { color: it.hot ? C.ink : C.line, width: 1 },
    });
    s.addText(it.value, {
      x, y: y + 0.32, w, h: 1.1, isTextBox: true, margin: 0, align: "center",
      fontFace: F.h, fontSize: o.vSize || 54, bold: true, color: it.hot ? C.white : C.terra,
    });
    s.addText(it.label, {
      x, y: y + 1.45, w, h: 0.38, isTextBox: true, margin: 0, align: "center",
      fontFace: F.h, fontSize: 17, bold: true, color: it.hot ? C.white : C.ink,
    });
    if (it.note) s.addText(it.note, {
      x: x + 0.2, y: y + 1.82, w: w - 0.4, h: 0.6, isTextBox: true, margin: 0, align: "center",
      fontFace: F.b, fontSize: 13, color: it.hot ? C.line : C.muted, lineSpacing: 17,
    });
  });
}
// 表格
function table(s, head, rows, o = {}) {
  const colW = o.colW;
  const th = head.map(t => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.deep }, fontSize: o.hSize || 15, align: "left", valign: "middle" } }));
  const tr = rows.map((r, i) => r.map((cell, j) => ({
    text: typeof cell === "string" ? cell : cell.text,
    options: Object.assign({
      color: j === 0 ? C.ink : C.body, bold: j === 0,
      fill: { color: i % 2 ? C.card : C.white }, fontSize: o.size || 14,
      align: "left", valign: "middle",
    }, (typeof cell === "object" && cell.options) || {}),
  })));
  s.addTable([th, ...tr], {
    x: o.x ?? 0.7, y: o.y ?? 2.45, w: 11.93, colW,
    border: { type: "solid", color: C.line, pt: 1 },
    fontFace: F.b, rowH: o.rowH ?? 0.42, margin: [4, 8, 4, 8],
  });
}
// 重點條（金句）
function keyLine(s, text, o = {}) {
  const y = o.y ?? 6.05;
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.7, y, w: 11.93, h: 0.72, rectRadius: 0.1,
    fill: { color: o.dark ? C.ink : C.terraBg }, line: { color: o.dark ? C.ink : C.terraBg },
  });
  s.addText(text, {
    x: 1.0, y, w: 11.4, h: 0.72, isTextBox: true, margin: 0, valign: "middle",
    fontFace: F.h, fontSize: o.size || 18, bold: true, color: o.dark ? C.white : C.terra,
  });
}

// ═══════════════════════════════════════════════════════
// A. 開場（P1–P6）引起動機
// ═══════════════════════════════════════════════════════
{
  const s = darkPage();
  s.addShape(pres.ShapeType.rect, { x: 8.6, y: 0, w: 4.733, h: 7.5, fill: { color: C.deep }, line: { color: C.deep } });
  s.addShape(pres.ShapeType.roundRect, { x: 9.3, y: 1.1, w: 3.3, h: 3.3, rectRadius: 0.16, fill: { color: C.terra }, line: { color: C.terra } });
  s.addText("看得懂\n數字\n才敢\n做決定", {
    x: 9.3, y: 1.1, w: 3.3, h: 3.3, isTextBox: true, margin: 0, align: "center", valign: "middle",
    fontFace: F.h, fontSize: 30, bold: true, color: C.white, lineSpacing: 40,
  });
  s.addText("企業內訓課程｜8 小時", {
    x: 0.95, y: 1.35, w: 7.4, h: 0.45, isTextBox: true, margin: 0,
    fontFace: F.h, fontSize: 17, bold: true, color: C.terra, charSpacing: 2,
  });
  s.addText("行銷數據解讀\n與成效分析基礎", {
    x: 0.9, y: 2.0, w: 7.6, h: 2.5, isTextBox: true, margin: 0,
    fontFace: F.h, fontSize: 54, bold: true, color: C.white, lineSpacing: 66,
  });
  s.addShape(pres.ShapeType.rect, { x: 0.95, y: 4.72, w: 1.4, h: 0.06, fill: { color: C.terra }, line: { color: C.terra } });
  s.addText("從看報表到下判斷，一天走完一輪", {
    x: 0.95, y: 4.95, w: 7.4, h: 0.45, isTextBox: true, margin: 0,
    fontFace: F.b, fontSize: 19, color: C.line,
  });
  s.addText("2026.09.18（四）　9:00–17:00", {
    x: 0.95, y: 5.65, w: 7.4, h: 0.38, isTextBox: true, margin: 0,
    fontFace: F.b, fontSize: 16, color: C.muted,
  });
  s.addText("講師：黃皇賓　｜　知育行銷有限公司 執行長", {
    x: 0.95, y: 6.05, w: 7.4, h: 0.38, isTextBox: true, margin: 0,
    fontFace: F.b, fontSize: 16, color: C.muted,
  });
  s.addNotes("開場 3 分鐘。先自我介紹，再說今天的承諾：下課時每個人手上都有一張自己的診斷表，回公司就能用。不要在封面停超過 1 分鐘。");
}

{
  const s = page({ badge: "講師", title: "我是誰，為什麼講這個", accent: C.terra });
  cards(s, [
    { n: "07", title: "年電商實戰", body: "從廣告投手到整體行銷規劃，經手過從零開始與從谷底翻身的帳戶。" },
    { n: "04", title: "條業務線", body: "廣告代操、企業輔導培訓、品牌與社群內容、數位行銷授課，四線同時在跑。" },
    { n: "10+", title: "個長期客戶", body: "食品、農產、教育、餐飲、飯店與婚顧，以傳統產業數位轉型為主。" },
  ], { cols: 3, h: 2.25, y: 2.45 });
  bullets(s, [
    "今天的內容都來自實際帳戶與實際報告，不是教科書上的定義。",
    "我犯過的錯會全部講給你聽，可以少繞一年的路。",
  ], { y: 4.9, h: 1.0, size: 18 });
  s.addNotes("講一個自己判斷錯誤、燒掉預算的真實案例，30 秒內收。建立「我跟你一樣在現場」的位置，比講頭銜有用。");
}

{
  const s = page({ badge: "期待對焦", title: "今天談什麼，不談什麼", accent: C.sage });
  twoCol(s,
    { title: "今天不談", accent: "9A5B4A", fill: "F6EAE4", items: [
      "統計學理論、迴歸分析、機器學習",
      "把工具介面從頭點到尾的操作教學",
      "「數據驅動」這四個字的哲學辯論",
      "只有大預算才做得起來的方法",
    ] },
    { title: "今天要談", accent: C.sage, items: [
      "一個數字出現時，先看它在漏斗的哪一層",
      "怎麼判斷「這個數字算好還是算差」",
      "找出成效卡住的那一個斷點",
      "把判斷寫成老闆看得懂的一頁報告",
    ] }, { y: 2.4, h: 3.6 });
  keyLine(s, "驗收標準：下課時你能對任何一組廣告數據，說出三個具體動作。", { y: 6.15 });
  s.addNotes("期待對焦是防止客訴的關鍵。明確講出不談什麼，學員才不會整天等一個不會來的東西。花 2 分鐘就好。");
}

{
  const s = page({ badge: "課程地圖", title: "一天的路線", sub: "四個模組，每個模組結束都有一次動手練習", accent: C.terra });
  table(s, ["時間", "模組", "你會帶走什麼"], [
    ["09:00–10:30", "模組一　數據思維與指標地圖", "看到任何指標，知道它屬於哪一層、回答什麼問題"],
    ["10:40–12:00", "模組二　平台數據怎麼看", "Meta、GA4、後台訂單三方數字對不起來時怎麼判斷"],
    ["13:00–14:30", "模組三　五大指標優化模型", "用診斷表找出成效斷點，對應到具體動作"],
    ["14:40–16:00", "模組四　成效報告與決策", "一頁報告的骨架與週報模板，直接套用"],
    ["16:10–17:00", "綜合演練與問答", "現場完成一份自己帳戶的診斷與週報摘要"],
  ], { y: 2.45, colW: [2.0, 4.1, 5.83], rowH: 0.62, size: 15 });
  keyLine(s, "全程手機可以拍，簡報下課後給檔；練習時間請優先用自己公司的真實數字。", { y: 6.05 });
  s.addNotes("休息時間：10:30、12:00 午餐、14:30、16:00。實際上課依現場調整，但一定要守午餐時間。");
}

{
  const s = darkPage();
  s.addText("老闆走過來問：", {
    x: 1.2, y: 1.9, w: 11, h: 0.6, isTextBox: true, margin: 0,
    fontFace: F.b, fontSize: 24, color: C.muted,
  });
  s.addText("「這波廣告到底\n有沒有效？」", {
    x: 1.15, y: 2.55, w: 11.2, h: 2.4, isTextBox: true, margin: 0,
    fontFace: F.h, fontSize: 62, bold: true, color: C.white, lineSpacing: 78,
  });
  s.addText("你有 30 秒。你會先說哪一個數字？", {
    x: 1.2, y: 5.25, w: 11, h: 0.6, isTextBox: true, margin: 0,
    fontFace: F.h, fontSize: 26, bold: true, color: C.terra,
  });
  PAGE; // 深色頁不放頁碼
  s.addNotes("這頁停 30 秒，讓學員真的想。點兩位回答，把答案寫在白板上，最後一頁再回來對照。這是整天的錨點。");
}

{
  const s = page({ badge: "開場診斷", title: "三個數字，你敢下判斷嗎", sub: "同一個帳戶、同一週、三個廣告組合", accent: C.terra });
  stats(s, [
    { value: "3.2%", label: "點擊率 CTR", note: "看起來不錯" },
    { value: "0.8%", label: "轉換率 CVR", note: "看起來很差" },
    { value: "NT$820", label: "單次購買成本", note: "算好還是算差？", hot: true },
  ], { y: 2.6, h: 2.6 });
  bullets(s, [
    "少了三件事，這三個數字沒辦法判斷：客單價多少、毛利率多少、上週是多少。",
    "數據判讀的第一個動作，是把缺的脈絡補回來，而不是急著給結論。",
  ], { y: 5.5, h: 1.1, size: 18 });
  s.addNotes("刻意給不完整的資訊，讓學員發現自己會下意識猜。帶出模組一的核心：一個數字沒有比較對象就沒有意義。");
}

// ═══════════════════════════════════════════════════════
// B. 模組一：數據思維與指標地圖（P7–P20）
// ═══════════════════════════════════════════════════════
{
  const s = darkPage();
  s.addText("模組一", {
    x: 1.2, y: 2.2, w: 11, h: 0.6, isTextBox: true, margin: 0,
    fontFace: F.h, fontSize: 22, bold: true, color: C.terra, charSpacing: 4,
  });
  s.addText("數據思維與指標地圖", {
    x: 1.15, y: 2.85, w: 11.2, h: 1.2, isTextBox: true, margin: 0,
    fontFace: F.h, fontSize: 48, bold: true, color: C.white,
  });
  s.addShape(pres.ShapeType.rect, { x: 1.2, y: 4.25, w: 1.4, h: 0.06, fill: { color: C.terra }, line: { color: C.terra } });
  s.addText("09:00–10:30　｜　建立共同語言：漏斗四層、比較基準、分母思維", {
    x: 1.2, y: 4.55, w: 11, h: 0.5, isTextBox: true, margin: 0,
    fontFace: F.b, fontSize: 19, color: C.line,
  });
  s.addNotes("過場頁只停 15 秒，直接進下一頁。");
}

{
  const s = page({ badge: "迷思 1／3", title: "數據的用途只有一個", sub: "把它從「交差的素材」變成「決策的依據」", accent: C.terra });
  myth(s,
    ["月底整理一份報表交給老闆，任務完成", "數字好看就放大、數字難看就少講", "報表愈完整愈好，能放的欄位都放上去", "看完報表，下週還是照原本的做法跑"],
    ["每個數字都要指向一個「下週要改什麼」", "難看的數字才有情報價值，好看的只是結果", "只留能改變決定的欄位，其他都是雜訊", "看完報表，至少產生三個具體動作"],
    { y: 2.45, h: 3.5 });
  keyLine(s, "檢查方法：把這份報表刪掉，下週的做法會不一樣嗎？不會，就代表這份報表沒用。", { y: 6.1 });
  s.addNotes("這裡要壓住一個觀念：報表不是產出，決定才是產出。可以問現場「你們公司的月報，看完真的會改做法嗎」，通常會笑。");
}

{
  const s = page({ badge: "核心觀念", title: "一個數字要有比較對象", sub: "三種比較，缺一種判斷就會歪", accent: C.terra });
  cards(s, [
    { n: "1", title: "跟自己的過去比", body: "上週、上月、去年同期。看趨勢與波動，排除季節性因素。\n\n最常用，也最可靠。" },
    { n: "2", title: "跟目標比", body: "毛利能承受的 CPA 上限、預算的 ROAS 門檻。\n\n沒有目標值，所有數字都是中性的。" },
    { n: "3", title: "跟同類比", body: "同產業、同素材型態、同受眾的合理區間。\n\n參考用，不能當標準答案。" },
  ], { cols: 3, h: 3.2, y: 2.5 });
  keyLine(s, "看到數字先問：跟什麼比？沒有答案就先別下結論。", { y: 6.0 });
  s.addNotes("強調第二項「跟目標比」最常被忽略。多數公司沒算過自己的 CPA 上限，所以永遠在吵廣告貴不貴。這條會在模組三接回來。");
}

{
  const s = page({ badge: "指標地圖", title: "行銷漏斗的四層", sub: "每一層的數字回答不同的問題，不能混著看", accent: C.terra });
  flow(s, [
    { k: "曝光層", v: "有多少人看到\nCPM・觸及・頻率" },
    { k: "互動層", v: "有多少人被吸引\nCTR・CPC・完播率" },
    { k: "到站層", v: "有多少人留下來\n工作階段・跳出率" },
    { k: "轉換層", v: "有多少人付錢\nCVR・CPA・ROAS" },
    { k: "留存層", v: "有多少人回來\n回購率・LTV" },
  ], { y: 2.7, h: 1.8 });
  bullets(s, [
    "上一層的品質決定下一層的數量，但下一層的問題不一定出在上一層。",
    "每一次診斷，先定位問題在哪一層，再談要改什麼。順序反過來就會亂改。",
  ], { y: 4.9, h: 1.1, size: 18 });
  s.addNotes("這是整天最重要的一張圖，後面每個模組都會回來指這張。可以請學員把它抄在筆記第一頁。");
}

{
  const s = page({ badge: "指標地圖", title: "每一層在回答什麼問題", accent: C.sage });
  table(s, ["層級", "核心問題", "主要指標", "數字不好時，動哪裡"], [
    ["曝光層", "有沒有觸及到對的人", "CPM、觸及人數、頻率", "受眾設定、出價方式、預算分配"],
    ["互動層", "素材有沒有攔住他", "CTR、CPC、觀看率、完播率", "素材、標題、前三秒、受眾契合度"],
    ["到站層", "到站後有沒有留下來", "工作階段、停留時間、跳出率", "載入速度、頁面第一屏、訊息一致性"],
    ["轉換層", "他願不願意付錢", "CVR、CPA、ROAS、客單價", "商品組合、價格、信任元素、結帳流程"],
    ["留存層", "他會不會再回來", "回購率、LTV、回購週期", "再行銷、會員經營、售後接觸點"],
  ], { y: 2.45, colW: [1.5, 2.9, 3.6, 3.93], rowH: 0.7, size: 14 });
  s.addNotes("這張表印成 A4 發下去。學員之後回公司最常用的就是最右邊那一欄。");
}

{
  const s = page({ badge: "指標拆解", title: "曝光層：三個數字", sub: "廣告有沒有被看到，以及被同一群人看了幾次", accent: C.terra });
  cards(s, [
    { n: "CPM", title: "千次曝光成本", body: "把廣告推給 1,000 次曝光要多少錢。\n\n反映的是競爭程度與素材品質，不是你的操作技術。\n\n節慶檔期會整體上升。" },
    { n: "觸及", title: "實際看到的人數", body: "不重複的人數。\n\n跟曝光次數不同：10,000 次曝光可能只觸及 2,000 人。" },
    { n: "頻率", title: "曝光÷觸及", body: "同一個人平均看幾次。\n\n電商轉換型廣告，超過 3–4 就要留意素材疲乏。" },
  ], { cols: 3, h: 3.3, y: 2.45 });
  keyLine(s, "CPM 上升不一定是壞事，要看 CTR 有沒有跟著掉。兩個一起看才有意義。", { y: 6.05 });
  s.addNotes("補充：CPM 受眾愈窄通常愈貴。舉例高雄在地服務業的受眾窄，CPM 自然比全台電商高，不能直接拿去比。");
}

{
  const s = page({ badge: "指標拆解", title: "互動層：素材的體檢報告", accent: C.terra });
  table(s, ["指標", "算法", "它在告訴你什麼", "常見合理區間"], [
    ["CTR（連結點擊率）", "連結點擊 ÷ 曝光", "素材與受眾的契合度", "電商 1%–2.5%"],
    ["CPC（單次點擊成本）", "花費 ÷ 連結點擊", "把人帶到網站的效率", "依產業差異大"],
    ["三秒播放率", "三秒觀看 ÷ 曝光", "前三秒有沒有攔住人", "20%–35%"],
    ["完播率", "看完 ÷ 開始播放", "內容結構與長度是否合適", "短影音 15%–30%"],
    ["互動率", "（讚+留言+分享）÷ 觸及", "內容的社群共鳴", "參考用，與轉換無直接關係"],
  ], { y: 2.45, colW: [3.0, 2.8, 3.8, 2.33], rowH: 0.66, size: 14 });
  keyLine(s, "區間只是參考。你自己帳戶過去三個月的中位數，才是真正的基準線。", { y: 6.2 });
  s.addNotes("特別強調最後一列：互動率高不代表會賣。很多客戶被「這支影片爆了」誤導，結果一張訂單都沒有。");
}

{
  const s = page({ badge: "指標拆解", title: "轉換層：老闆真正在意的", accent: C.terra });
  cards(s, [
    { n: "CVR", title: "轉換率", body: "購買 ÷ 連結點擊。\n反映頁面與商品的說服力。\n電商常見 1%–3%。" },
    { n: "CPA", title: "單次成果成本", body: "花費 ÷ 成果數。\n跟毛利比較才知道能不能撐。" },
    { n: "ROAS", title: "廣告投報率", body: "廣告收入 ÷ 廣告花費。\n要搭配毛利率看，不能只看倍數。" },
    { n: "AOV", title: "平均客單價", body: "營收 ÷ 訂單數。\n提高它，等於直接降低 CPA 壓力。" },
  ], { cols: 4, h: 3.1, y: 2.45, bSize: 14 });
  keyLine(s, "四個一起看：CVR 管說服、CPA 管效率、ROAS 管獲利、AOV 管空間。", { y: 6.0 });
  s.addNotes("AOV 是最少人動的槓桿。舉例：客單從 800 提到 1,200，同樣的 CPA 就從危險變安全，不用改半個廣告設定。");
}

{
  const s = page({ badge: "指標拆解", title: "留存層：被忽略的獲利區", sub: "新客成本一直漲，賺不賺錢愈來愈靠第二次", accent: C.sage });
  stats(s, [
    { value: "5–7×", label: "獲取新客 vs 留住舊客", note: "取得一個新客的成本，是留住舊客的數倍" },
    { value: "30–90天", label: "回購週期", note: "食品、保養品的關鍵觀察窗" },
    { value: "LTV > 3×CAC", label: "健康門檻", note: "顧客終身價值要能覆蓋獲取成本" },
  ], { y: 2.6, h: 2.6, vSize: 40 });
  bullets(s, [
    "只看單次 ROAS，會把所有需要第二次購買才回本的生意判死刑。",
    "先算清楚「第幾次購買才開始賺錢」，再回頭決定新客能出到多少錢。",
  ], { y: 5.5, h: 1.1, size: 18 });
  s.addNotes("這裡用如記食品那類健康食品舉例：七日組合是入門，真正的獲利在第二次、第三次回購。不要點名客戶，用「某食品客戶」帶過。");
}

{
  const s = page({ badge: "迷思 2／3", title: "按讚多就代表有效", accent: C.terra });
  myth(s,
    ["貼文兩千個讚，這波一定有效", "分享數高，代表受眾很精準", "互動好的素材，拿去投廣告一定好", "數據好看就先報給老闆"],
    ["互動與轉換是兩層，分開看", "分享數高代表內容有趣，跟購買意願無關", "互動型素材要重剪成轉換型才投", "報之前先往下看一層：有沒有帶來行為"],
    { y: 2.45, h: 3.5, size: 16 });
  keyLine(s, "跨層推論是最常見的誤判。上一層的好表現，不會自動變成下一層的結果。", { y: 6.1 });
  s.addNotes("這裡放一個真實對比：某支影片 10 萬觀看 0 訂單，另一支 8 千觀看 32 張訂單。學員印象會很深。");
}

{
  const s = page({ badge: "核心觀念", title: "所有比率，先問分母", sub: "同一個「轉換率」，分母不同意義完全不同", accent: C.terra });
  table(s, ["寫法", "分母是什麼", "算出來的意思", "誰在用"], [
    ["轉換率", "連結點擊數", "點進來的人有多少比例買單", "廣告優化人員"],
    ["轉換率", "工作階段數", "每一次造訪的成交機率", "GA4 網站分析"],
    ["轉換率", "觸及人數", "看過廣告的人有多少比例買單", "品牌端估算"],
    ["轉換率", "加入購物車數", "購物車到結帳的完成率", "電商營運"],
  ], { y: 2.5, colW: [2.2, 2.8, 4.5, 2.43], rowH: 0.68, size: 15 });
  keyLine(s, "開會前先對齊分母，可以省下一半的爭論時間。", { y: 6.15 });
  s.addNotes("這是實務上最常吵架的點：行銷說轉換率 2%，電商說 0.8%，兩邊都沒錯，分母不同。要求學員以後報數字一律附分母。");
}

{
  const s = page({ badge: "基準線", title: "自己的基準怎麼訂", sub: "四個步驟，半小時內就能建出一張基準表", accent: C.sage });
  flow(s, [
    { k: "1　撈資料", v: "抓過去 90 天\n每週的指標" },
    { k: "2　取中位數", v: "用中位數，\n不用平均數" },
    { k: "3　畫區間", v: "上下各抓\n±20% 為正常帶" },
    { k: "4　設紅線", v: "超出區間\n就啟動檢查" },
  ], { y: 2.8, h: 1.7 });
  bullets(s, [
    "用中位數的理由：一次大檔期或一次失誤，就會把平均數拉到失真。",
    "每季重算一次。市場競爭與素材成本會移動，去年的基準撐不到今年。",
    "基準表要分裝置、分廣告目標分開建，手機與桌機的數字不能混在一起看。",
  ], { y: 4.9, h: 1.4, size: 17 });
  s.addNotes("現場可以打開 Excel 示範一次：三欄（指標、中位數、正常區間），五分鐘做完。學員回去照抄就有。");
}

{
  const s = page({ badge: "案例", title: "兩組廣告，誰比較好", sub: "同一個客戶、同一週、同樣預算 NT$30,000", accent: C.terra });
  table(s, ["", "A 組（形象影片）", "B 組（商品開箱）", "誰贏"], [
    ["曝光", "412,000", "186,000", "A"],
    ["CTR", "0.9%", "2.4%", "B"],
    ["連結點擊", "3,708", "4,464", "B"],
    ["CPC", "NT$8.1", "NT$6.7", "B"],
    ["購買數", "31", "44", "B"],
    ["CPA", "NT$968", "NT$682", "B"],
    ["ROAS", "1.9", "2.8", { text: "B", options: { bold: true, color: C.terra } }],
  ], { y: 2.45, colW: [2.4, 3.6, 3.6, 2.33], rowH: 0.52, size: 14 });
  keyLine(s, "A 組的曝光是 B 組的兩倍多。只看曝光報告，你會做出完全相反的決定。", { y: 6.3 });
  s.addNotes("問學員：如果老闆只看得懂「多少人看到」，你要怎麼講？引導出「用同一個預算能買到幾張訂單」這種翻譯方式。");
}

{
  const s = darkPage();
  s.addText("練習 1", {
    x: 1.2, y: 1.5, w: 11, h: 0.55, isTextBox: true, margin: 0,
    fontFace: F.h, fontSize: 20, bold: true, color: C.terra, charSpacing: 4,
  });
  s.addText("把你手上的指標\n放進地圖", {
    x: 1.15, y: 2.05, w: 8.0, h: 1.8, isTextBox: true, margin: 0,
    fontFace: F.h, fontSize: 42, bold: true, color: C.white, lineSpacing: 54,
  });
  s.addText([
    { text: "15 分鐘，兩人一組", options: { bold: true, breakLine: true, color: C.terra, fontSize: 20 } },
    { text: "1. 打開你們公司現在在看的那份報表", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "2. 每個欄位標上它屬於漏斗哪一層", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "3. 圈出你完全說不出用途的欄位", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "4. 找出你缺了哪一層，完全沒在看", options: { bullet: { code: "25CF" } } },
  ], {
    x: 1.2, y: 4.1, w: 7.8, h: 2.6, isTextBox: true,
    fontFace: F.b, fontSize: 17, color: C.line, lineSpacing: 26, paraSpaceAfter: 8,
  });
  s.addShape(pres.ShapeType.roundRect, { x: 9.4, y: 2.2, w: 2.9, h: 2.9, rectRadius: 0.14, fill: { color: C.deep }, line: { color: C.terra, width: 2 } });
  s.addText("最常缺的\n是留存層", {
    x: 9.4, y: 2.2, w: 2.9, h: 2.9, isTextBox: true, margin: 0, align: "center", valign: "middle",
    fontFace: F.h, fontSize: 24, bold: true, color: C.white, lineSpacing: 34,
  });
  s.addNotes("巡場時重點看兩件事：有沒有人把互動指標當成轉換指標、有沒有人整份報表都在曝光層。收尾請兩組分享缺了哪一層。");
}

// ═══════════════════════════════════════════════════════
// C. 模組二：平台數據怎麼看（P21–P34）
// ═══════════════════════════════════════════════════════
{
  const s = darkPage();
  s.addText("模組二", { x: 1.2, y: 2.2, w: 11, h: 0.6, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 22, bold: true, color: C.terra, charSpacing: 4 });
  s.addText("平台數據怎麼看", { x: 1.15, y: 2.85, w: 11.2, h: 1.2, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 48, bold: true, color: C.white });
  s.addShape(pres.ShapeType.rect, { x: 1.2, y: 4.25, w: 1.4, h: 0.06, fill: { color: C.terra }, line: { color: C.terra } });
  s.addText("10:40–12:00　｜　Meta、GA4、後台訂單：三方數字對不起來的時候", { x: 1.2, y: 4.55, w: 11, h: 0.5, isTextBox: true, margin: 0, fontFace: F.b, fontSize: 19, color: C.line });
  s.addNotes("過場頁 15 秒。");
}

{
  const s = page({ badge: "資料來源", title: "三個來源，三種真相", sub: "它們算的東西本來就不一樣，對不起來很正常", accent: C.terra });
  cards(s, [
    { n: "A", title: "Meta 廣告管理員", body: "算的是「廣告的功勞」。\n\n以像素回傳為準，含瀏覽後轉換，會高估。\n\n用途：判斷素材與受眾好壞。" },
    { n: "B", title: "GA4", body: "算的是「網站的行為」。\n\n以最終點擊管道歸因，會低估廣告。\n\n用途：看站內動線與流量結構。" },
    { n: "C", title: "後台訂單", body: "算的是「真的收到的錢」。\n\n唯一能對帳的數字。\n\n用途：算獲利、發獎金、跟老闆報告。" },
  ], { cols: 3, h: 3.3, y: 2.45 });
  keyLine(s, "對帳看後台，看趨勢看平台。不要拿三邊的絕對值互相打架。", { y: 6.05 });
  s.addNotes("先講結論再解釋，學員會鬆一口氣：原來不是自己設定壞掉。這頁是模組二的定調頁。");
}

{
  const s = page({ badge: "關鍵機制", title: "歸因窗：功勞算給誰", sub: "同一張訂單，在不同設定下會被算給不同人", accent: C.terra });
  flow(s, [
    { k: "Day 0", v: "看到廣告\n沒有點" },
    { k: "Day 1", v: "點了廣告\n沒有買" },
    { k: "Day 3", v: "搜尋品牌名\n進到官網" },
    { k: "Day 5", v: "看到 EDM\n完成購買" },
  ], { y: 2.75, h: 1.55, hot: 3 });
  table(s, ["歸因設定", "這張訂單算給誰"], [
    ["Meta 預設（點擊後 7 天 + 瀏覽後 1 天）", "算給 Meta 廣告"],
    ["GA4 預設（跨管道最終點擊）", "算給 Email"],
    ["最初接觸歸因", "算給 Meta 廣告"],
    ["後台訂單來源欄位（多數只記最後一個 UTM）", "算給 Email"],
  ], { y: 4.55, colW: [6.5, 5.43], rowH: 0.42, size: 14 });
  s.addNotes("這頁講慢一點，畫在白板上更好懂。重點是：沒有一個設定是對的，只有「你選了哪一種視角」。");
}

{
  const s = page({ badge: "實務設定", title: "歸因窗要怎麼選", accent: C.sage });
  twoCol(s,
    { title: "短決策週期（食品、日用品）", accent: C.terra, items: [
      "點擊後 7 天 + 瀏覽後 1 天，維持預設即可",
      "客單低、當下決定，拉長窗口只會虛增",
      "回頭比對後台訂單，差距抓在 15% 以內算健康",
    ] },
    { title: "長決策週期（課程、高單價、B2B）", accent: C.sage, items: [
      "點擊後 7 天太短，會嚴重低估廣告貢獻",
      "同時看「最初接觸」與「最終點擊」兩份數字",
      "務必搭配問卷或客服詢問「你從哪裡看到我們」",
    ] },
    { y: 2.45, h: 3.5 });
  keyLine(s, "換歸因設定等於換計分規則。中途換了，就不能拿前後兩段數據直接比。", { y: 6.1 });
  s.addNotes("提醒：iOS 隱私政策之後，瀏覽後轉換的可信度下降，但趨勢仍可用。不要陷入技術細節，5 分鐘帶過。");
}

{
  const s = page({ badge: "Meta", title: "廣告管理員的三層結構", sub: "數字不好時，先確認該動哪一層", accent: C.terra });
  flow(s, [
    { k: "廣告活動", v: "決定目標與預算\n（流量？轉換？）" },
    { k: "廣告組合", v: "決定受眾、版位\n出價與排程" },
    { k: "廣告", v: "決定素材與文案\n落地頁連結" },
  ], { y: 2.75, h: 1.7 });
  table(s, ["症狀出現在", "對應該動的層級"], [
    ["成果類型根本不對（拿到流量但沒有購買）", "廣告活動：目標設定錯了"],
    ["CPM 異常高、受眾重疊、頻率飆升", "廣告組合：受眾與出價"],
    ["CTR 低、素材疲乏、訊息不一致", "廣告：素材與文案"],
  ], { y: 4.75, colW: [7.0, 4.93], rowH: 0.48, size: 14 });
  s.addNotes("常見錯誤：目標設流量卻期待訂單。系統會老實地把最會亂點的人找給你。這個例子一定要講。");
}

{
  const s = page({ badge: "Meta", title: "欄位自訂：只留這九個", sub: "把預設欄位全部關掉，存成自訂欄位範本，每次開報表直接套", accent: C.terra });
  cards(s, [
    { title: "① 花費", body: "所有效率計算的分母" },
    { title: "② CPM", body: "市場競爭溫度計" },
    { title: "③ 頻率", body: "素材疲乏預警" },
    { title: "④ 連結點擊率", body: "素材吸引力" },
    { title: "⑤ CPC", body: "帶人進站的效率" },
    { title: "⑥ 購買次數", body: "真正的成果" },
    { title: "⑦ 單次購買成本", body: "跟毛利比較的對象" },
    { title: "⑧ 購買轉換價值", body: "算 ROAS 的分子" },
    { title: "⑨ ROAS", body: "獲利的第一道判斷" },
  ], { cols: 3, h: 1.25, y: 2.45, gap: 0.24, tSize: 18, bSize: 14 });
  s.addNotes("現場示範一次「自訂欄位 → 儲存為預設」。這是學員當天回去就會用的東西，示範價值最高。");
}

{
  const s = page({ badge: "GA4", title: "四個報表就夠用", sub: "其他的等你真的有問題再打開", accent: C.sage });
  cards(s, [
    { n: "01", title: "流量開發", body: "流量從哪來、哪個管道帶來的人最會買。\n\n看「工作階段主要管道群組」這一列。" },
    { n: "02", title: "頁面和畫面", body: "哪幾頁被看最多、哪幾頁把人擋掉。\n\n看平均參與時間與離開率。" },
    { n: "03", title: "轉換事件", body: "關鍵事件有沒有正常回傳、數量對不對。\n\n設定壞掉最先在這裡看到。" },
    { n: "04", title: "探索報表", body: "自訂路徑與漏斗，回答具體問題。\n\n用來找「人在第幾步流失」。" },
  ], { cols: 4, h: 3.2, y: 2.5, accent: C.sage, bSize: 14 });
  keyLine(s, "GA4 的價值在「站內發生什麼事」，不在「廣告有沒有效」。角色分清楚就不會亂。", { y: 6.05 });
  s.addNotes("不要開介面亂逛，只示範流量開發與探索漏斗兩個。GA4 教學一失控就會吃掉一小時。");
}

{
  const s = page({ badge: "GA4", title: "最少要設的五個事件", sub: "沒有這五個，後面的分析都是猜的", accent: C.sage });
  table(s, ["事件", "代表的行為", "為什麼一定要有"], [
    ["view_item", "看了商品頁", "判斷哪個商品真的有人有興趣"],
    ["add_to_cart", "加入購物車", "分辨「不想買」與「買不下去」"],
    ["begin_checkout", "開始結帳", "結帳流程的流失就卡在這一段"],
    ["purchase", "完成購買", "所有轉換指標的分子，含金額參數"],
    ["generate_lead", "送出表單／加 LINE", "服務業與 B2B 的主要成果"],
  ], { y: 2.5, colW: [2.8, 3.2, 5.93], rowH: 0.62, size: 15 });
  keyLine(s, "purchase 事件一定要帶金額參數，沒有金額就算不出 ROAS。", { y: 6.15 });
  s.addNotes("提醒現場：很多網站的 purchase 有裝但沒帶 value，報表看起來正常，一算 ROAS 就是零。請他們回去當天檢查。");
}

{
  const s = page({ badge: "工具", title: "UTM 命名規則", sub: "這張表直接抄回去用，全公司統一", accent: C.sage });
  table(s, ["參數", "填什麼", "範例", "規則"], [
    ["utm_source", "流量來源平台", "facebook / ig / line / edm", "全小寫，不用中文"],
    ["utm_medium", "流量型態", "cpc / social / email / referral", "只用這幾個固定值"],
    ["utm_campaign", "活動名稱", "2609_autumn_set", "年月_主題_型態"],
    ["utm_content", "素材識別", "video_a / image_b", "A/B 測試靠這欄分辨"],
    ["utm_term", "受眾或關鍵字", "lookalike_3 / keyword_x", "選填"],
  ], { y: 2.5, colW: [2.3, 2.6, 3.6, 3.43], rowH: 0.6, size: 14 });
  keyLine(s, "大小寫不一致，GA4 會當成兩個來源。命名規則寫成一頁 SOP，比任何工具都有效。", { y: 6.1 });
  s.addNotes("這頁務必請他們拍照。命名混亂是中小企業數據品質的第一殺手，修這個的投報率最高。");
}

{
  const s = page({ badge: "迷思 3／3", title: "數字對不起來就是有人做假", accent: C.terra });
  myth(s,
    ["Meta 說 44 筆，後台只有 31 筆，代理商灌水", "GA4 的廣告流量比 Meta 少，像素壞了", "三邊數字要完全一樣才叫正常", "數字不合就先停廣告觀察"],
    ["計算規則不同，差距 15%–30% 正常", "GA4 用最終點擊歸因，本來就少算廣告", "先對齊：時區、歸因窗、事件定義", "先查對齊項目，再談停不停"],
    { y: 2.45, h: 3.5, size: 16 });
  keyLine(s, "查核順序：時區 → 歸因窗 → 事件定義 → 退款與取消訂單。四步查完通常就找到了。", { y: 6.1 });
  s.addNotes("這頁對「有請代理商的企業」特別重要。教他們怎麼用正確的問題質疑代理商，而不是憑感覺不信任。");
}

{
  const s = page({ badge: "案例", title: "一筆訂單被算了兩次", sub: "某餐飲客戶，月報 ROAS 從 4.1 掉回 2.6 的真實過程", accent: C.terra });
  flow(s, [
    { k: "現象", v: "月報 ROAS 4.1\n財務說對不上" },
    { k: "查核", v: "感謝頁重整\n會重複觸發" },
    { k: "確認", v: "退款訂單\n沒有被扣除" },
    { k: "修正", v: "加上交易 ID\n去重與扣退" },
    { k: "結果", v: "實際 ROAS 2.6\n決策全部重來" },
  ], { y: 2.7, h: 1.8, hot: 4 });
  bullets(s, [
    "在錯的數字上做的每一個優化，都是把資源推往錯的方向。",
    "每季做一次數據健檢：像素去重、退款扣除、測試訂單排除，三項固定檢查。",
  ], { y: 4.9, h: 1.2, size: 18 });
  keyLine(s, "數字的可信度，是所有分析的前提。可信度沒解決，分析做再細都沒意義。", { y: 6.25 });
  s.addNotes("這個案例講的時候要誠實：當時是我們自己沒發現，被財務抓出來。誠實反而讓信任度提高。");
}

{
  const s = darkPage();
  s.addText("練習 2", { x: 1.2, y: 1.5, w: 11, h: 0.55, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 20, bold: true, color: C.terra, charSpacing: 4 });
  s.addText("數據健檢五分鐘", { x: 1.15, y: 2.05, w: 8.2, h: 1.0, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 42, bold: true, color: C.white });
  s.addText([
    { text: "20 分鐘，個人作業，打開手機或筆電", options: { bold: true, breakLine: true, color: C.terra, fontSize: 20 } },
    { text: "1. 檢查 GA4 的 purchase 事件有沒有帶金額", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "2. 檢查 Meta 的歸因設定目前是哪一種", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "3. 拉出上個月：Meta 訂單數 vs 後台訂單數", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "4. 算出兩邊差距幾 %，寫在筆記上", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "5. 沒有帳號權限的人，寫下回去要跟誰要", options: { bullet: { code: "25CF" } } },
  ], { x: 1.2, y: 3.35, w: 7.9, h: 3.2, isTextBox: true, fontFace: F.b, fontSize: 17, color: C.line, lineSpacing: 26, paraSpaceAfter: 8 });
  s.addShape(pres.ShapeType.roundRect, { x: 9.5, y: 2.6, w: 2.85, h: 2.3, rectRadius: 0.14, fill: { color: C.terra }, line: { color: C.terra } });
  s.addText("差距\n15–30%\n屬於正常", { x: 9.5, y: 2.6, w: 2.85, h: 2.3, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: F.h, fontSize: 26, bold: true, color: C.white, lineSpacing: 36 });
  s.addNotes("這是午休前最後一個練習。沒有帳號權限的人很多，第 5 點要特別唸出來，讓他們不會空手。12:00 準時放午餐。");
}

// ═══════════════════════════════════════════════════════
// D. 模組三：五大指標優化模型（P35–P50）
// ═══════════════════════════════════════════════════════
{
  const s = darkPage();
  s.addText("模組三", { x: 1.2, y: 2.2, w: 11, h: 0.6, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 22, bold: true, color: C.terra, charSpacing: 4 });
  s.addText("五大指標優化模型", { x: 1.15, y: 2.85, w: 11.2, h: 1.2, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 48, bold: true, color: C.white });
  s.addShape(pres.ShapeType.rect, { x: 1.2, y: 4.25, w: 1.4, h: 0.06, fill: { color: C.terra }, line: { color: C.terra } });
  s.addText("13:00–14:30　｜　從「看數據」到「找斷點」，今天的核心", { x: 1.2, y: 4.55, w: 11, h: 0.5, isTextBox: true, margin: 0, fontFace: F.b, fontSize: 19, color: C.line });
  s.addNotes("午休後第一頁，先做 2 分鐘的醒腦：請每組講一件上午最有感的事。");
}

{
  const s = page({ badge: "思維轉換", title: "看數據 vs 找斷點", accent: C.terra });
  twoCol(s,
    { title: "看數據的人", accent: "9A5B4A", fill: "F6EAE4", items: [
      "把每個指標念一遍：曝光多少、點擊多少",
      "看到數字變差，全部一起調",
      "同時換素材、換受眾、改預算",
      "下週數字變好了，說不出是哪個動作有效",
    ] },
    { title: "找斷點的人", accent: C.sage, items: [
      "先定位：問題卡在漏斗哪一層",
      "從上往下逐層檢查，第一個異常就是斷點",
      "一次只改一個變因，其他維持不動",
      "下週有結論：這個動作有效，記錄下來變成經驗",
    ] },
    { y: 2.45, h: 3.5 });
  keyLine(s, "優化的目的，是累積可重複的判斷。亂槍打中一次，下次還是從零開始。", { y: 6.1 });
  s.addNotes("這頁是模組三的定調。可以自嘲：我前三年都是左邊那種人，花了很多冤枉錢才換到右邊。");
}

{
  const s = page({ badge: "★ 核心框架", title: "五大指標優化模型", sub: "由上而下逐層檢查，第一個踩紅線的就是斷點", accent: C.terra });
  const items = [
    { n: "① CPM", t: "買不買得到人", d: "受眾與競爭" },
    { n: "② CTR", t: "攔不攔得住人", d: "素材與訴求" },
    { n: "③ CVR", t: "說不說服得了", d: "頁面與商品" },
    { n: "④ CPA", t: "划不划得來", d: "整體效率" },
    { n: "⑤ ROAS", t: "賺不賺得到錢", d: "獲利能力" },
  ];
  const w = (11.93 - 0.22 * 4) / 5;
  items.forEach((it, i) => {
    const x = 0.7 + i * (w + 0.22);
    s.addShape(pres.ShapeType.roundRect, { x, y: 2.5, w, h: 3.1, rectRadius: 0.1, fill: { color: i === 4 ? C.ink : C.white }, line: { color: i === 4 ? C.ink : C.line, width: 1 } });
    s.addShape(pres.ShapeType.rect, { x, y: 2.5, w, h: 0.12, fill: { color: C.terra }, line: { color: C.terra } });
    s.addText(it.n, { x, y: 2.85, w, h: 0.6, isTextBox: true, margin: 0, align: "center", fontFace: F.h, fontSize: 26, bold: true, color: i === 4 ? C.white : C.terra });
    s.addText(it.t, { x: x + 0.1, y: 3.6, w: w - 0.2, h: 0.9, isTextBox: true, margin: 0, align: "center", fontFace: F.h, fontSize: 19, bold: true, color: i === 4 ? C.white : C.ink, lineSpacing: 26 });
    s.addText(it.d, { x: x + 0.1, y: 4.6, w: w - 0.2, h: 0.5, isTextBox: true, margin: 0, align: "center", fontFace: F.b, fontSize: 15, color: i === 4 ? C.line : C.muted });
    if (i < 4) s.addShape(pres.ShapeType.rightArrow, { x: x + w + 0.02, y: 3.95, w: 0.18, h: 0.18, fill: { color: C.muted }, line: { color: C.muted } });
  });
  keyLine(s, "順序不能跳。CPM 沒問題才看 CTR，CTR 沒問題才看 CVR，逐層往下。", { y: 5.85 });
  s.addNotes("★ 全天最重要的一頁。請學員抄下來。強調這是順序性的檢查表，不是五個平行的指標。停留 5 分鐘。");
}

{
  const s = page({ badge: "指標 ①", title: "CPM：買不買得到人", sub: "它反映市場競爭與系統對你素材的評價", accent: C.terra });
  twoCol(s,
    { title: "CPM 異常上升的原因", accent: "9A5B4A", fill: "F6EAE4", items: [
      "受眾太窄，或多組廣告在搶同一群人",
      "檔期競爭（雙 11、母親節、年節）",
      "素材負面回饋高，系統降低推送品質",
      "版位限制太多，只投限定版位",
    ] },
    { title: "能動的四個動作", accent: C.sage, items: [
      "放寬受眾或開啟廣泛受眾，讓系統去找",
      "檢查受眾重疊，合併互相搶的廣告組合",
      "換素材：疲乏的素材 CPM 會持續墊高",
      "檔期因素就接受它，改算「這個 CPM 下還划不划算」",
    ] },
    { y: 2.45, h: 3.4 });
  keyLine(s, "CPM 變貴本身不是問題。CPM 變貴而 CTR 沒有跟著上來，才是問題。", { y: 6.0 });
  s.addNotes("補充：CPM 是少數你控制不了的指標。與其焦慮，不如把它當成環境參數，去調整能控制的素材與受眾。");
}

{
  const s = page({ badge: "指標 ②", title: "CTR：攔不攔得住人", sub: "低 CTR 只有兩種病因：素材錯了，或人找錯了", accent: C.terra });
  table(s, ["症狀", "判斷方法", "動作"], [
    ["CTR 全面偏低", "換三組完全不同訴求的素材測試", "素材問題：重做前三秒與主視覺"],
    ["CTR 忽高忽低", "看不同受眾的 CTR 落差", "受眾問題：留下高 CTR 的組合，關掉其他"],
    ["CTR 一路遞減", "看頻率是否超過 3–4", "疲乏問題：換素材，不是加預算"],
    ["CTR 高但沒訂單", "往下看 CVR 與落地頁", "期待落差：素材承諾與頁面內容不一致"],
  ], { y: 2.5, colW: [2.8, 4.3, 4.83], rowH: 0.68, size: 14 });
  keyLine(s, "測素材的紀律：一次三組，同一個受眾，跑滿 3–5 天或 50 次以上成果再判讀。", { y: 6.15 });
  s.addNotes("第四列是最常見的情況，下一頁會展開。這裡先埋伏筆。");
}

{
  const s = page({ badge: "指標 ③", title: "CVR：說不說服得了", sub: "點擊進來卻不買，問題幾乎都不在廣告", accent: C.terra });
  cards(s, [
    { n: "1", title: "訊息一致性", body: "廣告講「七日組合 599」，頁面第一屏要看得到同一件事。\n\n不一致，人會在三秒內離開。" },
    { n: "2", title: "載入速度", body: "手機超過 3 秒，流失一半以上。\n\n先壓縮圖片，這是投報率最高的修法。" },
    { n: "3", title: "信任元素", body: "評價、檢驗報告、退換貨說明、真人照片。\n\n傳統產業最缺的是這一塊。" },
    { n: "4", title: "結帳阻力", body: "必填欄位太多、沒有常用支付、運費最後才出現。\n\n每多一步，流失一段。" },
  ], { cols: 4, h: 3.2, y: 2.5, bSize: 14 });
  keyLine(s, "CVR 低的時候去改廣告素材，是把錢花在錯的地方。先修頁面。", { y: 6.05 });
  s.addNotes("這頁對傳統產業最有感。舉例：某農產客戶只做了「把運費寫在第一屏」這一件事，CVR 從 0.7 升到 1.4。");
}

{
  const s = page({ badge: "指標 ④", title: "CPA：划不划得來", sub: "先算出你的上限，再回頭看廣告貴不貴", accent: C.terra });
  s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 2.5, w: 11.93, h: 1.5, rectRadius: 0.1, fill: { color: C.ink }, line: { color: C.ink } });
  s.addText("CPA 上限 ＝ 客單價 × 毛利率 × 願意投入的獲客比例", {
    x: 0.7, y: 2.5, w: 11.93, h: 1.5, isTextBox: true, margin: 0, align: "center", valign: "middle",
    fontFace: F.h, fontSize: 30, bold: true, color: C.white,
  });
  table(s, ["項目", "A 客戶（食品）", "B 客戶（美語補習）"], [
    ["平均客單價", "NT$980", "NT$36,000"],
    ["毛利率", "45%", "70%"],
    ["毛利金額", "NT$441", "NT$25,200"],
    ["願意投入比例（首購）", "60%", "30%"],
    ["CPA 上限", { text: "NT$265", options: { bold: true, color: C.terra } }, { text: "NT$7,560", options: { bold: true, color: C.terra } }],
  ], { y: 4.2, colW: [4.1, 3.9, 3.93], rowH: 0.44, size: 14 });
  s.addNotes("這頁一定要帶學員一起算一次自己的。沒算過 CPA 上限的人，永遠在用感覺判斷廣告貴不貴。可停留 8 分鐘。");
}

{
  const s = page({ badge: "指標 ⑤", title: "ROAS：賺不賺得到錢", sub: "倍數本身沒有意義，要跟你的損益兩平點比", accent: C.terra });
  s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 2.4, w: 11.93, h: 1.05, rectRadius: 0.1, fill: { color: C.terraBg }, line: { color: C.terraBg } });
  s.addText("損益兩平 ROAS ＝ 1 ÷ 毛利率", {
    x: 0.7, y: 2.4, w: 11.93, h: 1.05, isTextBox: true, margin: 0, align: "center", valign: "middle",
    fontFace: F.h, fontSize: 30, bold: true, color: C.terra,
  });
  stats(s, [
    { value: "2.2", label: "毛利率 45%", note: "ROAS 低於 2.2 就在虧錢" },
    { value: "1.4", label: "毛利率 70%", note: "高毛利容忍度高很多" },
    { value: "3.3", label: "毛利率 30%", note: "低毛利要求嚴格" },
  ], { y: 3.6, h: 2.45, vSize: 46 });
  keyLine(s, "同樣 ROAS 2.5，有人在賺錢，有人在虧錢。先算自己的門檻，再看數字。", { y: 6.2 });
  s.addNotes("這頁跟前一頁是一組，都是「回到自己的生意算數字」。強調：不要拿同業的 ROAS 當標準，毛利結構不一樣。");
}

{
  const s = page({ badge: "★ 主工具", title: "斷點診斷表", sub: "上課後貼在辦公桌上，每次看報表就對一次", accent: C.terra });
  table(s, ["症狀", "斷點在哪一層", "最可能的原因", "第一個該做的動作"], [
    ["CPM 高、CTR 也低", "曝光層", "受眾錯或素材沒吸引力", "換三組新訴求素材測試"],
    ["CPM 正常、CTR 低", "互動層", "素材與受眾不契合", "同受眾換素材，一次一組"],
    ["CTR 高、CVR 低", "到站／轉換層", "落地頁與廣告承諾不一致", "修頁面第一屏，不要動廣告"],
    ["CVR 正常、CPA 太高", "轉換層", "客單價太低或流量成本高", "做組合包提高客單，或換受眾"],
    ["CPA 正常、ROAS 低", "獲利層", "毛利結構或折扣過深", "檢查活動折扣與運費補貼"],
    ["全部正常但賺不到錢", "留存層", "只做首購，沒有回購", "建再行銷與會員回購機制"],
  ], { y: 2.5, colW: [2.6, 2.1, 3.5, 3.73], rowH: 0.56, size: 14 });
  s.addNotes("★ 這張表印成 A4 護貝發下去，是本課最高使用率的產出。逐列講解，每列配一個真實例子。停留 12 分鐘。");
}

{
  const s = page({ badge: "情境 A", title: "CTR 高但 CVR 低", sub: "最常見、也最常被改錯的情況", accent: C.terra });
  stats(s, [
    { value: "3.8%", label: "CTR", note: "素材很吸引人" },
    { value: "0.4%", label: "CVR", note: "進來的人幾乎都走了" },
    { value: "NT$1,240", label: "CPA", note: "遠高於上限 NT$420", hot: true },
  ], { y: 2.45, h: 2.5, vSize: 46 });
  twoCol(s,
    { title: "直覺會做的（錯）", accent: "9A5B4A", fill: "F6EAE4", items: ["換素材再試一次、加預算衝量", "換一批新受眾重跑"] },
    { title: "應該做的", accent: C.sage, items: ["用手機打開落地頁看第一屏", "確認優惠找得到，並檢查速度"] },
    { y: 5.1, h: 1.8, size: 16 });
  s.addNotes("重點：素材已經證明有效（CTR 3.8%），再換素材等於把好的東西丟掉。問題在後面那一段。");
}

{
  const s = page({ badge: "情境 B", title: "CPM 一路往上爬", sub: "兩週內從 180 漲到 310，CTR 同步下滑", accent: C.terra });
  flow(s, [
    { k: "第 1 週", v: "CPM 180\nCTR 2.6%\n頻率 1.8" },
    { k: "第 2 週", v: "CPM 230\nCTR 2.0%\n頻率 3.1" },
    { k: "第 3 週", v: "CPM 310\nCTR 1.2%\n頻率 4.6" },
  ], { y: 2.7, h: 1.8, hot: 2 });
  bullets(s, [
    "三個數字同向惡化，指向同一個原因：素材疲乏加上受眾被打到爛。",
    "這時候加預算會讓惡化加速，系統只能更頻繁地推給同一群人。",
    "正確動作：換素材（不是換文案），同時擴大受眾或排除近 30 天已購買者。",
    "預防做法：每兩週準備一組新素材輪替，不要等數字掉了才開始想。",
  ], { y: 4.8, h: 2.05, size: 17 });
  s.addNotes("強調預防：素材的產出節奏應該排進月行事曆。這也是拍攝剪輯人員存在的價值，可以順勢講內容團隊的配置。");
}

{
  const s = page({ badge: "情境 C", title: "ROAS 忽高忽低", sub: "每天看數字，每天做相反的決定", accent: C.terra });
  twoCol(s,
    { title: "看起來的樣子", accent: "9A5B4A", fill: "F6EAE4", items: [
      "週一 ROAS 4.2，很興奮，加預算",
      "週二 ROAS 0.8，很緊張，砍預算",
      "週三 ROAS 3.1，又加回來",
      "一週下來動了五次，成效更不穩",
    ] },
    { title: "實際的原因", accent: C.sage, items: [
      "單日成果數不足 20 筆，波動本來就大",
      "頻繁改預算會讓廣告重新進入學習期",
      "學習期的成效必然不穩，形成惡性循環",
      "判讀單位要用「週」，不要用「天」",
    ] },
    { y: 2.45, h: 3.2 });
  keyLine(s, "判讀規則：成果數未滿 50 筆，或未滿 3 天，先不做任何調整。", { y: 5.85 });
  bullets(s, ["預算調整幅度單次不超過 20%，讓系統有機會收斂。"], { y: 6.6, h: 0.4, size: 16 });
  s.addNotes("這是管理階層最需要聽的一頁。老闆每天問數字，是逼行銷人員做出錯誤決定的主因之一。可以請他們把這頁拍給老闆看。");
}

{
  const s = page({ badge: "決策規則", title: "什麼時候該關掉廣告", sub: "先訂規則，才不會憑感覺與情緒", accent: C.sage });
  cards(s, [
    { n: "規則 1", title: "三倍 CPA 法則", body: "花費累積到 CPA 上限的三倍，仍然沒有任何一筆成果 → 關掉。\n\n例：上限 400，花到 1,200 沒訂單就停。" },
    { n: "規則 2", title: "連續兩週低於門檻", body: "ROAS 連續兩週低於損益兩平點 → 停止並重新規劃，不要只調預算。" },
    { n: "規則 3", title: "頻率超標且 CTR 腰斬", body: "頻率 > 4 且 CTR 低於基準一半 → 素材下架，換新的上。" },
  ], { cols: 3, h: 3.1, y: 2.5 });
  keyLine(s, "規則寫下來，貼在牆上。決策速度會變快，爭論會變少。", { y: 6.0 });
  s.addNotes("這三條是可以直接複製到公司 SOP 的。請學員現在就寫進手機備忘錄。");
}

{
  const s = page({ badge: "紀律", title: "一次只改一個變因", accent: C.terra });
  table(s, ["同時改的事", "結果數字變好了", "你學到什麼"], [
    ["換素材 + 換受眾 + 加預算", "CPA 從 800 降到 520", "什麼都沒學到，下次還是要重猜"],
    ["只換素材，其他不動", "CPA 從 800 降到 520", "這組素材有效，可以延伸做三支"],
    ["只換受眾，其他不動", "CPA 沒有改善", "受眾不是問題，排除一個可能性"],
  ], { y: 2.5, colW: [4.2, 3.6, 4.13], rowH: 0.75, size: 15 });
  bullets(s, [
    "測試的價值在於「排除錯的可能」，跟找到對的答案一樣重要。",
    "每一次測試都留紀錄：改了什麼、跑幾天、結果如何。三個月後這份紀錄就是公司的資產。",
  ], { y: 5.2, h: 1.1, size: 17 });
  keyLine(s, "沒有紀錄的優化，等於每個月重新開始。", { y: 6.35 });
  s.addNotes("可以展示自己的測試紀錄表（Google Sheet 三欄：日期、變因、結果）。實物展示比說明有效。");
}

{
  const s = page({ badge: "★ 案例演練", title: "三組廣告的體檢", sub: "同一個客戶、同一週、總預算 NT$60,000　｜　CPA 上限 NT$420", accent: C.terra });
  table(s, ["", "A 組", "B 組", "C 組"], [
    ["花費", "NT$24,000", "NT$21,000", "NT$15,000"],
    ["CPM", "NT$195", "NT$188", "NT$342"],
    ["CTR", "2.8%", "1.1%", "2.4%"],
    ["頻率", "2.1", "1.9", "4.8"],
    ["CVR", "0.5%", "2.2%", "1.8%"],
    ["購買數", "17", "25", "19"],
    ["CPA", "NT$1,412", "NT$840", "NT$789"],
    ["ROAS", "0.9", "2.4", "2.6"],
  ], { y: 2.45, colW: [2.9, 3.0, 3.0, 3.03], rowH: 0.47, size: 14 });
  keyLine(s, "問題：三組各自的斷點在哪一層？下週的預算該怎麼分？請寫出三個動作。", { y: 6.3 });
  s.addNotes("★ 分組演練 20 分鐘。解答：A 組斷在到站/轉換層（CTR 好 CVR 差，修頁面）；B 組斷在互動層（CTR 低，換素材）；C 組斷在曝光層（頻率 4.8、CPM 高，擴受眾＋換素材），但 C 效率最好，預算可先保。");
}

{
  const s = darkPage();
  s.addText("練習 3", { x: 1.2, y: 1.4, w: 11, h: 0.55, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 20, bold: true, color: C.terra, charSpacing: 4 });
  s.addText("用診斷表寫出三個動作", { x: 1.15, y: 1.95, w: 8.4, h: 1.0, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 40, bold: true, color: C.white });
  s.addText([
    { text: "25 分鐘，分組討論 + 上台 2 分鐘", options: { bold: true, breakLine: true, color: C.terra, fontSize: 20 } },
    { text: "每組拿到一份不同的帳戶數據（講師發放）", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "第一步：用五大指標由上而下找出斷點在哪一層", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "第二步：對照診斷表，寫出「第一個該做的動作」", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "第三步：說明你預期哪一個數字會改變、改變多少", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "上台時只講三句話：斷點在哪、要做什麼、預期什麼", options: { bullet: { code: "25CF" } } },
  ], { x: 1.2, y: 3.25, w: 8.3, h: 3.2, isTextBox: true, fontFace: F.b, fontSize: 17, color: C.line, lineSpacing: 26, paraSpaceAfter: 8 });
  s.addShape(pres.ShapeType.roundRect, { x: 9.8, y: 2.6, w: 2.6, h: 2.6, rectRadius: 0.14, fill: { color: C.deep }, line: { color: C.terra, width: 2 } });
  s.addText("預期\n是關鍵\n沒有預期\n就沒有驗證", { x: 9.8, y: 2.6, w: 2.6, h: 2.6, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: F.h, fontSize: 20, bold: true, color: C.white, lineSpacing: 30 });
  s.addNotes("「寫出預期」是這個練習的核心訓練。沒有預期就沒辦法驗證判斷對不對，也就無法累積經驗。14:30 休息。");
}

// ═══════════════════════════════════════════════════════
// E. 模組四：成效報告與決策（P51–P62）
// ═══════════════════════════════════════════════════════
{
  const s = darkPage();
  s.addText("模組四", { x: 1.2, y: 2.2, w: 11, h: 0.6, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 22, bold: true, color: C.terra, charSpacing: 4 });
  s.addText("成效報告與決策", { x: 1.15, y: 2.85, w: 11.2, h: 1.2, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 48, bold: true, color: C.white });
  s.addShape(pres.ShapeType.rect, { x: 1.2, y: 4.25, w: 1.4, h: 0.06, fill: { color: C.terra }, line: { color: C.terra } });
  s.addText("14:40–16:00　｜　把判斷寫成老闆三十秒看得懂的一頁", { x: 1.2, y: 4.55, w: 11, h: 0.5, isTextBox: true, margin: 0, fontFace: F.b, fontSize: 19, color: C.line });
  s.addNotes("過場頁 15 秒。");
}

{
  const s = page({ badge: "報告原則", title: "先講結論，再講過程", sub: "老闆的閱讀順序，跟你的分析順序相反", accent: C.terra });
  twoCol(s,
    { title: "分析的順序（你做事的順序）", accent: "9A5B4A", fill: "F6EAE4", items: [
      "撈資料 → 對齊定義 → 找異常",
      "逐層檢查 → 找出斷點",
      "推論原因 → 想對策",
      "得到結論",
    ] },
    { title: "報告的順序（他讀的順序）", accent: C.sage, items: [
      "結論：這波有效／無效，下一步要做什麼",
      "三個關鍵發現：每個都附一個數字",
      "三個行動：誰、做什麼、什麼時候完成",
      "附錄：完整數據放後面，要問才翻",
    ] },
    { y: 2.45, h: 3.4 });
  keyLine(s, "把分析過程當成報告結構，是行銷人員最常見的溝通失誤。", { y: 6.0 });
  s.addNotes("呼應早上的 30 秒場景。老闆要的是決定，不是你的工作過程。過程放附錄，隨時可以調出來。");
}

{
  const s = page({ badge: "模板", title: "一頁報告的骨架", sub: "四個區塊，寫滿就是一份合格的報告", accent: C.terra });
  const blocks = [
    { t: "① 結論（一句話）", d: "本週投放整體達標／未達標，主要受什麼影響，下週主要動作是什麼。", h: 1.0 },
    { t: "② 三個關鍵發現", d: "每個發現一句話 + 一個數字 + 跟誰比。例：B 組 CPA 降到 682，較上週下降 28%。", h: 1.0 },
    { t: "③ 三個行動", d: "動作 + 負責人 + 完成日。例：重拍 A 組落地頁第一屏｜平面企劃｜9/25 前。", h: 1.0 },
    { t: "④ 需要決策的事", d: "需要老闆拍板的項目，附上兩個選項與你的建議。沒有就寫「無」。", h: 1.0 },
  ];
  let y = 2.45;
  blocks.forEach((b, i) => {
    s.addShape(pres.ShapeType.roundRect, { x: 0.7, y, w: 11.93, h: b.h, rectRadius: 0.08, fill: { color: i % 2 ? C.white : C.card }, line: { color: C.line, width: 1 } });
    s.addShape(pres.ShapeType.rect, { x: 0.7, y, w: 0.07, h: b.h, fill: { color: C.terra }, line: { color: C.terra } });
    s.addText(b.t, { x: 1.0, y: y + 0.12, w: 3.4, h: 0.45, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 19, bold: true, color: C.ink });
    s.addText(b.d, { x: 4.5, y: y + 0.12, w: 7.9, h: 0.76, isTextBox: true, margin: 0, fontFace: F.b, fontSize: 15, color: C.body, lineSpacing: 21, valign: "top" });
    y += b.h + 0.1;
  });
  s.addNotes("這個骨架不限於廣告報告，社群、EDM、活動檢討都能用。第 4 區塊是讓老闆有參與感的關鍵，不要省略。");
}

{
  const s = page({ badge: "寫法對照", title: "摘要怎麼寫", accent: C.sage });
  twoCol(s,
    { title: "改寫前", accent: "9A5B4A", fill: "F6EAE4", items: [
      "「本週共曝光 412 萬次，點擊 3.7 萬次，互動良好，整體成效穩定成長，將持續優化。」",
      "問題：沒有結論、沒有比較、沒有動作。老闆看完不知道要做什麼。",
    ] },
    { title: "改寫後", accent: C.sage, items: [
      "「本週達標。ROAS 2.6（上週 1.9，門檻 2.2）。主因是開箱素材上線，CPA 從 968 降到 682。下週把 A 組預算移到 B 組，並重做 A 組落地頁第一屏。」",
      "特點：先講達標與否、數字有比較對象、直接接到下週動作。",
    ] },
    { y: 2.45, h: 3.6, size: 16 });
  keyLine(s, "檢查方法：把摘要唸給不懂廣告的人聽，他能複述下一步，就算合格。", { y: 6.2 });
  s.addNotes("現場讓兩位學員唸出左邊那段，全場會笑，因為太熟悉了。然後對照右邊，差別立刻感受得到。");
}

{
  const s = page({ badge: "視覺化", title: "什麼數據配什麼圖", accent: C.sage });
  table(s, ["你想表達", "用哪種圖", "不要用"], [
    ["趨勢隨時間變化", "折線圖", "圓餅圖（看不出時間）"],
    ["幾個項目互相比較", "橫向長條圖", "3D 長條圖（視覺會騙人）"],
    ["組成比例", "堆疊長條圖", "超過五塊的圓餅圖"],
    ["兩個指標的關係", "散布圖", "雙軸折線（容易誤導）"],
    ["單一關鍵數字", "大字 + 對比數字", "表格（重點會被稀釋）"],
  ], { y: 2.5, colW: [3.6, 4.3, 4.03], rowH: 0.6, size: 15 });
  keyLine(s, "圖表三不：不用 3D、Y 軸不從非零起跳、強調色不超過兩種。", { y: 6.05 });
  s.addNotes("補一句實務：報告裡圖表不要超過四張。圖太多，重點就沒了。");
}

{
  const s = page({ badge: "示範", title: "同一組數據的兩種講法", sub: "左邊是資料，右邊是判斷", accent: C.terra });
  s.addChart(pres.ChartType.line, [
    { name: "ROAS", labels: ["W31", "W32", "W33", "W34", "W35", "W36"], values: [1.6, 1.8, 1.7, 2.1, 2.4, 2.6] },
    { name: "損益兩平（2.2）", labels: ["W31", "W32", "W33", "W34", "W35", "W36"], values: [2.2, 2.2, 2.2, 2.2, 2.2, 2.2] },
  ], {
    x: 0.7, y: 2.45, w: 6.4, h: 3.7,
    chartColors: [C.terra, C.muted], lineDataSymbol: "circle", lineSize: 3,
    showTitle: true, title: "近六週 ROAS 走勢", titleFontFace: F.h, titleFontSize: 15, titleColor: C.ink,
    showLegend: true, legendPos: "b", legendFontSize: 11, legendColor: C.body,
    catAxisLabelColor: C.muted, valAxisLabelColor: C.muted,
    catAxisLabelFontSize: 11, valAxisLabelFontSize: 11,
    valGridLine: { color: C.line, size: 1 }, catGridLine: { style: "none" },
    valAxisMinVal: 0, valAxisMaxVal: 3,
  });
  s.addShape(pres.ShapeType.roundRect, { x: 7.35, y: 2.45, w: 5.28, h: 3.7, rectRadius: 0.1, fill: { color: C.white }, line: { color: C.line, width: 1 } });
  s.addText("這張圖要講的話", { x: 7.65, y: 2.65, w: 4.7, h: 0.4, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 18, bold: true, color: C.terra });
  s.addText([
    { text: "W34 跨過損益兩平線後穩住，連續三週向上。", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "轉折點在 W34 開箱素材上線，不是預算增加。", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "下週維持素材方向，預算增幅控制在 20% 以內。", options: { bullet: { code: "25CF" } } },
  ], { x: 7.65, y: 3.2, w: 4.7, h: 2.7, isTextBox: true, fontFace: F.b, fontSize: 15, color: C.body, lineSpacing: 22, paraSpaceAfter: 10 });
  keyLine(s, "圖表負責呈現，文字負責判斷。只放圖不寫判斷，等於把工作丟回給讀的人。", { y: 6.3 });
  s.addNotes("示範重點：那條灰色的損益兩平基準線，是整張圖最有價值的元素。加一條基準線，圖就從資料變成判斷。");
}

{
  const s = page({ badge: "★ 模板", title: "週報模板", sub: "複製這個結構，每週花 20 分鐘填完", accent: C.terra });
  table(s, ["區塊", "內容", "字數上限"], [
    ["主旨", "【週報】9/15–9/21 廣告成效｜達標，ROAS 2.6", "25 字"],
    ["一句話結論", "本週達標，主因開箱素材帶動 CPA 下降 28%", "40 字"],
    ["三個發現", "每則一句話 + 一個數字 + 比較基準", "各 30 字"],
    ["三個行動", "動作 ｜ 負責人 ｜ 完成日", "各 25 字"],
    ["需要決策", "兩個選項 + 建議，或直接寫「無」", "50 字"],
    ["附錄", "完整數據表、素材成效、受眾表現", "不限"],
  ], { y: 2.5, colW: [2.3, 7.4, 2.23], rowH: 0.58, size: 15 });
  keyLine(s, "字數上限是重點。寫不下，代表你自己還沒想清楚。", { y: 6.05 });
  s.addNotes("★ 高使用率產出。建議現場直接開一份 Google Doc 建成範本，下課前分享連結給全班。");
}

{
  const s = page({ badge: "節奏", title: "週報、月報、季報的分工", accent: C.sage });
  cards(s, [
    { n: "週", title: "週報：戰術", body: "回答「下週要改什麼」。\n\n看素材、受眾、預算分配。\n\n對象：行銷團隊與主管。" },
    { n: "月", title: "月報：戰略", body: "回答「這個月的方向對不對」。\n\n看客單價、回購、管道結構。\n\n對象：老闆與跨部門。" },
    { n: "季", title: "季報：資源", body: "回答「錢與人要怎麼配」。\n\n看 LTV、獲客成本趨勢、通路佈局。\n\n對象：決策層。" },
  ], { cols: 3, h: 3.2, y: 2.5, accent: C.sage });
  keyLine(s, "用週報的顆粒度講季報，會讓決策層失焦；用季報的高度講週報，團隊不知道要做什麼。", { y: 6.05 });
  s.addNotes("很多公司只有月報，週報沒做，導致問題拖一個月才發現。可以建議從「每週五 30 分鐘」開始。");
}

{
  const s = page({ badge: "溝通", title: "對老闆講數據的三句話", sub: "電梯裡、走廊上、會議前三十秒都能用", accent: C.terra });
  cards(s, [
    { n: "第一句", title: "達標了嗎", body: "「這波達標／沒達標。」\n\n直接給判斷，不要先鋪陳。" },
    { n: "第二句", title: "為什麼", body: "「主因是＿＿，數字從＿＿變成＿＿。」\n\n一個原因，一組對比數字。" },
    { n: "第三句", title: "接下來", body: "「下一步我要做＿＿，＿＿之前會有結果。」\n\n動作 + 時間。" },
  ], { cols: 3, h: 3.0, y: 2.5 });
  keyLine(s, "老闆問「怎麼樣了」，他要的是這三句話，不是一份 PDF。", { y: 5.85 });
  bullets(s, ["練習方式：每次寫完報告，先用這三句話講一遍給自己聽，講不順就代表結論還不夠清楚。"], { y: 6.6, h: 0.4, size: 16 });
  s.addNotes("可以請兩位學員現場用自家數字練一次。這是全天最實用的溝通訓練，值得花 10 分鐘。");
}

{
  const s = page({ badge: "提醒", title: "只報好消息的代價", accent: C.terra });
  myth(s,
    ["這週數字難看，先不要報，下週補回來", "把表現差的廣告組合從報表裡拿掉", "改用比較好看的指標來報告（例如互動率）", "問題等到季度檢討再一起說"],
    ["壞消息愈早報，可動用的資源愈多", "壞的數據是找到斷點的線索，拿掉就找不到了", "換指標只是延後問題，也會消耗你的信任額度", "小問題自己處理，會影響目標的問題當週就報"],
    { y: 2.45, h: 3.5 });
  keyLine(s, "報告的信任，是靠「壞消息也照報」建立起來的。", { y: 6.1 });
  s.addNotes("這頁講給有代理商經驗的人特別有共鳴。可以講自己主動報壞消息，結果客戶反而追加預算的例子。");
}

{
  const s = page({ badge: "案例", title: "一份被退回的報告", sub: "同一週數據，兩種寫法，兩種結果", accent: C.terra });
  table(s, ["", "第一版（被退回）", "第二版（當場核准預算）"], [
    ["開頭", "本週投放數據整理如下……", "本週達標，ROAS 2.6，超過門檻 2.2"],
    ["結構", "八張圖表依平台排列", "結論 → 三發現 → 三行動 → 一個決策"],
    ["數字", "只有絕對值", "每個數字都附上週與門檻"],
    ["結尾", "將持續優化，密切關注", "需要決定：A 組頁面重做，外包或內部做"],
    ["老闆反應", "「所以呢？」", "「就照你說的做。」"],
  ], { y: 2.5, colW: [1.9, 5.0, 5.03], rowH: 0.64, size: 14 });
  keyLine(s, "同樣的分析品質，不同的表達結構，決定它會不會變成行動。", { y: 6.2 });
  s.addNotes("結尾那列可以停一下，全場通常都笑。這是整個模組四的收尾錨點。");
}

{
  const s = darkPage();
  s.addText("練習 4", { x: 1.2, y: 1.4, w: 11, h: 0.55, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 20, bold: true, color: C.terra, charSpacing: 4 });
  s.addText("現場寫一份週報摘要", { x: 1.15, y: 1.95, w: 8.4, h: 1.0, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 40, bold: true, color: C.white });
  s.addText([
    { text: "25 分鐘，個人完成 + 兩人互評", options: { bold: true, breakLine: true, color: C.terra, fontSize: 20 } },
    { text: "用自己公司上週的真實數字（沒有就用練習 3 的資料）", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "寫出：一句話結論、三個發現、三個行動、一個決策", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "每個發現都要有數字，而且要有比較對象", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "互評標準：不懂廣告的人看完，說不說得出下一步", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "最後用三句話公式，講給旁邊的人聽", options: { bullet: { code: "25CF" } } },
  ], { x: 1.2, y: 3.25, w: 8.3, h: 3.2, isTextBox: true, fontFace: F.b, fontSize: 17, color: C.line, lineSpacing: 26, paraSpaceAfter: 8 });
  s.addShape(pres.ShapeType.roundRect, { x: 9.8, y: 2.6, w: 2.6, h: 2.6, rectRadius: 0.14, fill: { color: C.terra }, line: { color: C.terra } });
  s.addText("寫不下\n代表\n還沒\n想清楚", { x: 9.8, y: 2.6, w: 2.6, h: 2.6, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: F.h, fontSize: 22, bold: true, color: C.white, lineSpacing: 32 });
  s.addNotes("巡場時挑三份寫得好的，下課前唸出來（不具名）。16:00 休息，16:10 進最後一段。");
}

// ═══════════════════════════════════════════════════════
// F. 收尾（P63–P68）喚起行動
// ═══════════════════════════════════════════════════════
{
  const s = page({ badge: "回顧", title: "回到早上那個問題", sub: "老闆問：這波廣告到底有沒有效？", accent: C.terra });
  cards(s, [
    { n: "1", title: "先定位", body: "這個問題問的是哪一層？\n\n多數時候問的是轉換層與獲利層：CPA 與 ROAS。" },
    { n: "2", title: "再比較", body: "跟上週比、跟門檻比。\n\n「ROAS 2.6，門檻 2.2，達標」比「成效不錯」有用一百倍。" },
    { n: "3", title: "最後給動作", body: "「下週把預算移到 B 組，同時重做 A 組頁面。」\n\n給判斷，不要只給數字。" },
  ], { cols: 3, h: 3.2, y: 2.5 });
  keyLine(s, "三十秒的回答：達標與否 → 為什麼 → 下一步。今天練的全部收在這三句。", { y: 6.05 });
  s.addNotes("刻意跟第 5 頁呼應。可以把白板上早上寫的答案翻出來對照，學員會很有成就感。");
}

{
  const s = darkPage();
  s.addText("帶走一句話", { x: 1.2, y: 1.85, w: 11, h: 0.55, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 20, bold: true, color: C.terra, charSpacing: 4 });
  s.addText("看到一個數字，\n先問它在漏斗哪一層，\n再問你要改哪一個變因。", {
    x: 1.15, y: 2.5, w: 11.2, h: 2.8, isTextBox: true, margin: 0,
    fontFace: F.h, fontSize: 40, bold: true, color: C.white, lineSpacing: 62,
  });
  s.addShape(pres.ShapeType.rect, { x: 1.2, y: 5.5, w: 1.4, h: 0.06, fill: { color: C.terra }, line: { color: C.terra } });
  s.addText("兩個問題都答得出來，你就有判斷；只答得出第一個，那還只是報表。", {
    x: 1.2, y: 5.8, w: 10.8, h: 0.5, isTextBox: true, margin: 0, fontFace: F.b, fontSize: 18, color: C.line,
  });
  s.addNotes("★ 全天的核心句。講完停三秒不要說話，讓它沉下去。");
}

{
  const s = page({ badge: "行動清單", title: "回去後的七天", sub: "照順序做，一天一件，週五就有第一份新格式的報告", accent: C.sage });
  table(s, ["Day", "做什麼", "花多久", "產出"], [
    ["Day 1", "檢查 GA4 purchase 事件有沒有帶金額", "20 分鐘", "確認或報修單"],
    ["Day 2", "算出自己的 CPA 上限與損益兩平 ROAS", "30 分鐘", "兩個數字，寫在白板"],
    ["Day 3", "拉過去 90 天資料，建立基準表", "40 分鐘", "一張基準表"],
    ["Day 4", "把 Meta 欄位改成九個，存成範本", "15 分鐘", "自訂欄位範本"],
    ["Day 5", "用診斷表檢查目前所有廣告組合", "40 分鐘", "三個具體動作"],
    ["Day 6", "統一 UTM 命名規則，寫成一頁 SOP", "30 分鐘", "一頁 SOP"],
    ["Day 7", "用模板寫出第一份新格式週報", "20 分鐘", "一份週報"],
  ], { y: 2.5, colW: [1.5, 5.6, 1.9, 2.93], rowH: 0.5, size: 14 });
  keyLine(s, "七天總共不到四小時。做完這七件事，你的數據品質會跟今天早上完全不同。", { y: 6.25 });
  s.addNotes("請學員現在就把 Day 1 和 Day 2 排進手機行事曆。當場排的完成率，比回去再說高很多。");
}

{
  const s = page({ badge: "快問快答", title: "現場最常被問的四題", accent: C.terra });
  cards(s, [
    { n: "Q1", title: "預算很小也要這樣做嗎", body: "預算愈小愈要。小預算的容錯空間更低，亂改的代價更高。" },
    { n: "Q2", title: "多久看一次數據", body: "每天看趨勢不做決定，每週做調整，每月看結構。" },
    { n: "Q3", title: "沒有工程師怎麼設事件", body: "先用 Meta 與 GA4 的介面設定，能涵蓋八成需求。剩下的再外包。" },
    { n: "Q4", title: "代理商的報告要怎麼看", body: "只問三件事：斷點在哪、下週動作、預期什麼改變。答不出來就要留意。" },
  ], { cols: 2, h: 1.85, y: 2.5, bSize: 15 });
  keyLine(s, "還有問題，留到最後一段，或會後直接找我。", { y: 6.35 });
  s.addNotes("這四題幾乎每場都會被問，先講完可以省下 Q&A 的時間，把時間留給個別帳戶的問題。");
}

{
  const s = page({ badge: "工具箱", title: "回去可以直接用的東西", accent: C.sage });
  cards(s, [
    { title: "斷點診斷表", body: "第 41 頁。印成 A4 貼在桌上，每次看報表對一次。" },
    { title: "指標地圖表", body: "第 11 頁。新人訓練可以直接拿來當教材。" },
    { title: "週報模板", body: "第 55 頁。複製成 Google Doc 範本，全公司統一。" },
    { title: "UTM 命名規則", body: "第 29 頁。寫成一頁 SOP，發給所有會發連結的人。" },
    { title: "CPA 上限公式", body: "第 39 頁。每次改價格或改組合，就重算一次。" },
    { title: "七天行動清單", body: "第 63 頁。照順序做，不要跳。" },
  ], { cols: 3, h: 1.7, y: 2.5, accent: C.sage, tSize: 19, bSize: 14 });
  keyLine(s, "簡報檔會在課後寄給主辦單位，含講師備註。", { y: 6.35 });
  s.addNotes("提醒主辦單位確認寄送名單。也可以留 LINE 官方帳號，讓學員回去操作卡住時有地方問。");
}

{
  const s = darkPage();
  s.addShape(pres.ShapeType.rect, { x: 8.6, y: 0, w: 4.733, h: 7.5, fill: { color: C.deep }, line: { color: C.deep } });
  s.addText("謝謝各位", { x: 1.15, y: 2.3, w: 7.2, h: 1.1, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 48, bold: true, color: C.white });
  s.addShape(pres.ShapeType.rect, { x: 1.2, y: 3.6, w: 1.4, h: 0.06, fill: { color: C.terra }, line: { color: C.terra } });
  s.addText("今天沒有講完的，回去操作卡住的，\n都可以找我。帶著你的數字來問，會更快。", {
    x: 1.2, y: 3.95, w: 7.0, h: 1.2, isTextBox: true, margin: 0, fontFace: F.b, fontSize: 19, color: C.line, lineSpacing: 30,
  });
  s.addText("黃皇賓", { x: 1.2, y: 5.4, w: 7.0, h: 0.5, isTextBox: true, margin: 0, fontFace: F.h, fontSize: 24, bold: true, color: C.white });
  s.addText("知育行銷有限公司　執行長\n企業輔導培訓｜數位行銷講師", {
    x: 1.2, y: 5.9, w: 7.0, h: 0.8, isTextBox: true, margin: 0, fontFace: F.b, fontSize: 16, color: C.muted, lineSpacing: 24,
  });
  s.addShape(pres.ShapeType.roundRect, { x: 9.3, y: 2.1, w: 3.3, h: 3.3, rectRadius: 0.16, fill: { color: C.terra }, line: { color: C.terra } });
  s.addText("先問層級\n再改變因", { x: 9.3, y: 2.1, w: 3.3, h: 3.3, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: F.h, fontSize: 30, bold: true, color: C.white, lineSpacing: 44 });
  s.addNotes("結尾不要拖。講完最後一句就開放 Q&A，並提醒填寫課後回饋表。");
}

pres.writeFile({ fileName: "/home/user/B/projects/course-marketing-data/行銷數據解讀與成效分析基礎_20260918_黃皇賓.pptx" })
  .then(f => console.log("✅ 產出：" + f + "　共 " + PAGE + " 頁"));
