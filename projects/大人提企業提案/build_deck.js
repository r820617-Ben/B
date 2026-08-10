// 知育行銷｜大人提（企業人力資源提升計畫）企業提案簡報
// 主題：服務範疇與計劃執行　｜　階段：初次接觸／比稿
// 建置：node build_deck.js

const pptxgen = require("pptxgenjs");

// ── 色票（大地色系，精品感）
const ESPRESSO = "2E2A26"; // 深咖啡（主色，深底與標題）
const TERRA = "B85042"; // 赤陶（重點色）
const SAGE = "A7BEAE"; // 鼠尾草綠（輔色）
const SAND = "EFEAE3"; // 暖砂（卡片底）
const WHITE = "FFFFFF";
const MUTED = "7A736C"; // 說明文字
const LINE = "DED7CE";

const HEAD = "Cambria";
const BODY = "Calibri";

const W = 13.3;
const M = 0.7; // 左右邊界

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "知育行銷有限公司";
pres.company = "知育行銷有限公司";
pres.title = "大人提計畫｜服務範疇與計劃執行提案";

let pageNo = 0;

// ── 版型工具 ───────────────────────────────────────────────

function darkSlide() {
  const s = pres.addSlide();
  s.background = { color: ESPRESSO };
  return s;
}

function pageTag(s) {
  pageNo += 1;
  s.addText(String(pageNo).padStart(2, "0"), {
    x: W - 1.1,
    y: 6.85,
    w: 0.6,
    h: 0.3,
    align: "right",
    fontFace: BODY,
    fontSize: 10,
    color: MUTED,
    margin: 0,
  });
}

// 內容頁：小標籤 + 大標題 +（可選）副說明
function contentSlide(kicker, title, sub) {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  s.addText(kicker, {
    x: M,
    y: 0.42,
    w: 8,
    h: 0.28,
    fontFace: BODY,
    fontSize: 11,
    bold: true,
    color: TERRA,
    charSpacing: 2,
    margin: 0,
  });
  s.addText(title, {
    x: M,
    y: 0.75,
    w: W - M * 2,
    h: 0.62,
    fontFace: HEAD,
    fontSize: 32,
    bold: true,
    color: ESPRESSO,
    margin: 0,
  });
  if (sub) {
    s.addText(sub, {
      x: M,
      y: 1.42,
      w: W - M * 2,
      h: 0.34,
      fontFace: BODY,
      fontSize: 14,
      color: MUTED,
      margin: 0,
    });
  }
  pageTag(s);
  return s;
}

// 卡片
function card(s, x, y, w, h, fill) {
  s.addShape(pres.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: fill || SAND },
    line: { color: fill === WHITE ? LINE : fill || SAND, width: 1 },
    shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 90, opacity: 0.06 },
  });
}

// 編號圓（視覺母題）
function numCircle(s, x, y, n, size, fill, txtColor) {
  const d = size || 0.44;
  s.addShape(pres.ShapeType.ellipse, {
    x,
    y,
    w: d,
    h: d,
    fill: { color: fill || TERRA },
    line: { color: fill || TERRA, width: 1 },
  });
  s.addText(String(n), {
    x,
    y,
    w: d,
    h: d,
    align: "center",
    valign: "middle",
    fontFace: BODY,
    fontSize: d > 0.5 ? 16 : 13,
    bold: true,
    color: txtColor || WHITE,
    margin: 0,
  });
}

function bullets(s, items, opts) {
  const o = opts || {};
  s.addText(
    items.map((t, i) => ({
      text: t,
      options: { bullet: true, breakLine: i !== items.length - 1 },
    })),
    {
      x: o.x,
      y: o.y,
      w: o.w,
      h: o.h,
      fontFace: BODY,
      fontSize: o.fontSize || 13,
      color: o.color || ESPRESSO,
      lineSpacingMultiple: 1.1,
      paraSpaceAfter: 6,
      margin: 0,
    }
  );
}

// ── 01 封面 ────────────────────────────────────────────────
{
  const s = darkSlide();
  s.addText("115 年度　企業人力資源提升計畫（大人提）", {
    x: M,
    y: 1.75,
    w: 10,
    h: 0.35,
    fontFace: BODY,
    fontSize: 14,
    bold: true,
    color: SAGE,
    charSpacing: 2,
    margin: 0,
  });
  s.addText("服務範疇\n與計劃執行", {
    x: M,
    y: 2.25,
    w: 8.6,
    h: 2.1,
    fontFace: HEAD,
    fontSize: 52,
    bold: true,
    color: WHITE,
    lineSpacingMultiple: 1.05,
    margin: 0,
  });
  s.addText("從資格確認、計畫書撰擬、課程執行到核銷結案，單一窗口承接全流程。", {
    x: M,
    y: 4.55,
    w: 9.2,
    h: 0.4,
    fontFace: BODY,
    fontSize: 15,
    color: "C9C1B8",
    margin: 0,
  });
  s.addShape(pres.ShapeType.line, {
    x: M,
    y: 5.35,
    w: 2.2,
    h: 0,
    line: { color: TERRA, width: 2 },
  });
  s.addText("知育行銷有限公司　ZHIYU MARKETING", {
    x: M,
    y: 5.6,
    w: 7,
    h: 0.32,
    fontFace: BODY,
    fontSize: 13,
    bold: true,
    color: WHITE,
    margin: 0,
  });
  s.addText("提案日期：2026 年 8 月　｜　提案人：黃皇賓　執行長", {
    x: M,
    y: 5.95,
    w: 7,
    h: 0.32,
    fontFace: BODY,
    fontSize: 12,
    color: MUTED,
    margin: 0,
  });
  s.addNotes(
    "開場一句：這份提案回答兩件事——我們做什麼（服務範疇），以及怎麼把它做完（計劃執行）。全程單一窗口，貴公司只需要出人上課。"
  );
}

