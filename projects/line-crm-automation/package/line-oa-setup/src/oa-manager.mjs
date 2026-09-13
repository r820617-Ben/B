/**
 * LINE Official Account Manager 的瀏覽器自動化。
 *
 * 先講清楚限制：
 *   自動回應訊息、歡迎訊息、基本檔案、聊天標籤、問卷調查，LINE 都沒有開 API，
 *   只能操作後台網頁。後台是會改版的第三方網站，選擇器隨時可能失效，
 *   而且登入可能觸發兩階段驗證。所以這一支不是「跑完就好」，是需要有人看著。
 *
 * 三種模式：
 *   --inspect   開瀏覽器、登入後導到自動回應建立頁，把頁面結構存到 output/，
 *               給你找選擇器用。不做任何修改。
 *   --assist    半自動。逐則把內容放進剪貼簿並印出來，你按 Enter 換下一則。
 *               選擇器全錯也能用，比自己翻文件快很多。建議先用這個。
 *   --auto      全自動。需要先填好 data/selectors.json 並把 _filled 設為 true。
 *
 * 第一次執行會開瀏覽器要你手動登入 LINE，登入狀態會存在 BROWSER_PROFILE_DIR，
 * 之後不用再登。那個資料夾等同於你的登入憑證，不要提交到 git，不要外流。
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { loadEnv, readJson, ROOT } from "./lib.mjs";

loadEnv();

const args = new Set(process.argv.slice(2));
const MODE = args.has("--auto") ? "auto" : args.has("--inspect") ? "inspect" : "assist";

const OA_ID = process.env.LINE_OA_BASIC_ID || "@520vqabi";
const PROFILE = process.env.BROWSER_PROFILE_DIR || join(ROOT, ".browser-profile");
const replies = readJson("data/auto-replies.json");
const selectors = readJson("data/selectors.json");
const listUrl = selectors.autoReply.listUrl.replace("{OA_ID}", OA_ID);

mkdirSync(join(ROOT, "output"), { recursive: true });

/** 把文字放進系統剪貼簿。失敗不致命，只是少一個便利。 */
function copy(text) {
  const tries = [
    ["pbcopy", []],
    ["xclip", ["-selection", "clipboard"]],
    ["xsel", ["--clipboard", "--input"]],
    ["clip", []],
  ];
  for (const [cmd, a] of tries) {
    try { execFileSync(cmd, a, { input: text }); return true; } catch { /* 換下一個 */ }
  }
  return false;
}

let chromium;
try { ({ chromium } = await import("playwright")); }
catch {
  console.error("需要 playwright。先執行：");
  console.error("  npm install playwright && npx playwright install chromium");
  process.exit(1);
}

console.log("模式　" + MODE);
console.log("帳號　" + OA_ID);
console.log("設定檔目錄　" + PROFILE);
console.log("");

const ctx = await chromium.launchPersistentContext(PROFILE, {
  headless: false,
  viewport: { width: 1440, height: 900 },
  locale: "zh-TW",
});
const page = ctx.pages()[0] ?? await ctx.newPage();

await page.goto(listUrl, { waitUntil: "domcontentloaded" });

const rl = createInterface({ input: process.stdin, output: process.stdout });

if (page.url().includes("access.line.me") || page.url().includes("login")) {
  console.log("需要登入。請在開啟的瀏覽器視窗完成登入與兩階段驗證。");
  await rl.question("登入完成後回到這裡按 Enter：");
  await page.goto(listUrl, { waitUntil: "domcontentloaded" });
}

if (MODE === "inspect") {
  const html = await page.content();
  writeFileSync(join(ROOT, "output/autoresponse-page.html"), html);
  await page.screenshot({ path: join(ROOT, "output/autoresponse-page.png"), fullPage: true });

  const candidates = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("button,input,textarea,a[role=button]")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      out.push({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute("type"),
        text: (el.innerText || el.value || "").trim().slice(0, 40),
        id: el.id || null,
        cls: (el.className || "").toString().slice(0, 80),
        testid: el.getAttribute("data-testid") || el.getAttribute("data-test") || null,
        aria: el.getAttribute("aria-label") || null,
      });
    }
    return out;
  });
  writeFileSync(join(ROOT, "output/selector-candidates.json"), JSON.stringify(candidates, null, 2));

  console.log("已輸出到 output/：");
  console.log("  autoresponse-page.html     整頁 HTML");
  console.log("  autoresponse-page.png      整頁截圖");
  console.log("  selector-candidates.json   所有可互動元素");
  console.log("\n照著填 data/selectors.json，填完把 _filled 設為 true，再跑 --auto。");
  await rl.close();
  await ctx.close();
  process.exit(0);
}

if (MODE === "auto" && selectors._filled !== true) {
  console.error("data/selectors.json 還沒填。先跑：node src/oa-manager.mjs --inspect");
  await rl.close();
  await ctx.close();
  process.exit(1);
}

const log = [];
let ok = 0, skipped = 0;

for (const r of replies) {
  const head = `[${String(r.order).padStart(2, "0")}/${replies.length}] ${r.title}`;
  const kw = r.keywords.join("、");

  if (MODE === "assist") {
    console.log("\n" + "-".repeat(60));
    console.log(head);
    console.log("關鍵字　" + kw + "　（比對方式選 完全一致）");
    console.log("-".repeat(60));
    console.log(r.message);
    console.log("-".repeat(60));
    const copied = copy(r.message);
    console.log(copied ? "訊息內文已複製到剪貼簿，直接貼上。" : "剪貼簿不可用，請從上面選取複製。");
    const a = await rl.question("貼完按 Enter 繼續，輸入 s 跳過，輸入 q 結束：");
    if (a.trim().toLowerCase() === "q") break;
    if (a.trim().toLowerCase() === "s") { skipped++; log.push({ ...r, result: "skipped" }); continue; }
    ok++; log.push({ id: r.id, title: r.title, result: "done" });
    continue;
  }

  // auto
  try {
    const s = selectors.autoReply;
    await page.goto(listUrl, { waitUntil: "domcontentloaded" });
    await page.click(s.createButton);
    await page.fill(s.titleInput, r.title);
    if (s.keywordToggle) await page.click(s.keywordToggle);
    for (const k of r.keywords) {
      await page.fill(s.keywordInput, k);
      if (s.keywordAddButton) await page.click(s.keywordAddButton);
      else await page.keyboard.press("Enter");
    }
    await page.fill(s.messageTextarea, r.message);
    await page.click(s.saveButton);
    if (s.saveConfirmButton) await page.click(s.saveConfirmButton).catch(() => {});
    if (s.successIndicator) await page.waitForSelector(s.successIndicator, { timeout: 15000 });
    ok++;
    console.log(head + "　建立完成");
    log.push({ id: r.id, title: r.title, result: "done" });
  } catch (e) {
    console.error(head + "　失敗：" + e.message);
    log.push({ id: r.id, title: r.title, result: "failed", error: e.message });
    const a = await rl.question("要繼續嗎？Enter 繼續，q 結束：");
    if (a.trim().toLowerCase() === "q") break;
  }
}

writeFileSync(join(ROOT, "output/oa-manager-log.json"),
  JSON.stringify({ mode: MODE, at: new Date().toISOString(), ok, skipped, log }, null, 2));

console.log("\n完成 " + ok + " 則，跳過 " + skipped + " 則，共 " + replies.length + " 則。");
console.log("紀錄寫入 output/oa-manager-log.json");
console.log("\n瀏覽器保持開著，自己確認一下後台列表。按 Enter 關閉。");
await rl.question("");
await rl.close();
await ctx.close();
