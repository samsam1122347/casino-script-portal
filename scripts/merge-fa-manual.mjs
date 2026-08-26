import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import overrides from "./fa-manual-overrides.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mapPath = path.join(__dirname, "fa-en-to-fa-map.json");

const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
for (const [k, v] of Object.entries(overrides)) map[k] = v;
fs.writeFileSync(mapPath, JSON.stringify(map, null, 0), "utf8");
console.log("Merged manual overrides into", mapPath);