// ── 02 一頁摘要 ────────────────────────────────────────────
{
  const s = contentSlide(
    "EXECUTIVE SUMMARY",
    "先看三個數字",
    "這三個數字決定這個案子值不值得現在啟動。"
  );
  const stats = [
    { n: "95 萬", l: "個別型年度補助上限", d: "聯合型 190 萬、產業推升型 200 萬" },
    { n: "70 %", l: "外訓最高補助比率", d: "派訓 29 歲以下或 45 歲以上員工適用" },
    { n: "9/30", l: "115 年度申請截止", d: "距今約 7 週，計畫書需 2–3 週備妥" },
  ];
  const cw = 3.79;
  stats.forEach((it, i) => {
    const x = M + i * (cw + 0.28);
    card(s, x, 2.1, cw, 2.45, i === 2 ? ESPRESSO : SAND);
    const dark = i === 2;
    s.addText(it.n, {
      x: x + 0.35,
      y: 2.35,
      w: cw - 0.7,
      h: 1.0,
      fontFace: HEAD,
      fontSize: 46,
      bold: true,
      color: dark ? WHITE : TERRA,
      margin: 0,
    });
    s.addText(it.l, {
      x: x + 0.35,
      y: 3.4,
      w: cw - 0.7,
      h: 0.35,
      fontFace: BODY,
      fontSize: 15,
      bold: true,
      color: dark ? WHITE : ESPRESSO,
      margin: 0,
    });
    s.addText(it.d, {
      x: x + 0.35,
      y: 3.78,
      w: cw - 0.7,
      h: 0.6,
      fontFace: BODY,
      fontSize: 12,
      color: dark ? "C9C1B8" : MUTED,
      margin: 0,
    });
  });
  s.addText(
    "貴公司投入的是「員工的上課時間」；訓練費用由計畫補助支應 50%–70%，其餘由我方協助控制在可預期的範圍內。",
    {
      x: M,
      y: 4.95,
      w: W - M * 2,
      h: 0.5,
      fontFace: BODY,
      fontSize: 14,
      color: ESPRESSO,
      margin: 0,
    }
  );
  s.addNotes("這頁停 30 秒。9/30 是硬期限，計畫書撰擬需要 2–3 週，往回推就是這兩週要決定。");
}

// ── 03 分隔頁 01 ───────────────────────────────────────────
function divider(no, kicker, title, desc) {
  const s = darkSlide();
  numCircle(s, M, 2.35, no, 0.72, TERRA, WHITE);
  s.addText(kicker, {
    x: M,
    y: 3.25,
    w: 9,
    h: 0.3,
    fontFace: BODY,
    fontSize: 12,
    bold: true,
    color: SAGE,
    charSpacing: 2,
    margin: 0,
  });
  s.addText(title, {
    x: M,
    y: 3.6,
    w: 10,
    h: 0.85,
    fontFace: HEAD,
    fontSize: 40,
    bold: true,
    color: WHITE,
    margin: 0,
  });
  s.addText(desc, {
    x: M,
    y: 4.5,
    w: 9.5,
    h: 0.4,
    fontFace: BODY,
    fontSize: 14,
    color: "C9C1B8",
    margin: 0,
  });
  pageTag(s);
  return s;
}
divider(1, "PART 01", "為什麼是現在", "大人提的規則、資格門檻，以及 115 年度剩下的時間。").addNotes(
  "第一段只講計畫本身，先讓對方確認自己有沒有資格、能拿多少。"
);

// ── 04 三種訓練類型 ────────────────────────────────────────
{
  const s = contentSlide(
    "計畫架構",
    "三種訓練類型，補助上限不同",
    "先確認貴公司要走哪一型，計畫書的寫法與夥伴企業的安排完全不同。"
  );
  const types = [
    {
      t: "個別型",
      n: "95 萬",
      d: "由一家事業單位申請辦理訓練。",
      w: "適合：自有訓練需求明確、單廠執行。",
    },
    {
      t: "聯合型",
      n: "190 萬",
      d: "由一家事業單位申請，結合一家以上具產業或區域發展關聯性的事業單位共同參加。",
      w: "適合：集團關係企業、供應鏈上下游、同區域同業。",
    },
    {
      t: "產業推升型",
      n: "200 萬",
      d: "以經濟部「推動中堅企業躍升計畫」遴選單位，或勞動部「國家人才發展獎」獲獎單位為對象。",
      w: "適合：已具獲獎或遴選資格者。",
    },
  ];
  const cw = 3.79;
  types.forEach((it, i) => {
    const x = M + i * (cw + 0.28);
    card(s, x, 2.0, cw, 3.35, WHITE);
    numCircle(s, x + 0.35, 2.28, i + 1, 0.4, i === 1 ? TERRA : SAGE, WHITE);
    s.addText(it.t, {
      x: x + 0.85,
      y: 2.28,
      w: cw - 1.2,
      h: 0.4,
      valign: "middle",
      fontFace: HEAD,
      fontSize: 20,
      bold: true,
      color: ESPRESSO,
      margin: 0,
    });
    s.addText(`最高補助 ${it.n}`, {
      x: x + 0.35,
      y: 2.85,
      w: cw - 0.7,
      h: 0.45,
      fontFace: HEAD,
      fontSize: 24,
      bold: true,
      color: TERRA,
      margin: 0,
    });
    s.addText(it.d, {
      x: x + 0.35,
      y: 3.4,
      w: cw - 0.7,
      h: 1.05,
      fontFace: BODY,
      fontSize: 12.5,
      color: ESPRESSO,
      lineSpacingMultiple: 1.15,
      margin: 0,
    });
    s.addText(it.w, {
      x: x + 0.35,
      y: 4.5,
      w: cw - 0.7,
      h: 0.7,
      fontFace: BODY,
      fontSize: 12,
      italic: true,
      color: MUTED,
      lineSpacingMultiple: 1.1,
      margin: 0,
    });
  });
  s.addText("補助金額為訓練費用之補助上限，不含稅額；實際核定金額依分署審查結果。", {
    x: M,
    y: 5.6,
    w: W - M * 2,
    h: 0.35,
    fontFace: BODY,
    fontSize: 11.5,
    color: MUTED,
    margin: 0,
  });
  s.addNotes("多數客戶適合個別型。若客戶有關係企業或同區域夥伴，直接提聯合型——補助翻倍，計畫書由我們寫。");
}

