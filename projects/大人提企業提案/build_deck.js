// 知育行銷｜大人提（企業人力資源提升計畫）企業提案簡報
// 主題：計劃說明、協助規劃範疇、服務內容、企業輔導實例
// 定位：頁面只放企業閱讀用的說明資料；說服邏輯放在講稿備忘（addNotes）
// 建置：node build_deck.js

const pptxgen = require("pptxgenjs");

// ── 色票（大地色系，精品感）
const ESPRESSO = "2E2A26";
const TERRA = "B85042";
const SAGE = "A7BEAE";
const SAND = "EFEAE3";
const WHITE = "FFFFFF";
const MUTED = "7A736C";
const LINE = "DED7CE";

const HEAD = "Cambria";
const BODY = "Calibri";

const W = 13.3;
const M = 0.7;
const INNER = W - M * 2; // 11.9

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "知育行銷有限公司";
pres.company = "知育行銷有限公司";
pres.title = "企業人力資源提升計畫｜計劃說明與服務內容";

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
    w: INNER,
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
      w: INNER,
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
      paraSpaceAfter: o.paraSpaceAfter || 6,
      margin: 0,
    }
  );
}

function footnote(s, text, y) {
  s.addText(text, {
    x: M,
    y: y || 6.1,
    w: INNER,
    h: 0.38,
    fontFace: BODY,
    fontSize: 11.5,
    color: MUTED,
    lineSpacingMultiple: 1.15,
    margin: 0,
  });
}

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

// 三欄卡片版型
function threeCards(s, y, h, items, render) {
  const cw = (INNER - 0.56) / 3;
  items.forEach((it, i) => {
    const x = M + i * (cw + 0.28);
    render(it, i, x, cw);
  });
  return cw;
}

// 表格
function table(s, head, rows, colW, y, rowH, fontSize) {
  s.addTable(
    [
      head.map((h) => ({
        text: h,
        options: { bold: true, color: WHITE, fill: { color: ESPRESSO } },
      })),
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
      y: y,
      w: INNER,
      colW: colW,
      rowH: rowH || 0.44,
      fontFace: BODY,
      fontSize: fontSize || 12.5,
      valign: "middle",
      border: { type: "solid", color: LINE, pt: 1 },
      margin: [4, 10, 4, 10],
    }
  );
}

// ── 01 封面 ────────────────────────────────────────────────
{
  const s = darkSlide();
  s.addText("勞動部勞動力發展署　115 年度", {
    x: M,
    y: 1.7,
    w: 10,
    h: 0.35,
    fontFace: BODY,
    fontSize: 14,
    bold: true,
    color: SAGE,
    charSpacing: 2,
    margin: 0,
  });
  s.addText("企業人力資源\n提升計畫", {
    x: M,
    y: 2.2,
    w: 9,
    h: 2.1,
    fontFace: HEAD,
    fontSize: 50,
    bold: true,
    color: WHITE,
    lineSpacingMultiple: 1.05,
    margin: 0,
  });
  s.addText("計劃說明　｜　協助規劃範疇　｜　服務內容　｜　企業輔導實例", {
    x: M,
    y: 4.5,
    w: 10.5,
    h: 0.4,
    fontFace: BODY,
    fontSize: 15,
    color: "C9C1B8",
    margin: 0,
  });
  s.addShape(pres.ShapeType.line, {
    x: M,
    y: 5.3,
    w: 2.2,
    h: 0,
    line: { color: TERRA, width: 2 },
  });
  s.addText("知育行銷有限公司　ZHIYU MARKETING", {
    x: M,
    y: 5.55,
    w: 7,
    h: 0.32,
    fontFace: BODY,
    fontSize: 13,
    bold: true,
    color: WHITE,
    margin: 0,
  });
  s.addText("2026 年 8 月", {
    x: M,
    y: 5.9,
    w: 7,
    h: 0.32,
    fontFace: BODY,
    fontSize: 12,
    color: MUTED,
    margin: 0,
  });
  s.addNotes(
    "開場：這份資料分四段——計畫本身怎麼運作、我們協助規劃到什麼程度、實際服務內容、以及做過的企業長什麼樣子。可以先翻，有問題隨時打斷。"
  );
}

// ── 02 目錄 ────────────────────────────────────────────────
{
  const s = contentSlide("CONTENTS", "本份資料的四個部分", null);
  const secs = [
    { t: "計劃說明", d: "計畫目的、訓練類型與補助上限、申請資格、補助比率、課程分類與規格、年度執行流程" },
    { t: "協助規劃範疇", d: "申請前、執行中、結案後的協助範圍，訓練需求盤點方法，課綱規劃路徑，雙方分工" },
    { t: "服務內容", d: "四大服務模組、課程執行方式與現場配置、交付物清單、課程規模參考" },
    { t: "企業輔導實例", d: "信功肉品 480 小時課程規劃、課程主題時數分布、其他輔導企業與產業經驗" },
  ];
  secs.forEach((it, i) => {
    const y = 2.0 + i * 1.12;
    card(s, M, y, INNER, 0.95, i % 2 === 0 ? SAND : WHITE);
    numCircle(s, M + 0.35, y + 0.25, i + 1, 0.46, i % 2 === 0 ? TERRA : SAGE, WHITE);
    s.addText(it.t, {
      x: M + 1.05,
      y: y,
      w: 2.7,
      h: 0.95,
      valign: "middle",
      fontFace: HEAD,
      fontSize: 21,
      bold: true,
      color: ESPRESSO,
      margin: 0,
    });
    s.addText(it.d, {
      x: M + 3.85,
      y: y,
      w: INNER - 4.2,
      h: 0.95,
      valign: "middle",
      fontFace: BODY,
      fontSize: 12.5,
      color: MUTED,
      lineSpacingMultiple: 1.15,
      margin: 0,
    });
  });
  s.addNotes("先講架構，讓對方知道什麼時候會講到他關心的部分。多數老闆最在意第四段的實例，可以先問他想從哪一段開始。");
}

// ── 03 PART 01 ─────────────────────────────────────────────
divider(1, "PART 01", "計劃說明", "計畫怎麼運作、補助多少、什麼樣的課程可以申請。").addNotes(
  "這一段純講計畫。不要推銷，讓對方自己判斷有沒有資格、值不值得做。"
);

