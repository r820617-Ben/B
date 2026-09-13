/**
 * 建立圖文選單並設為預設。這一段是 LINE 官方 Messaging API，可靠、可重跑。
 *
 *   node src/richmenu.mjs           建立並設為預設
 *   node src/richmenu.mjs --clean   先刪掉同名的舊選單再建（避免累積）
 *   node src/richmenu.mjs --dry     只印出要送出的內容，不呼叫 API
 *
 * 步驟：
 *   1  POST /v2/bot/richmenu                                  建立選單物件，拿到 richMenuId
 *   2  POST /v2/bot/richmenu/{id}/content  （api-data 網域）   上傳 2500x1686 的圖
 *   3  POST /v2/bot/user/all/richmenu/{id}                    設為所有使用者的預設選單
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadEnv, line, readJson, ROOT, fail } from "./lib.mjs";

loadEnv();

const args = new Set(process.argv.slice(2));
const CLEAN = args.has("--clean");
const DRY = args.has("--dry");

const menu = readJson("data/richmenu.json");
const imagePath = join(ROOT, "assets/richmenu-2500x1686.png");

if (!existsSync(imagePath)) {
  console.error("找不到選單圖片：" + imagePath);
  process.exit(1);
}
const image = readFileSync(imagePath);

/* 送出前先自己驗一次，錯的座標 LINE 會回 400 但訊息很難讀 */
function validate() {
  const problems = [];
  const { width, height } = menu.size;
  if (width !== 2500 || ![1686, 843].includes(height)) {
    problems.push(`size 必須是 2500x1686 或 2500x843，目前 ${width}x${height}`);
  }
  if (!menu.areas?.length || menu.areas.length > 20) {
    problems.push("areas 需要 1 到 20 個，目前 " + (menu.areas?.length ?? 0));
  }
  menu.areas?.forEach((a, i) => {
    const b = a.bounds;
    if (b.x < 0 || b.y < 0 || b.x + b.width > width || b.y + b.height > height) {
      problems.push(`第 ${i + 1} 格超出邊界：x${b.x} y${b.y} w${b.width} h${b.height}`);
    }
  });
  if ((menu.chatBarText ?? "").length > 14) problems.push("chatBarText 最多 14 字");
  if ((menu.name ?? "").length > 300) problems.push("name 最多 300 字");
  if (image.length > 1024 * 1024) {
    problems.push("圖片 " + (image.length / 1024).toFixed(0) + " KB，超過 1 MB 上限");
  }
  return problems;
}

const problems = validate();
if (problems.length) {
  console.error("選單定義有問題，沒有送出：");
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}

console.log("選單　" + menu.name);
console.log("尺寸　" + menu.size.width + " x " + menu.size.height);
console.log("圖片　" + (image.length / 1024).toFixed(1) + " KB");
console.log("分區　" + menu.areas.length + " 格");
for (const a of menu.areas) {
  console.log("  " + String(a.action.label ?? "").padEnd(8) + " → 傳送文字 " + a.action.text);
}

if (DRY) {
  console.log("\n--dry 模式，沒有呼叫 API。");
  process.exit(0);
}

try {
  if (CLEAN) {
    const list = await line("/v2/bot/richmenu/list");
    const dupes = (list.richmenus ?? []).filter(m => m.name === menu.name);
    for (const d of dupes) {
      await line("/v2/bot/richmenu/" + d.richMenuId, { method: "DELETE" });
      console.log("\n已刪除舊選單　" + d.richMenuId);
    }
  }

  console.log("\n1/3　建立選單物件");
  const created = await line("/v2/bot/richmenu", { method: "POST", json: menu });
  const id = created.richMenuId;
  console.log("     richMenuId = " + id);

  console.log("2/3　上傳圖片");
  await line("/v2/bot/richmenu/" + id + "/content", {
    method: "POST", body: image, contentType: "image/png", data: true,
  });
  console.log("     上傳完成");

  console.log("3/3　設為所有使用者的預設選單");
  await line("/v2/bot/user/all/richmenu/" + id, { method: "POST" });
  console.log("     已設為預設");

  writeFileSync(join(ROOT, "output/richmenu-result.json"),
    JSON.stringify({ richMenuId: id, name: menu.name, at: new Date().toISOString() }, null, 2));

  console.log("\n完成。到手機上封鎖再重新加入官方帳號，就會看到新選單。");
  console.log("richMenuId 已寫入 output/richmenu-result.json");
} catch (e) { fail(e); }
