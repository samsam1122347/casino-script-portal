/**
 * Retry MyMemory for map entries where value === source (429 fallbacks).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mapPath = path.join(__dirname, "fa-en-to-fa-map.json");

function protectPlaceholders(s) {
  const pairs = [];
  let i = 0;
  const p = s.replace(/\{[^}]+\}/g, (m) => {
    const tok = `〔PH${i++}〕`;
    pairs.push([tok, m]);
    return tok;
  });
  return { protected: p, pairs };
}

function restorePlaceholders(translated, pairs) {
  let t = translated;
  for (const [tok, orig] of pairs) {
    t = t.split(tok).join(orig);
  }
  return t;
}

async function translateOne(raw) {
  if (raw === "") return "";
  const { protected: p, pairs } = protectPlaceholders(raw);
  const q = encodeURIComponent(p.slice(0, 4500));
  const url = `https://api.mymemory.translated.net/get?q=${q}&langpair=en|fa`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  const out = j?.responseData?.translatedText;
  if (typeof out !== "string") throw new Error(JSON.stringify(j).slice(0, 200));
  return restorePlaceholders(out, pairs);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Keep Latin for brand/tech tokens — skip retry */
const skipRetry = new Set([
  "",
  "404",
  "BUST",
  "CRASH",
  "VIP",
  "VIP-Club",
  "USD",
  "UTC",
  "API",
  "iOS",
  "Android",
  "x",
  "X",
  "GGR",
  "KYC",
  "2FA",
  "FAQ",
  "FAQ & contact",
]);

const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
const keys = Object.keys(map).filter((k) => {
  if (map[k] !== k) return false;
  if (k === "") return false;
  if (skipRetry.has(k)) return false;
  return true;
});

console.error("Retry", keys.length, "strings");

for (const k of keys) {
  try {
    map[k] = await translateOne(k);
    console.error("OK:", k.slice(0, 50));
    await sleep(650);
  } catch (e) {
    console.error("FAIL:", k.slice(0, 55), e.message);
    await sleep(900);
  }
}

fs.writeFileSync(mapPath, JSON.stringify(map, null, 0), "utf8");
console.error("Saved", mapPath);