// ── 05 資格與補助比率 ──────────────────────────────────────
{
  const s = contentSlide(
    "申請資格",
    "先確認門檻，再談課綱",
    "投保人數是第一道門檻；未滿 51 人也有四條替代路徑。"
  );
  card(s, M, 2.0, 6.1, 3.55, SAND);
  s.addText("主要資格", {
    x: M + 0.4,
    y: 2.25,
    w: 5.3,
    h: 0.35,
    fontFace: HEAD,
    fontSize: 18,
    bold: true,
    color: ESPRESSO,
    margin: 0,
  });
  bullets(
    s,
    [
      "民營事業機構、非營利法人或團體",
      "受僱勞工參加就業保險人數 51 人（含）以上",
    ],
    { x: M + 0.4, y: 2.68, w: 5.3, h: 0.8, fontSize: 13.5 }
  );
  s.addText("未滿 51 人：符合其一即可申請", {
    x: M + 0.4,
    y: 3.55,
    w: 5.3,
    h: 0.32,
    fontFace: BODY,
    fontSize: 13,
    bold: true,
    color: TERRA,
    margin: 0,
  });
  bullets(
    s,
    [
      "TTQS 企業機構版評核結果為通過以上，或辦訓能力檢核表合格",
      "曾獲國家人力創新獎、國家訓練品質獎、國家人才發展獎",
      "申請小型企業人力提升計畫，經分署認定已具辦訓能力",
      "接受小人提輔導服務及訓練課程達三年以上且未續申請",
    ],
    { x: M + 0.4, y: 3.92, w: 5.3, h: 1.5, fontSize: 12 }
  );

  card(s, M + 6.4, 2.0, 5.5, 3.55, WHITE);
  s.addText("補助比率", {
    x: M + 6.8,
    y: 2.25,
    w: 4.7,
    h: 0.35,
    fontFace: HEAD,
    fontSize: 18,
    bold: true,
    color: ESPRESSO,
    margin: 0,
  });
  s.addChart(
    pres.ChartType.bar,
    [
      {
        name: "補助比率",
        labels: ["一般內／外訓", "青年及中高齡外訓"],
        values: [50, 70],
      },
    ],
    {
      x: M + 6.6,
      y: 2.6,
      w: 5.1,
      h: 2.0,
      barDir: "col",
      barGapWidthPct: 120,
      chartColors: [SAGE, TERRA],
      varyColors: true,
      showLegend: false,
      showTitle: false,
      showValue: true,
      dataLabelPosition: "outEnd",
      dataLabelFormatCode: '0"%"',
      dataLabelColor: ESPRESSO,
      dataLabelFontFace: BODY,
      dataLabelFontSize: 14,
      dataLabelFontBold: true,
      valAxisMaxVal: 100,
      valAxisHidden: true,
      catAxisLabelColor: ESPRESSO,
      catAxisLabelFontFace: BODY,
      catAxisLabelFontSize: 12,
      catGridLine: { style: "none" },
      valGridLine: { style: "none" },
    }
  );
  s.addText("派訓對象為 29 歲以下青年或 45 歲以上中高齡勞工，該外部訓練課程補助比率提高至 70%。", {
    x: M + 6.8,
    y: 4.72,
    w: 4.7,
    h: 0.7,
    fontFace: BODY,
    fontSize: 12,
    color: MUTED,
    lineSpacingMultiple: 1.15,
    margin: 0,
  });
  s.addText("行動：請提供最近一期投保人數與員工年齡分布，我方 3 個工作天內回覆可行性與補助試算。", {
    x: M,
    y: 5.75,
    w: W - M * 2,
    h: 0.4,
    fontFace: BODY,
    fontSize: 13,
    bold: true,
    color: ESPRESSO,
    margin: 0,
  });
  s.addNotes("年齡分布是關鍵。29 歲以下與 45 歲以上的比例，直接決定補助從 50% 拉到 70%。開會當場就可以問。");
}

// ── 06 115 年度時程 ────────────────────────────────────────
{
  const s = contentSlide(
    "時程",
    "115 年度只剩約 7 週",
    "受理申請至 115 年 9 月 30 日止。往回推算，能決策的時間比想像中短。"
  );
  const steps = [
    { t: "現在", d: "資格確認\n與需求訪談", w: "第 1 週" },
    { t: "送件前", d: "訓練計畫書\n與課綱撰擬", w: "第 2–3 週" },
    { t: "9/30 前", d: "線上系統送件\n文件用印", w: "截止日" },
    { t: "核定後", d: "開訓報備\n課程執行", w: "依審查結果" },
    { t: "結訓後", d: "經費核銷\n結案報告", w: "訓練期滿" },
  ];
  const cw = 2.2586;
  const gap = 0.16;
  steps.forEach((it, i) => {
    const x = M + i * (cw + gap);
    const isNow = i === 2;
    card(s, x, 2.35, cw, 2.5, isNow ? ESPRESSO : WHITE);
    numCircle(s, x + cw / 2 - 0.2, 2.62, i + 1, 0.4, isNow ? TERRA : SAGE, WHITE);
    s.addText(it.t, {
      x: x + 0.15,
      y: 3.15,
      w: cw - 0.3,
      h: 0.32,
      align: "center",
      fontFace: HEAD,
      fontSize: 16,
      bold: true,
      color: isNow ? WHITE : ESPRESSO,
      margin: 0,
    });
    s.addText(it.d, {
      x: x + 0.15,
      y: 3.52,
      w: cw - 0.3,
      h: 0.75,
      align: "center",
      fontFace: BODY,
      fontSize: 12.5,
      color: isNow ? "C9C1B8" : ESPRESSO,
      lineSpacingMultiple: 1.15,
      margin: 0,
    });
    s.addText(it.w, {
      x: x + 0.15,
      y: 4.4,
      w: cw - 0.3,
      h: 0.3,
      align: "center",
      fontFace: BODY,
      fontSize: 11.5,
      bold: true,
      color: isNow ? SAGE : TERRA,
      margin: 0,
    });
    if (i < steps.length - 1) {
      s.addShape(pres.ShapeType.line, {
        x: x + cw + 0.02,
        y: 3.6,
        w: gap - 0.04,
        h: 0,
        line: { color: LINE, width: 2 },
      });
    }
  });
  s.addText("計畫書從訪談到定稿約需 2–3 週。要趕上 9/30，本週內完成需求訪談是安全線。", {
    x: M,
    y: 5.25,
    w: W - M * 2,
    h: 0.4,
    fontFace: BODY,
    fontSize: 14,
    bold: true,
    color: ESPRESSO,
    margin: 0,
  });
  s.addNotes("這頁製造時間壓力，但用事實講，不要催。重點放在「計畫書要 2–3 週」。");
}

// ── 07 企業自己做的三個卡點 ────────────────────────────────
{
  const s = contentSlide(
    "問題診斷",
    "企業自己申請，通常卡在這三件事",
    "這三件事都不在課程清單裡，卻是分署審查與訪視真正在看的東西。"
  );
  const pains = [
    {
      t: "計畫書寫不出因果鏈",
      d: "分署看的是「訓練需求分析 → 課程設計 → 績效指標」的邏輯關係。列一份課程清單過不了審查。",
    },
    {
      t: "課排得出來，成果驗收不出來",
      d: "上完課沒有素材、沒有數據、沒有可展示的產出，訪視當天問不出成效，隔年申請就會被記住。",
    },
    {
      t: "核銷單據的細節扣分",
      d: "簽到表、講師鐘點費、講師資格文件、非自有場地費憑證，任一項缺漏就是打折，補件還要重跑流程。",
    },
  ];
  const cw = 3.79;
  pains.forEach((it, i) => {
    const x = M + i * (cw + 0.28);
    card(s, x, 2.05, cw, 2.65, SAND);
    numCircle(s, x + 0.35, 2.32, i + 1, 0.42, TERRA, WHITE);
    s.addText(it.t, {
      x: x + 0.35,
      y: 2.9,
      w: cw - 0.7,
      h: 0.7,
      fontFace: HEAD,
      fontSize: 17,
      bold: true,
      color: ESPRESSO,
      lineSpacingMultiple: 1.05,
      margin: 0,
    });
    s.addText(it.d, {
      x: x + 0.35,
      y: 3.62,
      w: cw - 0.7,
      h: 0.95,
      fontFace: BODY,
      fontSize: 12.5,
      color: MUTED,
      lineSpacingMultiple: 1.2,
      margin: 0,
    });
  });
  card(s, M, 5.0, W - M * 2, 1.0, ESPRESSO);
  s.addText("我們的定位：把貴公司看不見的審查邏輯，變成可以照著跑的流程與文件。", {
    x: M + 0.45,
    y: 5.0,
    w: W - M * 2 - 0.9,
    h: 1.0,
    valign: "middle",
    fontFace: HEAD,
    fontSize: 19,
    bold: true,
    color: WHITE,
    margin: 0,
  });
  s.addNotes("這頁是定價權的來源。客戶自己看不見的東西，才是我們收費的理由。講完停一下再翻頁。");
}

