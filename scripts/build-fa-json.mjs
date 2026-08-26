/**
 * From messages/en.json + fa-en-to-fa-map.json → messages/fa.json (same shape).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, "..", "messages");

function mapLeaves(node, trans) {
  if (typeof node === "string") {
    return trans[node] ?? node;
  }
  if (Array.isArray(node)) {
    return node.map((x) => mapLeaves(x, trans));
  }
  if (node && typeof node === "object") {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const k of Object.keys(node)) {
      out[k] = mapLeaves(node[k], trans);
    }
    return out;
  }
  return node;
}

const en = JSON.parse(fs.readFileSync(path.join(messagesDir, "en.json"), "utf8"));
const transPath = path.join(__dirname, "fa-en-to-fa-map.json");
const trans = JSON.parse(fs.readFileSync(transPath, "utf8"));
const fa = mapLeaves(en, trans);
fs.writeFileSync(
  path.join(messagesDir, "fa.json"),
  JSON.stringify(fa, null, 2) + "\n",
  "utf8",
);
console.log("OK: messages/fa.json");
