function readUpstreamTimeoutMs(): number {
  const raw = process.env.LARAVEL_FETCH_TIMEOUT_MS;
  const n = raw ? Number(raw) : NaN;
  if (!Number.isFinite(n)) return 4000;
  return Math.min(Math.max(Math.trunc(n), 500), 30_000);
}

/**
 * AbortSignal for upstream Laravel HTTP calls (server-side). Prevents RSC from
 * hanging when the API is down or `localhost` mis-resolves (e.g. IPv6).
 */
export function upstreamAbortSignal(existing?: AbortSignal | null): AbortSignal {
  const deadline = AbortSignal.timeout(readUpstreamTimeoutMs());
  if (!existing) return deadline;
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([deadline, existing]);
  }
  const c = new AbortController();
  const fail = () => c.abort();
  deadline.addEventListener("abort", fail, { once: true });
  existing.addEventListener("abort", fail, { once: true });
  return c.signal;
}