// ── 08 分隔頁 02 ───────────────────────────────────────────
divider(2, "PART 02", "服務範疇", "四大模組、補助內外的分界，以及責任邊界。").addNotes(
  "第二段回答「你們到底做什麼」。重點在補助內／補助外那頁，講清楚錢怎麼走。"
);

// ── 09 服務全景：補助內 vs 補助外 ──────────────────────────
{
  const s = contentSlide(
    "服務全景",
    "哪些走補助，哪些另行報價",
    "先把錢的邊界講清楚，後面的課綱與報價才不會有誤會。"
  );
  card(s, M, 2.0, 5.8, 3.9, SAND);
  s.addText("補助內　訓練費用可支應", {
    x: M + 0.4,
    y: 2.25,
    w: 5.0,
    h: 0.38,
    fontFace: HEAD,
    fontSize: 19,
    bold: true,
    color: TERRA,
    margin: 0,
  });
  bullets(
    s,
    [
      "訓練需求分析與訓練計畫書撰擬",
      "課綱設計、教材與講義製作",
      "內部訓練：講師鐘點費、非自有場地費",
      "外部訓練：學員訓練費（青年／中高齡可達 70%）",
      "TTQS 相關文件整備與辦訓紀錄",
      "訓練成果驗收與核銷文件編製",
    ],
    { x: M + 0.4, y: 2.75, w: 5.0, h: 2.9, fontSize: 13 }
  );

  card(s, M + 6.1, 2.0, 5.8, 3.9, WHITE);
  s.addText("補助外　另行報價的代理服務", {
    x: M + 6.5,
    y: 2.25,
    w: 5.0,
    h: 0.38,
    fontFace: HEAD,
    fontSize: 19,
    bold: true,
    color: ESPRESSO,
    margin: 0,
  });
  bullets(
    s,
    [
      "社群帳號代營運、發文排程與留言回覆",
      "廣告投放代操與成效優化（廣告金另計）",
      "商業級影音拍攝、剪輯與後製",
      "品牌視覺、封面設計與銷售頁製作",
      "官網／學習平台架設與後台使用費",
    ],
    { x: M + 6.5, y: 2.75, w: 5.0, h: 2.5, fontSize: 13 }
  );
  s.addText("課程輔導建立內部能力，代理服務負責加速——兩邊可分開簽，也可搭配執行。", {
    x: M + 6.5,
    y: 5.25,
    w: 5.0,
    h: 0.6,
    fontFace: BODY,
    fontSize: 12,
    italic: true,
    color: MUTED,
    margin: 0,
  });
  s.addText("數位學習平台架設費用及後台使用費不含於本輔導專案。", {
    x: M,
    y: 6.05,
    w: W - M * 2,
    h: 0.32,
    fontFace: BODY,
    fontSize: 11.5,
    color: MUTED,
    margin: 0,
  });
  s.addNotes("客戶最常誤會的一頁。明講：補助只能支應訓練費用，代操與拍攝是另一張報價單。");
}

// ── 10 模組一、二 ──────────────────────────────────────────
function moduleSlide(kicker, title, sub, mods, startNo) {
  const s = contentSlide(kicker, title, sub);
  const cw = 5.8;
  mods.forEach((m, i) => {
    const x = M + i * (cw + 0.3);
    card(s, x, 2.0, cw, 3.95, i === 0 ? SAND : WHITE);
    numCircle(s, x + 0.4, 2.3, startNo + i, 0.44, i === 0 ? TERRA : SAGE, WHITE);
    s.addText(m.t, {
      x: x + 0.98,
      y: 2.3,
      w: cw - 1.4,
      h: 0.44,
      valign: "middle",
      fontFace: HEAD,
      fontSize: 20,
      bold: true,
      color: ESPRESSO,
      margin: 0,
    });
    bullets(s, m.items, { x: x + 0.4, y: 2.95, w: cw - 0.8, h: 2.15, fontSize: 13 });
    s.addShape(pres.ShapeType.line, {
      x: x + 0.4,
      y: 5.18,
      w: cw - 0.8,
      h: 0,
      line: { color: LINE, width: 1 },
    });
    s.addText([
      { text: "交付物　", options: { bold: true, color: TERRA } },
      { text: m.out, options: { color: ESPRESSO } },
    ], {
      x: x + 0.4,
      y: 5.32,
      w: cw - 0.8,
      h: 0.5,
      fontFace: BODY,
      fontSize: 12.5,
      lineSpacingMultiple: 1.15,
      margin: 0,
    });
  });
  return s;
}

moduleSlide(
  "服務範疇　模組 1–2",
  "內容策略與腳本　／　社群代營運",
  "前段負責「講什麼」，後段負責「怎麼持續講下去」。",
  [
    {
      t: "內容策略與腳本",
      items: [
        "品牌定位與受眾輪廓盤點，含三家競品社群拆解",
        "月度主題軸線與內容行事曆",
        "短影音口播腳本（60–90 秒）",
        "IG 輪播腳本（7–8 張）與貼文文案",
        "節慶與檔期內容規劃",
      ],
      out: "內容行事曆一份、短影音腳本 12 支／季、輪播腳本 8 組／季",
    },
    {
      t: "社群代營運與發文",
      items: [
        "帳號健檢與版面重整：首圖、精選、簡介、CTA",
        "發文排程與跨平台同步（IG／FB／YouTube）",
        "留言與私訊回覆規範建立",
        "素材庫建置與命名規則，交接不斷線",
        "月度數據追蹤與主題調整",
      ],
      out: "社群月報一份、素材庫一套、發文排程表",
    },
  ],
  1
).addNotes("模組一二講「內容怎麼生出來、怎麼不斷炊」。強調素材庫與命名規則——這是客戶換人也不會亂的關鍵。");

