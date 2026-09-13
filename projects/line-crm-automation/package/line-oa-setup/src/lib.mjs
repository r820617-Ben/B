import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** 讀 .env，沒有就靠 process.env。刻意不加依賴。 */
export function loadEnv() {
  const p = join(ROOT, ".env");
  if (existsSync(p)) {
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      if (!(k in process.env)) process.env[k] = v;
    }
  }
  return process.env;
}

export function readJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
}

export function token() {
  const t = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!t) {
    console.error("缺少 LINE_CHANNEL_ACCESS_TOKEN。");
    console.error("到 LINE Developers Console → 你的 Messaging API channel → Channel access token 發一組，");
    console.error("複製 .env.example 成 .env 後填進去。");
    process.exit(1);
  }
  return t;
}

const API = "https://api.line.me";
const API_DATA = "https://api-data.line.me";

/** LINE Messaging API 呼叫。失敗時把 LINE 回的錯誤原文印出來，不要吞掉。 */
export async function line(path, { method = "GET", json, body, contentType, data = false } = {}) {
  const url = (data ? API_DATA : API) + path;
  const headers = { Authorization: `Bearer ${token()}` };
  let payload = body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(json);
  } else if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const res = await fetch(url, { method, headers, body: payload });
  const text = await res.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { /* 非 JSON 回應 */ }

  if (!res.ok) {
    const err = new Error(`${method} ${url} → ${res.status}`);
    err.status = res.status;
    err.detail = parsed ?? text;
    throw err;
  }
  return parsed;
}

export function fail(e) {
  console.error("\n失敗：" + e.message);
  if (e.detail) console.error(JSON.stringify(e.detail, null, 2));
  if (e.status === 401) console.error("\nToken 無效或已撤銷，重新發一組。");
  if (e.status === 403) console.error("\n這組 token 沒有這個 channel 的權限，確認是不是選錯 channel。");
  process.exit(1);
}
