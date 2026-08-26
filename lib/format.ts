const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export function formatMoney(value: number): string {
  return moneyFormatter.format(value);
}

export function formatMoneyCompact(value: number): string {
  return compactFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatMultiplier(value: number): string {
  return `x${value.toFixed(2)}`;
}

/** Short chip for top bar: prefers username, then email. */
export function accountIdentityChip(
  args: { username?: string | null; email?: string | null },
  maxLen = 14,
): string {
  const u = args.username?.trim();
  if (u) return u.length > maxLen ? `${u.slice(0, maxLen - 1)}…` : u;
  const e = args.email?.trim();
  if (e) return shortenEmail(e);
  return "";
}

/** Short display for nav chips (privacy + density). */
export function shortenEmail(email: string, maxLocal = 9): string {
  const idx = email.indexOf("@");
  if (idx < 1) return email;
  const local = email.slice(0, idx);
  const domain = email.slice(idx + 1);
  const head =
    local.length > maxLocal ? `${local.slice(0, maxLocal)}…` : local;
  return `${head}@${domain}`;
}

export function shortenAddress(address: string, head = 6, tail = 4): string {
  if (address.length <= head + tail + 2) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "00 : 00 : 00";
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h} : ${m} : ${s}`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