// ── 11 模組三、四 ──────────────────────────────────────────
moduleSlide(
  "服務範疇　模組 3–4",
  "廣告投放與成效優化　／　影音拍攝製作",
  "前段把流量買對，後段把素材做出來。兩者共用同一組數據判斷。",
  [
    {
      t: "廣告投放與成效優化",
      items: [
        "Meta／Google 帳號結構重建與像素、轉換事件檢查",
        "受眾測試矩陣與素材輪替節奏",
        "五大指標優化模型：曝光、點擊率、單次成本、轉換率、ROAS",
        "預算配置與檔期節奏建議",
        "雙週成效檢討會議",
      ],
      out: "雙週成效報表、優化建議書、廣告帳號結構文件（廣告金另計）",
    },
    {
      t: "影音拍攝與製作",
      items: [
        "商品、形象、人物專訪與流程紀錄拍攝",
        "SDE 當日剪輯：腳本 → 拍攝 → 後製 → 上架同日完成",
        "現場提供穩定器、燈具、光板，講師與助教各一名",
        "內部培訓影片與宣導片企劃（劇情類／教科類）",
        "字幕、封面與多平台尺寸輸出",
      ],
      out: "每個拍攝日產出短影音 3–5 支、橫式主片 1 支、封面圖組",
    },
  ],
  3
).addNotes("SDE 當日剪輯是我們的差異點——課上完，成品當天就發出去。訪視時這就是最好的成果證明。");

// ── 12 課綱藍圖 ────────────────────────────────────────────
{
  const s = contentSlide(
    "課綱設計",
    "黃金組合：四段式課程流程",
    "課程順序決定學員能不能在結訓當天交出作品。"
  );
  const flow = [
    { t: "拍攝", d: "圖片／影片素材產出\n器材操作與現場實作", h: "建議 8 小時" },
    { t: "後製與修圖", d: "剪輯軟體實作\n字幕、封面、輸出規格", h: "建議 4 小時" },
    { t: "社群與廣告", d: "版面經營、廣告帳號設定\n投放實作與受眾測試", h: "建議 4 小時" },
    { t: "數據與成效", d: "五大指標判讀\n優化決策與月報製作", h: "建議 4 小時" },
  ];
  const cw = 2.7733;
  const gap = 0.28;
  flow.forEach((it, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 2.15, cw, 2.75, i % 2 === 0 ? SAND : WHITE);
    numCircle(s, x + 0.32, 2.42, i + 1, 0.42, i % 2 === 0 ? TERRA : SAGE, WHITE);
    s.addText(it.t, {
      x: x + 0.32,
      y: 2.98,
      w: cw - 0.64,
      h: 0.4,
      fontFace: HEAD,
      fontSize: 19,
      bold: true,
      color: ESPRESSO,
      margin: 0,
    });
    s.addText(it.d, {
      x: x + 0.32,
      y: 3.42,
      w: cw - 0.64,
      h: 0.9,
      fontFace: BODY,
      fontSize: 12.5,
      color: MUTED,
      lineSpacingMultiple: 1.2,
      margin: 0,
    });
    s.addText(it.h, {
      x: x + 0.32,
      y: 4.4,
      w: cw - 0.64,
      h: 0.3,
      fontFace: BODY,
      fontSize: 12,
      bold: true,
      color: TERRA,
      margin: 0,
    });
    if (i < flow.length - 1) {
      s.addShape(pres.ShapeType.line, {
        x: x + cw + 0.05,
        y: 3.5,
        w: gap - 0.1,
        h: 0,
        line: { color: LINE, width: 2 },
      });
    }
  });
  s.addText(
    "總時數 20 小時為基本組合。實際課綱依貴公司職能盤點結果調整，可拆分為多梯次並依部門分班。",
    {
      x: M,
      y: 5.2,
      w: W - M * 2,
      h: 0.4,
      fontFace: BODY,
      fontSize: 13.5,
      color: ESPRESSO,
      margin: 0,
    }
  );
  s.addText("課程費用不含廣告金預算；可視公司檔期協助設定廣告平台與投放。", {
    x: M,
    y: 5.65,
    w: W - M * 2,
    h: 0.32,
    fontFace: BODY,
    fontSize: 11.5,
    color: MUTED,
    margin: 0,
  });
  s.addNotes("順序不能換。先拍才有素材，有素材才有得投，有投才有數據。這個邏輯講清楚，課綱就賣得掉。");
}

// ── 13 責任邊界 ────────────────────────────────────────────
{
  const s = contentSlide(
    "責任邊界",
    "我們做什麼，貴公司做什麼",
    "把分工寫在提案裡，執行期間就不會互相等。"
  );
  const rows = [
    ["訓練需求訪談與職能盤點", "主辦｜設計訪談與彙整", "受訪｜指派各部門主管"],
    ["訓練計畫書與課綱撰擬", "主辦｜全份撰擬", "提供｜人事資料與訓練紀錄"],
    ["線上系統送件", "協辦｜代填與檢核", "提供｜系統帳號與文件用印"],
    ["講師、教材與講義", "主辦｜全數負責", "—"],
    ["場地與拍攝設備", "提供｜穩定器、燈具、光板", "提供｜教室與網路"],
    ["學員出席與名冊管理", "提供｜表單與範本", "執行｜派訓、點名、補簽"],
    ["分署實地訪視", "現場陪同｜文件預檢", "出席｜負責人或訓練主管"],
    ["經費核銷與結案", "主辦｜單據編製與送件", "提供｜用印與付款憑證"],
  ];
  s.addTable(
    [
      [
        { text: "工作項目", options: { bold: true, color: WHITE, fill: { color: ESPRESSO } } },
        { text: "知育行銷", options: { bold: true, color: WHITE, fill: { color: ESPRESSO } } },
        { text: "貴公司", options: { bold: true, color: WHITE, fill: { color: ESPRESSO } } },
      ],
      ...rows.map((r, i) =>
        r.map((c, j) => ({
          text: c,
          options: {
            color: ESPRESSO,
            bold: j === 0,
            fill: { color: i % 2 === 0 ? WHITE : SAND },
          },
        }))
      ),
    ],
    {
      x: M,
      y: 2.0,
      w: W - M * 2,
      colW: [4.4, 3.75, 3.75],
      rowH: 0.44,
      fontFace: BODY,
      fontSize: 12.5,
      valign: "middle",
      border: { type: "solid", color: LINE, pt: 1 },
      margin: [4, 10, 4, 10],
    }
  );
  s.addNotes("這頁是防呆。客戶最常忘記的是「派訓與點名」——人沒到，補助就打折。當場提醒。");
}

