/**
 * Builds en→fa string map using MyMemory (free tier). Run with network.
 * Preserves ICU-like `{name}` placeholders.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const outPath = path.join(__dirname, "fa-en-to-fa-map.json");
const uniquePath = path.join(__dirname, "en-unique-strings.json");

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

const strings = JSON.parse(fs.readFileSync(uniquePath, "utf8"));
const map = {};
let done = 0;

for (const en of strings) {
  try {
    map[en] = await translateOne(en);
    done++;
    if (done % 25 === 0) console.error(`… ${done}/${strings.length}`);
    await sleep(120);
  } catch (e) {
    console.error("FAIL:", en.slice(0, 60), e.message);
    map[en] = en;
    await sleep(200);
  }
}

fs.writeFileSync(outPath, JSON.stringify(map, null, 0), "utf8");
console.error("Wrote", outPath, Object.keys(map).length);