// ── 04 計畫概述 ────────────────────────────────────────────
{
  const s = contentSlide(
    "計畫概述",
    "企業人力資源提升計畫是什麼",
    "由勞動部勞動力發展署辦理，補助事業單位辦理在職員工訓練的部分訓練費用。"
  );
  card(s, M, 2.0, INNER, 1.55, SAND);
  s.addText("計畫目的", {
    x: M + 0.45,
    y: 2.22,
    w: 3.0,
    h: 0.35,
    fontFace: HEAD,
    fontSize: 19,
    bold: true,
    color: TERRA,
    margin: 0,
  });
  s.addText(
    "協助事業單位辦理在職員工進修訓練，提供訓練課程之部分訓練費用補助，讓企業以可控的成本投資人力資本，並將訓練成果留在企業內部。",
    {
      x: M + 0.45,
      y: 2.62,
      w: INNER - 0.9,
      h: 0.75,
      fontFace: BODY,
      fontSize: 14,
      color: ESPRESSO,
      lineSpacingMultiple: 1.25,
      margin: 0,
    }
  );

  const facts = [
    { t: "主辦單位", d: "勞動部勞動力發展署\n各地分署受理與審查" },
    { t: "補助性質", d: "訓練費用之部分補助\n非全額給付、需先執行後核銷" },
    { t: "申請週期", d: "每年度受理申請一次\n115 年度受理至 9 月 30 日止" },
  ];
  threeCards(s, 0, 0, facts, (it, i, x, cw) => {
    card(s, x, 3.85, cw, 1.95, WHITE);
    s.addText(it.t, {
      x: x + 0.35,
      y: 4.1,
      w: cw - 0.7,
      h: 0.38,
      fontFace: HEAD,
      fontSize: 18,
      bold: true,
      color: ESPRESSO,
      margin: 0,
    });
    s.addText(it.d, {
      x: x + 0.35,
      y: 4.55,
      w: cw - 0.7,
      h: 0.95,
      fontFace: BODY,
      fontSize: 13,
      color: MUTED,
      lineSpacingMultiple: 1.25,
      margin: 0,
    });
  });
  footnote(s, "訓練費用先由企業支付，經分署審查核定後依核銷結果撥付補助款。", 6.0);
  s.addNotes("重點提醒：是『先執行、後核銷』，不是先拿錢。企業要有這個現金流的心理準備，這點先講清楚後面不會有誤會。");
}

// ── 05 三種訓練類型 ────────────────────────────────────────
{
  const s = contentSlide(
    "訓練類型",
    "三種申請類型，補助上限不同",
    "依申請單位的組成方式區分，計畫書的寫法與參訓對象範圍隨之不同。"
  );
  const types = [
    {
      t: "個別型",
      n: "95 萬",
      d: "由一家事業單位申請辦理訓練。",
      w: "訓練對象為該單位之在職員工。",
    },
    {
      t: "聯合型",
      n: "190 萬",
      d: "由一家事業單位申請辦理聯合訓練，結合一家以上具產業或區域發展關聯性之事業單位共同參加。",
      w: "適用於集團關係企業、供應鏈上下游、同區域同業。",
    },
    {
      t: "產業推升型",
      n: "200 萬",
      d: "以經濟部「推動中堅企業躍升計畫」遴選之相關單位，或勞動部「國家人才發展獎」獲獎單位為申請對象。",
      w: "需具備上述遴選或獲獎資格。",
    },
  ];
  threeCards(s, 0, 0, types, (it, i, x, cw) => {
    card(s, x, 2.0, cw, 3.5, WHITE);
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
    s.addText([
      { text: "最高補助　", options: { fontSize: 13, color: MUTED, fontFace: BODY } },
      { text: it.n, options: { fontSize: 26, bold: true, color: TERRA, fontFace: HEAD } },
    ], { x: x + 0.35, y: 2.85, w: cw - 0.7, h: 0.55, margin: 0 });
    s.addText(it.d, {
      x: x + 0.35,
      y: 3.5,
      w: cw - 0.7,
      h: 1.15,
      fontFace: BODY,
      fontSize: 12.5,
      color: ESPRESSO,
      lineSpacingMultiple: 1.2,
      margin: 0,
    });
    s.addText(it.w, {
      x: x + 0.35,
      y: 4.7,
      w: cw - 0.7,
      h: 0.7,
      fontFace: BODY,
      fontSize: 12,
      italic: true,
      color: MUTED,
      lineSpacingMultiple: 1.15,
      margin: 0,
    });
  });
  footnote(s, "上述金額為年度訓練費用補助上限，不含稅額；實際核定金額依分署審查結果。", 5.75);
  s.addNotes("如果對方有關係企業或同區域的同業夥伴，聯合型的上限是個別型的兩倍。這題現場問一句就知道要不要往下談。");
}

// ── 06 申請資格 ────────────────────────────────────────────
{
  const s = contentSlide(
    "申請資格",
    "誰可以申請",
    "以就業保險投保人數為主要門檻，未達門檻者另有四條替代條件。"
  );
  card(s, M, 2.0, 5.5, 1.85, SAND);
  s.addText("基本身分", {
    x: M + 0.4,
    y: 2.22,
    w: 4.7,
    h: 0.35,
    fontFace: HEAD,
    fontSize: 18,
    bold: true,
    color: TERRA,
    margin: 0,
  });
  bullets(
    s,
    ["民營事業機構", "非營利法人或團體"],
    { x: M + 0.4, y: 2.65, w: 4.7, h: 0.85, fontSize: 13.5 }
  );

  card(s, M + 5.8, 2.0, 6.1, 1.85, ESPRESSO);
  s.addText("人數門檻", {
    x: M + 6.2,
    y: 2.22,
    w: 5.3,
    h: 0.35,
    fontFace: HEAD,
    fontSize: 18,
    bold: true,
    color: SAGE,
    margin: 0,
  });
  s.addText([
    { text: "受僱勞工參加就業保險人數　", options: { fontSize: 13.5, color: "C9C1B8" } },
    { text: "51 人（含）以上", options: { fontSize: 20, bold: true, color: WHITE, fontFace: HEAD } },
  ], {
    x: M + 6.2,
    y: 2.7,
    w: 5.3,
    h: 0.85,
    fontFace: BODY,
    lineSpacingMultiple: 1.3,
    margin: 0,
  });

  card(s, M, 4.05, INNER, 2.0, WHITE);
  s.addText("投保人數未滿 51 人：符合以下任一條件亦得申請", {
    x: M + 0.4,
    y: 4.25,
    w: INNER - 0.8,
    h: 0.35,
    fontFace: HEAD,
    fontSize: 17,
    bold: true,
    color: ESPRESSO,
    margin: 0,
  });
  const alts = [
    "TTQS 企業機構版評核結果為通過以上，或辦訓能力檢核表為合格",
    "曾獲國家人力創新獎、國家訓練品質獎、國家人才發展獎",
    "申請小型企業人力提升計畫，經分署認定已具辦訓能力而不予提供後續訓練課程辦理事宜",
    "接受小型企業人力提升計畫輔導服務及訓練課程達三年以上，且未繼續申請該計畫",
  ];
  alts.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + 0.4 + col * 5.6;
    const y = 4.72 + row * 0.62;
    numCircle(s, x, y, i + 1, 0.32, SAGE, WHITE);
    s.addText(t, {
      x: x + 0.45,
      y: y - 0.06,
      w: 5.0,
      h: 0.5,
      valign: "middle",
      fontFace: BODY,
      fontSize: 12,
      color: ESPRESSO,
      lineSpacingMultiple: 1.1,
      margin: 0,
    });
  });
  s.addNotes("資格這頁讓對方自己對照。如果人數在 51 人邊緣，請他提供最近一期勞保投保人數證明，我們可以先幫忙確認。");
}