// ── 14 分隔頁 03 ───────────────────────────────────────────
divider(3, "PART 03", "計劃執行", "五個階段、各階段的服務承諾與交付物。").addNotes(
  "第三段回答「你們怎麼把它做完」。重點在服務承諾的天數，這是別人不敢寫的。"
);

// ── 15 五階段總覽 ──────────────────────────────────────────
{
  const s = contentSlide(
    "執行總覽",
    "五個階段，一個窗口",
    "從資格確認到核銷結案，貴公司的對口只有一位。"
  );
  const phases = [
    { t: "盤點與資格確認", d: "投保人數、年齡結構、訓練需求訪談、補助試算", w: "第 1 週" },
    { t: "計畫書與課綱撰擬", d: "訓練需求分析、課程設計、績效指標、文件備齊送件", w: "第 2–3 週" },
    { t: "核定與開訓準備", d: "學員名冊、開訓報備、教材印製、場地與設備確認", w: "核定後" },
    { t: "課程執行與訪視", d: "授課、簽到管理、成果產出、訪視文件預檢與陪同", w: "訓練期間" },
    { t: "核銷結案與成效報告", d: "單據編製、滿意度調查、成效報告、次年度建議", w: "結訓後" },
  ];
  const rowH = 0.78;
  phases.forEach((p, i) => {
    const y = 2.05 + i * (rowH + 0.14);
    card(s, M, y, W - M * 2, rowH, i % 2 === 0 ? SAND : WHITE);
    numCircle(s, M + 0.3, y + 0.17, i + 1, 0.44, i === 3 ? TERRA : SAGE, WHITE);
    s.addText(p.t, {
      x: M + 0.95,
      y: y,
      w: 3.3,
      h: rowH,
      valign: "middle",
      fontFace: HEAD,
      fontSize: 17,
      bold: true,
      color: ESPRESSO,
      margin: 0,
    });
    s.addText(p.d, {
      x: M + 4.35,
      y: y,
      w: 5.4,
      h: rowH,
      valign: "middle",
      fontFace: BODY,
      fontSize: 12.5,
      color: MUTED,
      margin: 0,
    });
    s.addText(p.w, {
      x: W - M - 2.0,
      y: y,
      w: 1.7,
      h: rowH,
      align: "right",
      valign: "middle",
      fontFace: BODY,
      fontSize: 13,
      bold: true,
      color: TERRA,
      margin: 0,
    });
  });
  s.addNotes("五階段。講的時候手指著第四階段：訪視是最多企業出事的地方，我們現場陪同。");
}

// ── 16 服務承諾（SLA） ─────────────────────────────────────
{
  const s = contentSlide(
    "服務承諾",
    "每個階段，我們押上時間",
    "以下為知育行銷的內部作業承諾，寫進合約附件。"
  );
  const slas = [
    { n: "3", u: "個工作天", t: "回覆資格可行性", d: "收到投保人數與年齡分布後，提供補助試算與類型建議。" },
    { n: "5", u: "個工作天", t: "交出課綱草案", d: "完成需求訪談後，提出課綱架構與訓練計畫書大綱。" },
    { n: "14", u: "個工作天", t: "完成開訓報備", d: "開訓前備妥學員名冊、課程表與報備文件。" },
    { n: "3", u: "個工作天", t: "回傳課堂紀錄", d: "每堂課後回傳簽到表掃描檔與課堂執行紀錄。" },
    { n: "5", u: "個工作天", t: "訪視文件預檢", d: "訪視前完成全份文件預檢，並提供應答重點。" },
    { n: "15", u: "個工作天", t: "備妥核銷單據", d: "結訓後完成單據編製，交由貴公司用印送件。" },
  ];
  const cw = 3.79;
  const ch = 1.85;
  slas.forEach((it, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = M + col * (cw + 0.28);
    const y = 2.0 + row * (ch + 0.28);
    card(s, x, y, cw, ch, row === 0 ? SAND : WHITE);
    s.addText(
      [
        { text: it.n, options: { fontSize: 30, bold: true, color: TERRA, fontFace: HEAD } },
        { text: " " + it.u, options: { fontSize: 13, color: MUTED, fontFace: BODY } },
      ],
      { x: x + 0.35, y: y + 0.15, w: cw - 0.7, h: 0.62, margin: 0 }
    );
    s.addText(it.t, {
      x: x + 0.35,
      y: y + 0.82,
      w: cw - 0.7,
      h: 0.32,
      fontFace: BODY,
      fontSize: 15,
      bold: true,
      color: ESPRESSO,
      margin: 0,
    });
    s.addText(it.d, {
      x: x + 0.35,
      y: y + 1.18,
      w: cw - 0.7,
      h: 0.6,
      fontFace: BODY,
      fontSize: 12,
      color: MUTED,
      lineSpacingMultiple: 1.15,
      margin: 0,
    });
  });
  s.addText("分署端之審查、核定與撥款時程依當年度公告辦理，不在本承諾範圍內。", {
    x: M,
    y: 6.15,
    w: W - M * 2,
    h: 0.32,
    fontFace: BODY,
    fontSize: 11.5,
    color: MUTED,
    margin: 0,
  });
  s.addNotes("這頁是這份提案最有殺傷力的一頁。同業不敢寫天數。寫進合約附件，客戶會記住。");
}

// ── 17 交付物與驗收 ────────────────────────────────────────
{
  const s = contentSlide(
    "交付與驗收",
    "每個階段交什麼、怎麼算完成",
    "驗收標準寫在前面，結案時就不必爭論。"
  );
  const rows = [
    ["盤點", "資格檢核表、補助試算表", "貴公司確認訓練類型與預估規模"],
    ["送件", "訓練計畫書、課綱、講師資格文件", "分署收件完成"],
    ["開訓", "學員名冊、課程表、教材與講義", "開訓報備完成"],
    ["執行", "簽到表、課堂紀錄、課程成果影音", "每梯次結訓即驗收"],
    ["訪視", "文件預檢清單、應答重點整理", "訪視完成且無待補件"],
    ["結案", "核銷單據包、滿意度調查、成效報告", "核銷送件完成"],
  ];
  s.addTable(
    [
      [
        { text: "階段", options: { bold: true, color: WHITE, fill: { color: ESPRESSO } } },
        { text: "交付物", options: { bold: true, color: WHITE, fill: { color: ESPRESSO } } },
        { text: "驗收標準", options: { bold: true, color: WHITE, fill: { color: ESPRESSO } } },
      ],
      ...rows.map((r, i) =>
        r.map((c, j) => ({
          text: c,
          options: {
            color: j === 0 ? TERRA : ESPRESSO,
            bold: j === 0,
            fill: { color: i % 2 === 0 ? WHITE : SAND },
          },
        }))
      ),
    ],
    {
      x: M,
      y: 2.0,
      w: W - M * 2,
      colW: [1.9, 5.2, 4.8],
      rowH: 0.52,
      fontFace: BODY,
      fontSize: 13,
      valign: "middle",
      border: { type: "solid", color: LINE, pt: 1 },
      margin: [4, 10, 4, 10],
    }
  );
  s.addText("所有交付物同步存放於共享雲端資料夾，貴公司隨時可查閱最新版本。", {
    x: M,
    y: 5.85,
    w: W - M * 2,
    h: 0.35,
    fontFace: BODY,
    fontSize: 13,
    color: ESPRESSO,
    margin: 0,
  });
  s.addNotes("驗收標準寫死，結案不吵架。共享資料夾這件事一定要講，客戶很在意看得到進度。");
}

