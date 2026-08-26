import { env } from "@/lib/env";
import { upstreamAbortSignal } from "@/lib/server/upstream";

type FetchOptions = RequestInit & {
  /** Path starting with `/`, e.g. `/api/v1/health`. */
  path: string;
};

/**
 * Calls the Laravel API (`NEXT_PUBLIC_API_URL`). Throws on non-OK responses.
 */
export async function apiFetch<T = unknown>(
  opts: FetchOptions,
): Promise<T> {
  const { path, ...init } = opts;
  const url = `${env.NEXT_PUBLIC_API_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    signal: upstreamAbortSignal(init.signal),
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status} ${path}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}