// ── 07 補助比率與可補助費用 ────────────────────────────────
{
  const s = contentSlide(
    "補助比率",
    "補助多少，補助什麼",
    "一般課程補助 50%；派訓特定年齡層員工參加外部訓練，該課程補助比率提高至 70%。"
  );
  card(s, M, 2.0, 5.5, 3.5, WHITE);
  s.addText("補助比率", {
    x: M + 0.4,
    y: 2.22,
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
        labels: ["一般內訓／外訓", "青年及中高齡外訓"],
        values: [50, 70],
      },
    ],
    {
      x: M + 0.2,
      y: 2.6,
      w: 5.1,
      h: 1.95,
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
  s.addText("派訓對象為 29 歲以下青年或 45 歲以上中高齡勞工者適用 70%。", {
    x: M + 0.4,
    y: 4.72,
    w: 4.7,
    h: 0.62,
    fontFace: BODY,
    fontSize: 12,
    color: MUTED,
    lineSpacingMultiple: 1.15,
    margin: 0,
  });

  card(s, M + 5.8, 2.0, 6.1, 3.5, SAND);
  s.addText("可申請補助的費用項目", {
    x: M + 6.2,
    y: 2.22,
    w: 5.3,
    h: 0.35,
    fontFace: HEAD,
    fontSize: 18,
    bold: true,
    color: TERRA,
    margin: 0,
  });
  bullets(
    s,
    [
      "內部訓練：講師鐘點費",
      "內部訓練：非自有場地之場地費",
      "內部訓練：教材與講義製作費",
      "外部訓練：學員訓練費用",
      "外部訓練：必要之交通費",
    ],
    { x: M + 6.2, y: 2.68, w: 5.3, h: 2.5, fontSize: 13.5, paraSpaceAfter: 9 }
  );
  footnote(
    s,
    "工作崗位實作類課程不予補助。廣告投放預算、平台架設與後台使用費、設備採購費用不屬於訓練費用補助範圍。",
    5.75
  );
  s.addNotes("年齡結構決定補助比率。請對方回去調一份員工年齡分布，29 歲以下和 45 歲以上的比例，直接影響能拿到 50% 還是 70%。");
}

// ── 08 課程種類與課程大類 ──────────────────────────────────
{
  const s = contentSlide(
    "課程分類",
    "計畫認可的課程種類",
    "訓練計畫書中每一門課都必須對應到指定的課程種類與課程大類。"
  );
  const kinds = [
    {
      t: "一般性課程",
      d: "依部門功能與專業領域規劃，時數彈性最高。",
      x: "每梯最少 2 小時，以整點為單位",
    },
    {
      t: "關鍵就業力課程",
      d: "對應知識職能（KC）、動機職能（DC）、人際職能（BC）之指定單元。",
      x: "每梯 2 至 8 小時",
    },
    {
      t: "共同核心職能課程",
      d: "工作價值與願景、群我倫理與績效、專業精神與自我管理等共通職能。",
      x: "每梯 2 至 8 小時",
    },
  ];
  threeCards(s, 0, 0, kinds, (it, i, x, cw) => {
    card(s, x, 2.0, cw, 1.95, i === 0 ? SAND : WHITE);
    s.addText(it.t, {
      x: x + 0.35,
      y: 2.2,
      w: cw - 0.7,
      h: 0.38,
      fontFace: HEAD,
      fontSize: 18,
      bold: true,
      color: ESPRESSO,
      margin: 0,
    });
    s.addText(it.d, {
      x: x + 0.35,
      y: 2.62,
      w: cw - 0.7,
      h: 0.85,
      fontFace: BODY,
      fontSize: 12.5,
      color: MUTED,
      lineSpacingMultiple: 1.2,
      margin: 0,
    });
    s.addText(it.x, {
      x: x + 0.35,
      y: 3.5,
      w: cw - 0.7,
      h: 0.3,
      fontFace: BODY,
      fontSize: 12,
      bold: true,
      color: TERRA,
      margin: 0,
    });
  });

  card(s, M, 4.2, INNER, 1.85, WHITE);
  s.addText("一般性課程的課程大類（擇一對應）", {
    x: M + 0.4,
    y: 4.4,
    w: INNER - 0.8,
    h: 0.32,
    fontFace: HEAD,
    fontSize: 16,
    bold: true,
    color: ESPRESSO,
    margin: 0,
  });
  const cats = [
    "專業技能：生產作業與採購庫存",
    "專業技能：行銷、業務與服務",
    "專業技能：人力資源發展與總務",
    "專業技能：產品研發、設計、創新與科技",
    "專業技能：財務、會計與稅務",
    "專業技能：品質管理與保證",
    "專業技能：資訊技術與軟硬體應用",
    "專業技能：環保、安全及衛生",
    "一般技能：語文、溝通、會議與專案管理",
    "主管管理能力與領導統馭",
    "新進員工訓練｜研發及創新能力",
    "企業內部講師訓練或數位教材製作",
  ];
  cats.forEach((t, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    s.addText("・" + t, {
      x: M + 0.4 + col * 3.75,
      y: 4.78 + row * 0.3,
      w: 3.7,
      h: 0.28,
      fontFace: BODY,
      fontSize: 11.5,
      color: ESPRESSO,
      margin: 0,
    });
  });
  footnote(
    s,
    "課程若對應亞洲矽谷、生技醫療、綠能科技、智慧機械、新農業、循環經濟、AI 人工智慧、資安產業、淨零碳排等政策議題，需於計畫書中標註。",
    6.2
  );
  s.addNotes("這頁是多數企業自己做不出來的地方——課排得出來，但對不到政府的分類。我們把每一門課掛到正確的大類，審查才過得去。");
}

// ── 09 課程規格 ────────────────────────────────────────────
{
  const s = contentSlide(
    "課程規格",
    "排課時必須遵守的規定",
    "人數、時數、梯次的限制會直接影響課綱怎麼切、要開幾梯。"
  );
  const specs = [
    { n: "5–50", u: "人", t: "內部訓練每梯人數", d: "低於 5 人不成班，超過 50 人須分梯。" },
    { n: "8", u: "人", t: "外部訓練每堂課人數上限", d: "外訓班級規模小，適合主管或種子人員。" },
    { n: "2", u: "小時起", t: "一般性課程每梯時數", d: "以整點為單位，不得出現半小時。" },
    { n: "2–8", u: "小時", t: "職能類課程每梯時數", d: "關鍵就業力與共同核心職能課程適用。" },
  ];
  const cw = (INNER - 0.84) / 4;
  specs.forEach((it, i) => {
    const x = M + i * (cw + 0.28);
    card(s, x, 2.1, cw, 2.35, i % 2 === 0 ? SAND : WHITE);
    s.addText([
      { text: it.n, options: { fontSize: 30, bold: true, color: TERRA, fontFace: HEAD } },
      { text: " " + it.u, options: { fontSize: 13, color: MUTED, fontFace: BODY } },
    ], { x: x + 0.3, y: 2.35, w: cw - 0.6, h: 0.62, margin: 0 });
    s.addText(it.t, {
      x: x + 0.3,
      y: 3.05,
      w: cw - 0.6,
      h: 0.62,
      fontFace: BODY,
      fontSize: 14,
      bold: true,
      color: ESPRESSO,
      lineSpacingMultiple: 1.1,
      margin: 0,
    });
    s.addText(it.d, {
      x: x + 0.3,
      y: 3.72,
      w: cw - 0.6,
      h: 0.62,
      fontFace: BODY,
      fontSize: 12,
      color: MUTED,
      lineSpacingMultiple: 1.15,
      margin: 0,
    });
  });

  card(s, M, 4.75, INNER, 1.15, ESPRESSO);
  s.addText("排課時一併確認的欄位", {
    x: M + 0.45,
    y: 4.95,
    w: 3.2,
    h: 0.3,
    fontFace: HEAD,
    fontSize: 15,
    bold: true,
    color: SAGE,
    margin: 0,
  });
  s.addText(
    "訓練類型（內訓／外訓）　｜　總梯次與每梯天數、場次　｜　每梯參訓人數及男女人數　｜　是否為新南向政策課程　｜　是否為工作崗位實作類課程",
    {
      x: M + 0.45,
      y: 5.3,
      w: INNER - 0.9,
      h: 0.45,
      fontFace: BODY,
      fontSize: 12.5,
      color: "E5E0D8",
      lineSpacingMultiple: 1.15,
      margin: 0,
    }
  );
  footnote(s, "工作崗位實作類課程於系統中填選「是」者不予補助，排課時須避開。", 6.1);
  s.addNotes("人數限制常被忽略。外訓一堂課只能報 8 人，如果對方想派 30 個人上同一門課，就得改成內訓或分梯，這會影響整份課綱結構。");
}

// ── 10 年度流程 ────────────────────────────────────────────
{
  const s = contentSlide(
    "執行流程",
    "從申請到撥款的完整流程",
    "五個階段，橫跨提出申請到經費核銷結案。"
  );
  const steps = [
    { t: "提出申請", d: "備齊資格文件\n線上系統登錄送件", w: "9/30 前" },
    { t: "審查核定", d: "分署書面審查\n核定補助額度與課程", w: "分署作業" },
    { t: "開訓報備", d: "學員名冊、課程表\n開訓前完成報備", w: "開訓前" },
    { t: "課程執行", d: "依核定課表授課\n簽到、紀錄、成果留存", w: "訓練期間" },
    { t: "核銷結案", d: "單據編製與送件\n審核後撥付補助款", w: "結訓後" },
  ];
  const cw = (INNER - 0.64) / 5;
  const gap = 0.16;
  steps.forEach((it, i) => {
    const x = M + i * (cw + gap);
    card(s, x, 2.3, cw, 2.55, i % 2 === 0 ? SAND : WHITE);
    numCircle(s, x + cw / 2 - 0.22, 2.58, i + 1, 0.44, i % 2 === 0 ? TERRA : SAGE, WHITE);
    s.addText(it.t, {
      x: x + 0.15,
      y: 3.12,
      w: cw - 0.3,
      h: 0.34,
      align: "center",
      fontFace: HEAD,
      fontSize: 16,
      bold: true,
      color: ESPRESSO,
      margin: 0,
    });
    s.addText(it.d, {
      x: x + 0.15,
      y: 3.5,
      w: cw - 0.3,
      h: 0.8,
      align: "center",
      fontFace: BODY,
      fontSize: 12,
      color: MUTED,
      lineSpacingMultiple: 1.2,
      margin: 0,
    });
    s.addText(it.w, {
      x: x + 0.15,
      y: 4.42,
      w: cw - 0.3,
      h: 0.3,
      align: "center",
      fontFace: BODY,
      fontSize: 11.5,
      bold: true,
      color: TERRA,
      margin: 0,
    });
    if (i < steps.length - 1) {
      s.addShape(pres.ShapeType.line, {
        x: x + cw + 0.02,
        y: 3.55,
        w: gap - 0.04,
        h: 0,
        line: { color: LINE, width: 2 },
      });
    }
  });
  s.addText(
    "訓練費用由企業先行支付，執行完畢並通過核銷審查後撥付補助款；執行期間分署得辦理實地訪視。",
    {
      x: M,
      y: 5.25,
      w: INNER,
      h: 0.45,
      fontFace: BODY,
      fontSize: 13.5,
      color: ESPRESSO,
      margin: 0,
    }
  );
  footnote(s, "各階段之審查、核定與撥款作業時程依分署當年度公告辦理。", 5.85);
  s.addNotes("訪視這件事要提醒：分署會實地來看，看的是簽到、教材、成果。這是最多企業出狀況的環節，我們現場陪同。");
}

// ── 11 PART 02 ─────────────────────────────────────────────
divider(2, "PART 02", "協助規劃範疇", "從資格確認、需求盤點、課綱設計到核銷結案的協助範圍。").addNotes(
  "第二段講我們介入到哪裡。重點是分工那頁——企業要出的東西其實不多。"
);

// ── 12 協助範圍全景 ────────────────────────────────────────
{
  const s = contentSlide(
    "協助範圍",
    "申請前、執行中、結案後",
    "三個階段各自的協助項目，涵蓋文件、課程與行政。"
  );
  const phases = [
    {
      t: "申請前",
      c: TERRA,
      items: [
        "投保人數與資格條件確認",
        "訓練需求訪談與職能盤點",
        "課綱設計與課程大類對應",
        "訓練計畫書撰擬",
        "線上系統登錄與送件協助",
      ],
    },
    {
      t: "執行中",
      c: SAGE,
      items: [
        "開訓報備文件與學員名冊",
        "講師安排與教材講義製作",
        "授課執行與現場設備配置",
        "簽到表與課堂紀錄管理",
        "實地訪視文件預檢與陪同",
      ],
    },
    {
      t: "結案後",
      c: ESPRESSO,
      items: [
        "核銷單據編製與檢核",
        "學員滿意度調查與彙整",
        "訓練成果報告製作",
        "成果影音與素材整理歸檔",
        "次年度訓練方向建議",
      ],
    },
  ];
  threeCards(s, 0, 0, phases, (it, i, x, cw) => {
    const dark = i === 2;
    card(s, x, 2.0, cw, 3.75, dark ? ESPRESSO : i === 0 ? SAND : WHITE);
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 0.35,
      y: 2.28,
      w: 0.42,
      h: 0.42,
      fill: { color: dark ? TERRA : it.c },
      line: { color: dark ? TERRA : it.c, width: 1 },
    });
    s.addText(String(i + 1), {
      x: x + 0.35,
      y: 2.28,
      w: 0.42,
      h: 0.42,
      align: "center",
      valign: "middle",
      fontFace: BODY,
      fontSize: 13,
      bold: true,
      color: WHITE,
      margin: 0,
    });
    s.addText(it.t, {
      x: x + 0.87,
      y: 2.28,
      w: cw - 1.2,
      h: 0.42,
      valign: "middle",
      fontFace: HEAD,
      fontSize: 21,
      bold: true,
      color: dark ? WHITE : ESPRESSO,
      margin: 0,
    });
    bullets(s, it.items, {
      x: x + 0.35,
      y: 2.9,
      w: cw - 0.7,
      h: 2.65,
      fontSize: 13,
      color: dark ? "E5E0D8" : ESPRESSO,
      paraSpaceAfter: 9,
    });
  });
  footnote(s, "以上為訓練計畫本身的協助範圍；行銷代理服務另見「服務內容」章節。", 6.0);
  s.addNotes("這頁講完，對方大概就知道自己要出什麼——人、資料、用印。其他都在我們這邊。");
}

