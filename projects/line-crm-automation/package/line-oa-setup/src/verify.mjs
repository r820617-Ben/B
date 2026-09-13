/**
 * 先跑這一支。確認 token 有效、看得到目前帳號狀態，之後再動任何東西。
 * 這支不會修改任何設定。
 */
import { loadEnv, line, fail } from "./lib.mjs";

loadEnv();

try {
  const info = await line("/v2/bot/info");
  console.log("Token 有效。");
  console.log("  帳號名稱　" + info.displayName);
  console.log("  Basic ID　" + info.basicId);
  console.log("  聊天模式　" + info.chatMode + "（chat 為手動聊天，bot 為機器人）");
  console.log("  標記已讀　" + info.markAsReadMode);

  const quota = await line("/v2/bot/message/quota");
  console.log("\n訊息額度");
  console.log("  類型　" + quota.type + (quota.value != null ? "，上限 " + quota.value : ""));

  try {
    const used = await line("/v2/bot/message/quota/consumption");
    console.log("  本月已用　" + used.totalUsage);
  } catch { console.log("  本月已用　讀取失敗，略過"); }

  const menus = await line("/v2/bot/richmenu/list");
  console.log("\n現有圖文選單：" + (menus.richmenus?.length ?? 0) + " 個");
  for (const m of menus.richmenus ?? []) {
    console.log("  " + m.richMenuId + "  " + m.name + "  " + m.size.width + "x" + m.size.height);
  }

  try {
    const def = await line("/v2/bot/user/all/richmenu");
    console.log("\n目前的預設選單：" + def.richMenuId);
  } catch (e) {
    if (e.status === 404) console.log("\n目前沒有設定預設選單。");
    else throw e;
  }

  console.log("\n檢查完成，沒有修改任何設定。");
} catch (e) { fail(e); }
