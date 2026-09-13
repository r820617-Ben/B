/** 把 27 則自動回應輸出成純文字，給不想開終端機的人參照。 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { readJson, ROOT } from "./lib.mjs";

const replies = readJson("data/auto-replies.json");
const greeting = readJson("data/greeting.json");

const lines = ["知育行銷 LINE 官方帳號設定內容", "產生時間　" + new Date().toISOString().slice(0, 10), ""];

lines.push("=".repeat(64), "加入好友的歡迎訊息", "=".repeat(64), "");
for (const g of greeting) {
  lines.push("【" + g.title + "】", "", g.message, "", "-".repeat(64), "");
}

lines.push("", "=".repeat(64), "自動回應訊息　" + replies.length + " 則", "=".repeat(64), "");
let group = null;
for (const r of replies) {
  if (r.group && r.group !== group) { group = r.group; lines.push("", "### " + group, ""); }
  lines.push(
    "[" + String(r.order).padStart(2, "0") + "] " + r.title,
    "關鍵字：" + r.keywords.join("、") + "（比對方式：完全一致）",
    "",
    r.message,
    "",
    "-".repeat(64),
    ""
  );
}

const out = join(ROOT, "output/line-setup-content.txt");
writeFileSync(out, lines.join("\n"));
console.log("已輸出　" + out);
console.log(replies.length + " 則自動回應，" + greeting.length + " 則歡迎訊息。");