// ── 13 需求盤點與課程對應 ──────────────────────────────────
{
  const s = contentSlide(
    "規劃方法",
    "訓練需求怎麼變成課綱",
    "四個步驟，把部門的實際問題對應到可申請、可驗收的課程。"
  );
  const steps = [
    {
      t: "部門訪談",
      d: "逐部門盤點現行工作流程、人力配置與待補能力，記錄具體場景而非抽象需求。",
    },
    {
      t: "能力缺口彙整",
      d: "將訪談結果整理為能力缺口清單，區分「立即可用」與「長期養成」兩類。",
    },
    {
      t: "課程對應",
      d: "每項缺口對應到課程名稱、課程種類、課程大類與時數，形成可送審的課表。",
    },
    {
      t: "績效指標設定",
      d: "為每門課設定可驗收的產出與指標，供訪視與結案報告使用。",
    },
  ];
  const cw = (INNER - 0.84) / 4;
  steps.forEach((it, i) => {
    const x = M + i * (cw + 0.28);
    card(s, x, 2.15, cw, 2.7, i % 2 === 0 ? SAND : WHITE);
    numCircle(s, x + 0.32, 2.45, i + 1, 0.42, i % 2 === 0 ? TERRA : SAGE, WHITE);
    s.addText(it.t, {
      x: x + 0.32,
      y: 3.0,
      w: cw - 0.64,
      h: 0.4,
      fontFace: HEAD,
      fontSize: 18,
      bold: true,
      color: ESPRESSO,
      margin: 0,
    });
    s.addText(it.d, {
      x: x + 0.32,
      y: 3.45,
      w: cw - 0.64,
      h: 1.25,
      fontFace: BODY,
      fontSize: 12.5,
      color: MUTED,
      lineSpacingMultiple: 1.25,
      margin: 0,
    });
    if (i < steps.length - 1) {
      s.addShape(pres.ShapeType.line, {
        x: x + cw + 0.04,
        y: 3.5,
        w: 0.2,
        h: 0,
        line: { color: LINE, width: 2 },
      });
    }
  });
  card(s, M, 5.15, INNER, 0.95, ESPRESSO);
  s.addText(
    "審查看的是「訓練需求分析 → 課程設計 → 績效指標」的完整邏輯，一份課程清單並不構成訓練計畫書。",
    {
      x: M + 0.45,
      y: 5.15,
      w: INNER - 0.9,
      h: 0.95,
      valign: "middle",
      fontFace: HEAD,
      fontSize: 17,
      bold: true,
      color: WHITE,
      margin: 0,
    }
  );
  s.addNotes("部門訪談通常一個上午跑完 3–4 個部門。訪談紀錄本身就是計畫書的素材，這是我們寫得快的原因。");
}