// ── 18 團隊分工 ────────────────────────────────────────────
{
  const s = contentSlide(
    "執行團隊",
    "四人編制，一位窗口",
    "貴公司只需要對接一位負責人，內部分工由我方調度。"
  );
  const team = [
    { r: "執行長", n: "黃皇賓", d: "策略規劃、課綱設計、主授課、客戶單一窗口", tag: "對口" },
    { r: "拍攝剪輯", n: "影音專員", d: "課程拍攝、SDE 當日剪輯、成果影音產製", tag: "" },
    { r: "平面企劃", n: "設計專員", d: "教材與講義設計、視覺素材、成果報告排版", tag: "" },
    { r: "行政會計", n: "行政專員", d: "文件備齊、簽到管理、核銷單據編製與送件", tag: "" },
  ];
  const cw = 2.7733;
  team.forEach((m, i) => {
    const x = M + i * (cw + 0.28);
    card(s, x, 2.15, cw, 3.1, i === 0 ? ESPRESSO : WHITE);
    const dark = i === 0;
    s.addShape(pres.ShapeType.ellipse, {
      x: x + cw / 2 - 0.38,
      y: 2.45,
      w: 0.76,
      h: 0.76,
      fill: { color: dark ? TERRA : SAND },
      line: { color: dark ? TERRA : LINE, width: 1 },
    });
    s.addText(m.r.slice(0, 2), {
      x: x + cw / 2 - 0.38,
      y: 2.45,
      w: 0.76,
      h: 0.76,
      align: "center",
      valign: "middle",
      fontFace: HEAD,
      fontSize: 17,
      bold: true,
      color: dark ? WHITE : ESPRESSO,
      margin: 0,
    });
    s.addText(m.r, {
      x: x + 0.25,
      y: 3.38,
      w: cw - 0.5,
      h: 0.34,
      align: "center",
      fontFace: HEAD,
      fontSize: 18,
      bold: true,
      color: dark ? WHITE : ESPRESSO,
      margin: 0,
    });
    s.addText(m.n, {
      x: x + 0.25,
      y: 3.72,
      w: cw - 0.5,
      h: 0.3,
      align: "center",
      fontFace: BODY,
      fontSize: 13,
      bold: true,
      color: dark ? SAGE : TERRA,
      margin: 0,
    });
    s.addText(m.d, {
      x: x + 0.25,
      y: 4.1,
      w: cw - 0.5,
      h: 1.0,
      align: "center",
      fontFace: BODY,
      fontSize: 12,
      color: dark ? "C9C1B8" : MUTED,
      lineSpacingMultiple: 1.2,
      margin: 0,
    });
  });
  s.addText("高雄在地團隊，服務範圍以高雄、屏東、台南為主，可到廠授課與拍攝。", {
    x: M,
    y: 5.55,
    w: W - M * 2,
    h: 0.4,
    fontFace: BODY,
    fontSize: 13.5,
    color: ESPRESSO,
    margin: 0,
  });
  s.addNotes("在地團隊是優勢。台北的顧問公司不會為了一次訪視南下，我們一小時車程就到。");
}

// ── 19 實績 ────────────────────────────────────────────────
{
  const s = contentSlide(
    "合作實績",
    "做過的產業，不是列出來好看的",
    "食品製造、農產、餐飲、旅宿、教育、婚禮服務——都跑過完整的訓練與核銷流程。"
  );
  card(s, M, 2.05, 5.8, 3.5, SAND);
  s.addText("大人提／企業輔導實績", {
    x: M + 0.4,
    y: 2.3,
    w: 5.0,
    h: 0.38,
    fontFace: HEAD,
    fontSize: 19,
    bold: true,
    color: TERRA,
    margin: 0,
  });
  bullets(
    s,
    [
      "信功肉品｜480 小時課程規劃與執行",
      "臺南蛋品｜企業人力資源提升計畫申請與執行",
      "義盟興眼鏡｜輔導專案與數位轉型",
      "如記食品｜大人提訓練與品牌內容輔導",
      "萬科｜大人提課程執行與訪視管理",
    ],
    { x: M + 0.4, y: 2.8, w: 5.0, h: 2.4, fontSize: 13 }
  );

  card(s, M + 6.1, 2.05, 5.8, 3.5, WHITE);
  s.addText("行銷代理與內容服務客戶", {
    x: M + 6.5,
    y: 2.3,
    w: 5.0,
    h: 0.38,
    fontFace: HEAD,
    fontSize: 19,
    bold: true,
    color: ESPRESSO,
    margin: 0,
  });
  bullets(
    s,
    [
      "弋果美語｜廣告代操",
      "高雄萬豪酒店｜社群與影音內容",
      "白鴿婚禮顧問｜品牌行銷策劃",
      "藝隆農產、香蕉策略聯盟｜農產品牌內容",
      "奧比餐飲集團｜數位轉型輔導提案",
    ],
    { x: M + 6.5, y: 2.8, w: 5.0, h: 2.4, fontSize: 13 }
  );
  s.addText("完整作品集與成效數據可於會議中展示，或依貴公司產業提供對應案例。", {
    x: M,
    y: 5.75,
    w: W - M * 2,
    h: 0.35,
    fontFace: BODY,
    fontSize: 13,
    color: MUTED,
    margin: 0,
  });
  s.addNotes("依對方產業挑兩個案例深講，其他帶過。食品業就講信功與如記，餐飲業就講奧比。");
}

