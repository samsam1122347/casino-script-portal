/** Normalize Laravel `{ field: ["a","b"] }` or `{ field: "a" }` into first message per key. */
export function flattenApiErrors(errors: unknown): Record<string, string> {
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [key, raw] of Object.entries(errors as Record<string, unknown>)) {
    const msg = pickFirstMessage(raw);
    if (typeof msg === "string" && msg.trim()) out[key] = msg.trim();
  }
  return out;
}

function pickFirstMessage(raw: unknown): string | undefined {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    for (const x of raw) {
      if (typeof x === "string" && x.trim()) return x;
    }
  }
  return undefined;
}