// ── 14 課綱四段式路徑 ──────────────────────────────────────
{
  const s = contentSlide(
    "課綱設計",
    "數位行銷類課程的能力養成路徑",
    "課程順序決定學員能不能在結訓時交出實際產出。"
  );
  const flow = [
    { t: "拍攝", d: "手機商品拍攝、自媒體影音拍攝\n光線、構圖與器材操作", h: "16–24 小時" },
    { t: "後製", d: "剪輯實作、字幕與封面\n影音腳本規劃與應用", h: "16–24 小時" },
    { t: "社群與廣告", d: "社群操作實務、廣告投放實務\n電商行銷與銷售頁製作", h: "16–24 小時" },
    { t: "數據與管理", d: "Google Analytics 數據分析\n目標、績效管理與 KPI 設定", h: "16–24 小時" },
  ];
  const cw = (INNER - 0.84) / 4;
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
      h: 0.95,
      fontFace: BODY,
      fontSize: 12.5,
      color: MUTED,
      lineSpacingMultiple: 1.2,
      margin: 0,
    });
    s.addText(it.h, {
      x: x + 0.32,
      y: 4.42,
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
    "四個階段可依部門分班進行，也可拆為多梯次跨月執行。實際時數與課程組合依需求盤點結果調整。",
    {
      x: M,
      y: 5.2,
      w: INNER,
      h: 0.45,
      fontFace: BODY,
      fontSize: 13.5,
      color: ESPRESSO,
      margin: 0,
    }
  );
  footnote(s, "課程費用不含廣告投放預算；可視企業檔期協助設定廣告平台與投放操作。", 5.8);
  s.addNotes("順序不能換。先拍才有素材，有素材才有得投，有投才有數據。這個邏輯講清楚，課綱就站得住腳。");
}

// ── 15 分工與作業時程 ──────────────────────────────────────
{
  const s = contentSlide(
    "分工",
    "各階段的工作分配與作業時程",
    "企業需要投入的部分集中在人員派訓、資料提供與文件用印。"
  );
  table(
    s,
    ["工作項目", "知育行銷", "貴公司", "作業時程"],
    [
      ["資格確認與補助試算", "主辦｜文件檢核與試算", "提供｜投保人數、年齡分布", "收件後 3 個工作天"],
      ["訓練需求訪談", "主辦｜訪談設計與彙整", "受訪｜各部門主管出席", "半日至一日"],
      ["課綱與計畫書撰擬", "主辦｜全份撰擬", "提供｜人事資料與訓練紀錄", "訪談後 5 個工作天"],
      ["線上系統送件", "協辦｜代填與檢核", "提供｜系統帳號與用印", "送件期限前"],
      ["開訓報備", "主辦｜名冊與課表製作", "確認｜派訓名單", "開訓前 14 個工作天"],
      ["課程執行", "主辦｜講師、教材、設備", "提供｜教室與網路", "依核定課表"],
      ["簽到與課堂紀錄", "主辦｜表單製作與掃描回傳", "執行｜點名與補簽", "每堂課後 3 個工作天"],
      ["實地訪視", "協辦｜文件預檢與現場陪同", "出席｜負責人或訓練主管", "訪視前 5 個工作天"],
      ["核銷結案", "主辦｜單據編製與送件", "提供｜用印與付款憑證", "結訓後 15 個工作天"],
    ],
    [3.3, 3.1, 3.0, 2.5],
    2.0,
    0.44,
    12
  );
  footnote(s, "作業時程為知育行銷之內部作業承諾，得列入合約附件；分署端審查與撥款時程不在此範圍。", 6.5);
  s.addNotes("這張表可以直接當合約附件。同業很少把天數寫死，這是我們的差異，但講的時候不用強調，讓表自己說話。");
}

// ── 16 PART 03 ─────────────────────────────────────────────
divider(3, "PART 03", "服務內容", "四大模組、課程執行方式、交付物與課程規模。").addNotes(
  "第三段講具體做什麼。如果對方時間有限，這段可以只講模組和交付物兩頁。"
);