// ── 20 投資級距 ────────────────────────────────────────────
{
  const s = contentSlide(
    "投資級距",
    "三種規模，先抓量體",
    "以下為課程時數級距與適用情境；正式報價依課綱、人數與梯次另行提供。"
  );
  const plans = [
    {
      t: "輕量型",
      h: "20–24 小時",
      f: ["單一模組聚焦（多為短影音）", "一個部門、單梯次", "適合首次申請、先建立辦訓紀錄"],
      out: "短影音成品 10–15 支",
    },
    {
      t: "標準型",
      h: "40–48 小時",
      f: ["四模組黃金組合完整跑完", "跨部門、二至三梯次", "適合有明確行銷目標的企業"],
      out: "短影音 30 支以上、廣告帳號重建、成效報告",
    },
    {
      t: "深度型",
      h: "80 小時以上",
      f: ["含聯合型申請與跨廠協作", "多廠區、多梯次、分班進行", "適合集團或供應鏈聯合申請"],
      out: "完整內容系統、內訓影音庫、雙週成效追蹤",
    },
  ];
  const cw = 3.79;
  plans.forEach((p, i) => {
    const x = M + i * (cw + 0.28);
    const hi = i === 1;
    card(s, x, 2.0, cw, 3.6, hi ? ESPRESSO : WHITE);
    s.addText(p.t, {
      x: x + 0.35,
      y: 2.25,
      w: cw - 0.7,
      h: 0.4,
      fontFace: HEAD,
      fontSize: 22,
      bold: true,
      color: hi ? WHITE : ESPRESSO,
      margin: 0,
    });
    s.addText(p.h, {
      x: x + 0.35,
      y: 2.7,
      w: cw - 0.7,
      h: 0.45,
      fontFace: HEAD,
      fontSize: 24,
      bold: true,
      color: hi ? SAGE : TERRA,
      margin: 0,
    });
    bullets(s, p.f, {
      x: x + 0.35,
      y: 3.3,
      w: cw - 0.7,
      h: 1.3,
      fontSize: 12.5,
      color: hi ? "E5E0D8" : ESPRESSO,
    });
    s.addShape(pres.ShapeType.line, {
      x: x + 0.35,
      y: 4.75,
      w: cw - 0.7,
      h: 0,
      line: { color: hi ? "5A534C" : LINE, width: 1 },
    });
    s.addText([
      { text: "預期產出　", options: { bold: true, color: hi ? SAGE : TERRA } },
      { text: p.out, options: { color: hi ? "E5E0D8" : MUTED } },
    ], {
      x: x + 0.35,
      y: 4.88,
      w: cw - 0.7,
      h: 0.6,
      fontFace: BODY,
      fontSize: 12,
      lineSpacingMultiple: 1.15,
      margin: 0,
    });
  });
  s.addText(
    "課程費用之 50%–70% 由計畫補助支應，企業實付金額於課綱確認後提供試算表。所有價格均為未稅價。",
    {
      x: M,
      y: 5.78,
      w: W - M * 2,
      h: 0.4,
      fontFace: BODY,
      fontSize: 12.5,
      color: ESPRESSO,
      margin: 0,
    }
  );
  s.addNotes("比稿階段不報死價。給級距、給產出，讓對方自己對號入座，下一次會議再談數字。");
}

// ── 21 下一步 ──────────────────────────────────────────────
{
  const s = darkSlide();
  s.addText("NEXT STEP", {
    x: M,
    y: 0.75,
    w: 8,
    h: 0.3,
    fontFace: BODY,
    fontSize: 12,
    bold: true,
    color: SAGE,
    charSpacing: 2,
    margin: 0,
  });
  s.addText("接下來三個動作", {
    x: M,
    y: 1.1,
    w: 9,
    h: 0.7,
    fontFace: HEAD,
    fontSize: 36,
    bold: true,
    color: WHITE,
    margin: 0,
  });
  const acts = [
    { t: "貴公司提供", d: "最近一期投保人數證明\n與員工年齡分布", w: "本週內" },
    { t: "雙方會談", d: "60 分鐘需求訪談\n確認訓練類型與部門", w: "本週內" },
    { t: "我方交付", d: "課綱草案\n與訓練計畫書架構", w: "訪談後 5 個工作天" },
  ];
  const cw = 3.79;
  acts.forEach((a, i) => {
    const x = M + i * (cw + 0.28);
    s.addShape(pres.ShapeType.roundRect, {
      x,
      y: 2.15,
      w: cw,
      h: 2.15,
      rectRadius: 0.08,
      fill: { color: "3A352F" },
      line: { color: "4A443D", width: 1 },
    });
    numCircle(s, x + 0.35, 2.42, i + 1, 0.44, TERRA, WHITE);
    s.addText(a.t, {
      x: x + 0.95,
      y: 2.42,
      w: cw - 1.3,
      h: 0.44,
      valign: "middle",
      fontFace: HEAD,
      fontSize: 18,
      bold: true,
      color: WHITE,
      margin: 0,
    });
    s.addText(a.d, {
      x: x + 0.35,
      y: 3.02,
      w: cw - 0.7,
      h: 0.7,
      fontFace: BODY,
      fontSize: 13,
      color: "C9C1B8",
      lineSpacingMultiple: 1.2,
      margin: 0,
    });
    s.addText(a.w, {
      x: x + 0.35,
      y: 3.8,
      w: cw - 0.7,
      h: 0.3,
      fontFace: BODY,
      fontSize: 12.5,
      bold: true,
      color: SAGE,
      margin: 0,
    });
  });
  s.addText("115 年度受理申請至 115 年 9 月 30 日止。", {
    x: M,
    y: 4.7,
    w: 8,
    h: 0.4,
    fontFace: HEAD,
    fontSize: 20,
    bold: true,
    color: TERRA,
    margin: 0,
  });
  s.addShape(pres.ShapeType.line, {
    x: M,
    y: 5.35,
    w: W - M * 2,
    h: 0,
    line: { color: "4A443D", width: 1 },
  });
  s.addText("黃皇賓　BEN HUANG　｜　執行長", {
    x: M,
    y: 5.55,
    w: 6,
    h: 0.34,
    fontFace: HEAD,
    fontSize: 18,
    bold: true,
    color: WHITE,
    margin: 0,
  });
  s.addText("知育行銷有限公司", {
    x: M,
    y: 5.95,
    w: 6,
    h: 0.3,
    fontFace: BODY,
    fontSize: 13,
    color: "C9C1B8",
    margin: 0,
  });
  s.addText("電話　0983-339-790\nEmail　zhiyumkt@gmail.com", {
    x: W - M - 4.5,
    y: 5.55,
    w: 4.5,
    h: 0.72,
    align: "right",
    fontFace: BODY,
    fontSize: 13,
    color: "C9C1B8",
    lineSpacingMultiple: 1.25,
    margin: 0,
  });
  pageTag(s);
  s.addNotes("收尾不要拖。三個動作講完，直接問：投保人數的資料這週拿得到嗎？");
}

pres.writeFile({ fileName: "知育行銷_大人提_服務範疇與計劃執行提案.pptx" }).then((f) => {
  console.log("已產出：" + f + "（共 " + pageNo + " 頁）");
});
