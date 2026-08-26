/**
 * Recursively compares key sets across all locale JSON files.
 * Exit 1 if any locale is missing keys present in `en.json`.
 * Usage: node scripts/check-messages-parity.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, "..", "messages");

function allKeys(obj, prefix = "") {
  /** @type {string[]} */
  const out = [];
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return out;
  for (const k of Object.keys(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    out.push(p);
    out.push(...allKeys(obj[k], p));
  }
  return out;
}

function keySet(json) {
  return new Set(allKeys(json));
}

const locales = ["en", "es", "pt", "de", "fr", "tr", "ru", "ja", "fa"];
const base = JSON.parse(
  fs.readFileSync(path.join(messagesDir, "en.json"), "utf8"),
);
const baseKeys = keySet(base);

let ok = true;
for (const loc of locales) {
  if (loc === "en") continue;
  const data = JSON.parse(
    fs.readFileSync(path.join(messagesDir, `${loc}.json`), "utf8"),
  );
  const ks = keySet(data);
  const missing = [...baseKeys].filter((k) => !ks.has(k));
  const extra = [...ks].filter((k) => !baseKeys.has(k));
  if (missing.length || extra.length) {
    ok = false;
    console.error(`\n[${loc}]`);
    if (missing.length)
      console.error(`  Missing (${missing.length}):`, missing.slice(0, 40).join(", "), missing.length > 40 ? "…" : "");
    if (extra.length)
      console.error(`  Extra (${extra.length}):`, extra.slice(0, 40).join(", "), extra.length > 40 ? "…" : "");
  }
}

if (!ok) {
  console.error("\nMessage key parity check failed.");
  process.exit(1);
}
console.log("OK: all locales contain the same keys as en.json.");