// ── 17 四大服務模組 ────────────────────────────────────────
{
  const s = contentSlide(
    "服務模組",
    "四大服務模組",
    "涵蓋內容規劃、社群經營、廣告投放與影音製作，可單獨執行或組合搭配。"
  );
  const mods = [
    {
      t: "內容策略與腳本",
      items: [
        "品牌定位與受眾輪廓盤點",
        "月度主題軸線與內容行事曆",
        "短影音口播腳本、輪播貼文腳本",
        "文案發想與企劃撰寫",
      ],
    },
    {
      t: "社群經營與發文",
      items: [
        "帳號健檢與版面重整",
        "發文排程與跨平台同步",
        "留言與私訊回覆規範",
        "素材庫建置與命名規則",
      ],
    },
    {
      t: "廣告投放與數據",
      items: [
        "廣告帳號結構與追蹤碼設定",
        "受眾測試與素材輪替",
        "曝光、點擊率、單次成本、轉換率、ROAS 追蹤",
        "Google Analytics 報表與轉換監控",
      ],
    },
    {
      t: "影音拍攝與製作",
      items: [
        "商品、形象與人物專訪拍攝",
        "剪輯後製、字幕與封面設計",
        "內部培訓影片與宣導片製作",
        "多平台尺寸輸出",
      ],
    },
  ];
  const cw = (INNER - 0.84) / 4;
  mods.forEach((m, i) => {
    const x = M + i * (cw + 0.28);
    card(s, x, 2.0, cw, 3.85, i % 2 === 0 ? SAND : WHITE);
    numCircle(s, x + 0.32, 2.28, i + 1, 0.42, i % 2 === 0 ? TERRA : SAGE, WHITE);
    s.addText(m.t, {
      x: x + 0.32,
      y: 2.82,
      w: cw - 0.64,
      h: 0.72,
      fontFace: HEAD,
      fontSize: 18,
      bold: true,
      color: ESPRESSO,
      lineSpacingMultiple: 1.05,
      margin: 0,
    });
    bullets(s, m.items, {
      x: x + 0.32,
      y: 3.6,
      w: cw - 0.64,
      h: 2.1,
      fontSize: 12,
      paraSpaceAfter: 8,
    });
  });
  footnote(s, "訓練費用補助僅適用於課程輔導部分；代營運、代操與商業拍攝屬另行報價之服務項目。", 6.1);
  s.addNotes("四個模組可以拆開賣。多數客戶從影音進來，做出成果之後才會加社群和廣告。");
}

// ── 18 課程執行方式 ────────────────────────────────────────
{
  const s = contentSlide(
    "執行方式",
    "課程怎麼上",
    "學科講授搭配術科實作，課堂上直接產出可用的成品。"
  );
  card(s, M, 2.0, 5.8, 3.9, SAND);
  s.addText("現場配置", {
    x: M + 0.4,
    y: 2.22,
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
      "講師一名、助教一名同時在場",
      "提供手機穩定器、基本燈具與光板",
      "學員以自有手機實作，降低設備門檻",
      "分組進行，每組完成一件作品",
      "課後提供剪輯軟體操作說明與範本",
    ],
    { x: M + 0.4, y: 2.72, w: 5.0, h: 2.9, fontSize: 13.5, paraSpaceAfter: 10 }
  );

  card(s, M + 6.1, 2.0, 5.8, 3.9, WHITE);
  s.addText("SDE 當日剪輯", {
    x: M + 6.5,
    y: 2.22,
    w: 5.0,
    h: 0.38,
    fontFace: HEAD,
    fontSize: 19,
    bold: true,
    color: ESPRESSO,
    margin: 0,
  });
  s.addText(
    "Same Day Edit，指在課程進行的同一天內完成拍攝、剪輯與上架的作業方式。",
    {
      x: M + 6.5,
      y: 2.68,
      w: 5.0,
      h: 0.6,
      fontFace: BODY,
      fontSize: 13,
      color: MUTED,
      lineSpacingMultiple: 1.2,
      margin: 0,
    }
  );
  const sde = ["腳本", "素材拍攝", "後製剪輯", "上架發布"];
  sde.forEach((t, i) => {
    const y = 3.42 + i * 0.55;
    numCircle(s, M + 6.5, y, i + 1, 0.36, i === 3 ? TERRA : SAGE, WHITE);
    s.addText(t, {
      x: M + 7.0,
      y: y - 0.03,
      w: 4.4,
      h: 0.42,
      valign: "middle",
      fontFace: BODY,
      fontSize: 14,
      bold: true,
      color: ESPRESSO,
      margin: 0,
    });
  });
  s.addText("課程結束當天即完成發布，成果可直接作為訪視佐證與行銷素材。", {
    x: M + 6.5,
    y: 5.35,
    w: 5.0,
    h: 0.45,
    fontFace: BODY,
    fontSize: 12,
    italic: true,
    color: MUTED,
    lineSpacingMultiple: 1.15,
    margin: 0,
  });
  s.addNotes("SDE 是最有說服力的一段。課上完，影片當天就發出去了——訪視要看成果，這就是成果。");
}

// ── 19 交付物 ──────────────────────────────────────────────
{
  const s = contentSlide(
    "交付物",
    "各階段交付的文件與成果",
    "所有交付物同步存放於共享雲端資料夾，可隨時查閱最新版本。"
  );
  table(
    s,
    ["階段", "交付物", "用途"],
    [
      ["資格確認", "資格檢核表、補助試算表", "確認訓練類型與預估規模"],
      ["計畫送件", "訓練計畫書、課綱、講師資格文件", "分署審查依據"],
      ["開訓", "學員名冊、課程表、教材與講義", "開訓報備與課堂使用"],
      ["課程執行", "簽到表、課堂紀錄、課程成果影音", "訪視佐證與成果留存"],
      ["實地訪視", "文件預檢清單、應答重點整理", "訪視當日使用"],
      ["核銷結案", "核銷單據包、滿意度調查、成果報告", "請領補助款與次年度參考"],
    ],
    [2.2, 5.6, 4.1],
    2.05,
    0.58,
    13
  );
  footnote(
    s,
    "課程成果影音之著作財產權歸屬企業，知育行銷保留作品集展示權；如需完全排除展示，可於合約中約定。",
    6.05
  );
  s.addNotes("著作權那行要主動講。多數企業沒想到這件事，先講反而顯得專業。");
}

// ── 20 課程規模參考 ────────────────────────────────────────
{
  const s = contentSlide(
    "規模參考",
    "常見的三種課程規模",
    "以下為過往企業採用的規模區間，實際課綱與報價依需求盤點結果提供。"
  );
  const plans = [
    {
      t: "入門規模",
      h: "20–48 小時",
      f: ["聚焦單一能力面向", "單一部門、一至二梯次", "適合首次申請、建立辦訓紀錄"],
      out: "短影音成品 10–15 支、基礎課程講義",
    },
    {
      t: "標準規模",
      h: "100–200 小時",
      f: ["四段式路徑完整涵蓋", "跨部門、多梯次分班", "含內訓與外訓混合編排"],
      out: "短影音 30 支以上、廣告帳號重建、成效報告",
    },
    {
      t: "完整規模",
      h: "300–480 小時",
      f: ["涵蓋行銷、管理與職能課程", "多廠區或多部門同步進行", "可搭配聯合型申請"],
      out: "完整內容系統、內訓影音庫、年度成果報告",
    },
  ];
  threeCards(s, 0, 0, plans, (p, i, x, cw) => {
    const hi = i === 2;
    card(s, x, 2.0, cw, 3.65, hi ? ESPRESSO : WHITE);
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
      h: 0.5,
      fontFace: HEAD,
      fontSize: 25,
      bold: true,
      color: hi ? SAGE : TERRA,
      margin: 0,
    });
    bullets(s, p.f, {
      x: x + 0.35,
      y: 3.32,
      w: cw - 0.7,
      h: 1.35,
      fontSize: 12.5,
      color: hi ? "E5E0D8" : ESPRESSO,
    });
    s.addShape(pres.ShapeType.line, {
      x: x + 0.35,
      y: 4.8,
      w: cw - 0.7,
      h: 0,
      line: { color: hi ? "5A534C" : LINE, width: 1 },
    });
    s.addText([
      { text: "預期產出　", options: { bold: true, color: hi ? SAGE : TERRA } },
      { text: p.out, options: { color: hi ? "E5E0D8" : MUTED } },
    ], {
      x: x + 0.35,
      y: 4.93,
      w: cw - 0.7,
      h: 0.6,
      fontFace: BODY,
      fontSize: 12,
      lineSpacingMultiple: 1.15,
      margin: 0,
    });
  });
  footnote(
    s,
    "課程費用之 50%–70% 由計畫補助支應，企業實付金額於課綱確認後提供試算表。所有金額均為未稅價。",
    5.85
  );
  s.addNotes("不要在這頁報死價。給規模、給產出，讓對方自己對號入座，數字留到下一次會議。");
}

// ── 21 PART 04 ─────────────────────────────────────────────
divider(4, "PART 04", "企業輔導實例", "實際規劃過的課程結構、主題分布與合作企業。").addNotes(
  "第四段是最有說服力的一段。信功那份 480 小時的課表可以直接攤開給對方看。"
);

// ── 22 信功肉品 480 小時 ───────────────────────────────────
{
  const s = contentSlide(
    "輔導實例",
    "信功肉品｜480 小時課程規劃",
    "食品加工業，跨部門訓練規劃，24 門課程、480 小時，涵蓋行銷、影音、數據與管理職能。"
  );
  const stats = [
    { n: "24", u: "門課程", d: "12 門 16 小時、12 門 24 小時" },
    { n: "480", u: "小時", d: "全年度訓練總時數" },
    { n: "5", u: "大能力面向", d: "影音、社群廣告、數據、管理、內訓" },
  ];
  const scw = (INNER - 0.56) / 3;
  stats.forEach((it, i) => {
    const x = M + i * (scw + 0.28);
    card(s, x, 1.95, scw, 1.15, i === 1 ? ESPRESSO : SAND);
    const dark = i === 1;
    s.addText([
      { text: it.n, options: { fontSize: 30, bold: true, color: dark ? WHITE : TERRA, fontFace: HEAD } },
      { text: " " + it.u, options: { fontSize: 13, color: dark ? "C9C1B8" : MUTED, fontFace: BODY } },
    ], { x: x + 0.35, y: 2.1, w: scw - 0.7, h: 0.55, margin: 0 });
    s.addText(it.d, {
      x: x + 0.35,
      y: 2.66,
      w: scw - 0.7,
      h: 0.32,
      fontFace: BODY,
      fontSize: 11.5,
      color: dark ? "C9C1B8" : MUTED,
      margin: 0,
    });
  });

  s.addText("課程表節選", {
    x: M,
    y: 3.3,
    w: 4,
    h: 0.32,
    fontFace: HEAD,
    fontSize: 16,
    bold: true,
    color: ESPRESSO,
    margin: 0,
  });
  const courses = [
    ["社群操作實務操作", "24 h"],
    ["電商行銷、銷售頁製作訓練", "24 h"],
    ["手機商品拍攝訓練（靜態拍攝）", "24 h"],
    ["影音腳本規劃應用實作", "24 h"],
    ["Google Analytics 數據分析及認證", "24 h"],
    ["內部培訓影片輔導製作", "24 h"],
    ["廣告投放實務", "16 h"],
    ["高流量社群影音製作與 AI 生成應用", "16 h"],
    ["品牌行銷力實戰攻略", "16 h"],
    ["AI 藝術文案：品牌故事書寫", "16 h"],
    ["掌握顧客心理網路銷售模式", "16 h"],
    ["文案發想、企劃撰寫與簡報技巧", "24 h"],
  ];
  courses.forEach((c, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = M + col * (scw + 0.28);
    const y = 3.72 + row * 0.58;
    card(s, x, y, scw, 0.48, row % 2 === 0 ? WHITE : SAND);
    s.addText(c[0], {
      x: x + 0.22,
      y: y,
      w: scw - 1.0,
      h: 0.48,
      valign: "middle",
      fontFace: BODY,
      fontSize: 11.5,
      color: ESPRESSO,
      margin: 0,
    });
    s.addText(c[1], {
      x: x + scw - 0.78,
      y: y,
      w: 0.6,
      h: 0.48,
      align: "right",
      valign: "middle",
      fontFace: BODY,
      fontSize: 11.5,
      bold: true,
      color: TERRA,
      margin: 0,
    });
  });
  footnote(s, "以上為 24 門課程中之 12 門節選；完整課程表可於會議中提供。", 6.15);
  s.addNotes("這頁是重點。480 小時不是空話，課表是真的送出去也核銷完的。對方問細節就翻完整課表給他看。");
}

// ── 23 課程主題時數分布 ────────────────────────────────────
{
  const s = contentSlide(
    "課程結構",
    "480 小時的主題時數分布",
    "以能力面向重新歸類後的時數配置，可作為規劃自身課綱時的比例參考。"
  );
  s.addChart(
    pres.ChartType.bar,
    [
      {
        name: "訓練時數",
        labels: [
          "影音拍攝與製作",
          "管理與職能發展",
          "社群與廣告行銷",
          "數據與 AI 應用",
          "內訓平台與文書",
        ],
        values: [128, 128, 112, 56, 56],
      },
    ],
    {
      x: M,
      y: 2.0,
      w: 7.6,
      h: 3.9,
      barDir: "bar",
      barGapWidthPct: 60,
      chartColors: [TERRA],
      showLegend: false,
      showTitle: false,
      showValue: true,
      dataLabelPosition: "outEnd",
      dataLabelFormatCode: '0" 小時"',
      dataLabelColor: ESPRESSO,
      dataLabelFontFace: BODY,
      dataLabelFontSize: 12,
      dataLabelFontBold: true,
      valAxisMaxVal: 160,
      valAxisHidden: true,
      catAxisLabelColor: ESPRESSO,
      catAxisLabelFontFace: BODY,
      catAxisLabelFontSize: 12.5,
      catGridLine: { style: "none" },
      valGridLine: { style: "none" },
    }
  );
  card(s, M + 8.0, 2.0, 3.9, 3.9, SAND);
  s.addText("配置邏輯", {
    x: M + 8.35,
    y: 2.25,
    w: 3.2,
    h: 0.35,
    fontFace: HEAD,
    fontSize: 18,
    bold: true,
    color: TERRA,
    margin: 0,
  });
  bullets(
    s,
    [
      "影音與社群廣告合計 240 小時，佔一半，對應實際行銷產出需求",
      "管理與職能發展 128 小時，涵蓋 KPI 設定、人才發展與外包管理",
      "數據與 AI 應用 56 小時，作為前述課程的驗收與延伸",
      "內訓平台與文書 56 小時，把訓練成果留在企業內部",
    ],
    { x: M + 8.35, y: 2.72, w: 3.2, h: 2.95, fontSize: 12, paraSpaceAfter: 10 }
  );
  s.addNotes("這個比例可以直接借給對方參考。多數企業一開始都想把時數全押在行銷，管理職能課其實是分署喜歡看到的。");
}

// ── 24 其他輔導企業 ────────────────────────────────────────
{
  const s = contentSlide(
    "合作企業",
    "其他輔導與服務企業",
    "跨食品製造、農產、餐飲、旅宿、教育與服務業，涵蓋計畫申請、課程執行與行銷代理。"
  );
  card(s, M, 2.0, 5.8, 3.3, SAND);
  s.addText("計畫申請與課程執行", {
    x: M + 0.4,
    y: 2.22,
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
      "臺南蛋品｜計畫申請文件與課程執行",
      "義盟興眼鏡｜輔導專案與數位轉型",
      "如記食品｜訓練課程與品牌內容輔導",
      "萬科｜課程執行與訪視文件管理",
    ],
    { x: M + 0.4, y: 2.72, w: 5.0, h: 2.4, fontSize: 13, paraSpaceAfter: 9 }
  );

  card(s, M + 6.1, 2.0, 5.8, 3.3, WHITE);
  s.addText("行銷代理與內容服務", {
    x: M + 6.5,
    y: 2.22,
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
      "弋果美語｜廣告投放代操",
      "高雄萬豪酒店｜社群與影音內容",
      "白鴿婚禮顧問｜品牌行銷策劃",
      "藝隆農產、香蕉策略聯盟｜農產品牌內容",
      "奧比餐飲集團｜數位轉型輔導",
    ],
    { x: M + 6.5, y: 2.72, w: 5.0, h: 2.4, fontSize: 13, paraSpaceAfter: 9 }
  );

  const inds = ["食品製造", "農產運銷", "餐飲服務", "旅宿觀光", "教育產業", "婚禮服務"];
  const iw = (INNER - 0.6) / 6;
  inds.forEach((t, i) => {
    const x = M + i * (iw + 0.12);
    s.addShape(pres.ShapeType.roundRect, {
      x,
      y: 5.6,
      w: iw,
      h: 0.55,
      rectRadius: 0.1,
      fill: { color: ESPRESSO },
      line: { color: ESPRESSO, width: 1 },
    });
    s.addText(t, {
      x,
      y: 5.6,
      w: iw,
      h: 0.55,
      align: "center",
      valign: "middle",
      fontFace: BODY,
      fontSize: 12.5,
      bold: true,
      color: WHITE,
      margin: 0,
    });
  });
  footnote(s, "完整作品集與各案例之課程表、成果報告可依貴公司產業提供對應資料。", 6.4);
  s.addNotes("依對方產業挑兩家深講就好。食品業講信功和如記，餐飲業講奧比，旅宿講萬豪。其他帶過。");
}

// ── 25 聯絡 ────────────────────────────────────────────────
{
  const s = darkSlide();
  s.addText("CONTACT", {
    x: M,
    y: 1.55,
    w: 8,
    h: 0.3,
    fontFace: BODY,
    fontSize: 12,
    bold: true,
    color: SAGE,
    charSpacing: 2,
    margin: 0,
  });
  s.addText("後續聯繫", {
    x: M,
    y: 1.9,
    w: 9,
    h: 0.8,
    fontFace: HEAD,
    fontSize: 38,
    bold: true,
    color: WHITE,
    margin: 0,
  });
  s.addText(
    "如需進一步評估，可提供最近一期投保人數證明與員工年齡分布，我方將於 3 個工作天內回覆資格確認與補助試算。",
    {
      x: M,
      y: 2.85,
      w: 9.5,
      h: 0.75,
      fontFace: BODY,
      fontSize: 15,
      color: "C9C1B8",
      lineSpacingMultiple: 1.3,
      margin: 0,
    }
  );
  s.addShape(pres.ShapeType.roundRect, {
    x: M,
    y: 4.0,
    w: 5.8,
    h: 1.85,
    rectRadius: 0.08,
    fill: { color: "3A352F" },
    line: { color: "4A443D", width: 1 },
  });
  s.addText("黃皇賓　BEN HUANG", {
    x: M + 0.45,
    y: 4.25,
    w: 5.0,
    h: 0.4,
    fontFace: HEAD,
    fontSize: 21,
    bold: true,
    color: WHITE,
    margin: 0,
  });
  s.addText("執行長　知育行銷有限公司", {
    x: M + 0.45,
    y: 4.68,
    w: 5.0,
    h: 0.32,
    fontFace: BODY,
    fontSize: 13,
    color: SAGE,
    margin: 0,
  });
  s.addText("電話　0983-339-790\nEmail　zhiyumkt@gmail.com", {
    x: M + 0.45,
    y: 5.05,
    w: 5.0,
    h: 0.7,
    fontFace: BODY,
    fontSize: 13,
    color: "C9C1B8",
    lineSpacingMultiple: 1.3,
    margin: 0,
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: M + 6.1,
    y: 4.0,
    w: 5.8,
    h: 1.85,
    rectRadius: 0.08,
    fill: { color: "3A352F" },
    line: { color: "4A443D", width: 1 },
  });
  s.addText("服務區域", {
    x: M + 6.55,
    y: 4.25,
    w: 5.0,
    h: 0.35,
    fontFace: HEAD,
    fontSize: 17,
    bold: true,
    color: WHITE,
    margin: 0,
  });
  s.addText(
    "高雄、屏東、台南為主，可到廠授課與拍攝。\n團隊四人編制：策略與授課、拍攝剪輯、平面企劃、行政核銷。",
    {
      x: M + 6.55,
      y: 4.68,
      w: 5.0,
      h: 1.0,
      fontFace: BODY,
      fontSize: 13,
      color: "C9C1B8",
      lineSpacingMultiple: 1.3,
      margin: 0,
    }
  );
  pageTag(s);
  s.addNotes("收尾只要一件事：請他回去調投保人數和年齡分布。有了這兩份資料，下次見面就能給具體數字。");
}

pres.writeFile({ fileName: "知育行銷_大人提_計劃說明與服務內容.pptx" }).then((f) => {
  console.log("已產出：" + f + "（共 " + (pageNo + 1) + " 頁）");
});
