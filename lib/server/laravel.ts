import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { upstreamAbortSignal } from "@/lib/server/upstream";

type NextFetchInit = RequestInit & { next?: { revalidate?: number | false } };

export { upstreamAbortSignal } from "@/lib/server/upstream";

export function tenantSlug(): string {
  return env.NEXT_PUBLIC_TENANT_SLUG;
}

export async function getAuthToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE_NAME)?.value;
}

export async function serverLaravelFetch(
  path: string,
  init: NextFetchInit = {},
): Promise<Response> {
  const token = await getAuthToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("X-Tenant-Slug", tenantSlug());
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const url = `${env.NEXT_PUBLIC_API_URL}${path}`;
  const nextInit = init;
  const useNoStore =
    init.cache === undefined && nextInit.next?.revalidate === undefined;

  try {
    return await fetch(url, {
      ...init,
      headers,
      signal: upstreamAbortSignal(init.signal),
      ...(useNoStore ? { cache: "no-store" } : {}),
    });
  } catch (error) {
    const isAbort =
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError");
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[portal] Laravel unreachable or timeout:",
        url,
        isAbort ? "(timeout)" : error,
      );
    }
    return new Response(
      JSON.stringify({
        message:
          "API unreachable or timed out. From `portal/`: set NEXT_PUBLIC_API_URL in `.env.local` (e.g. http://127.0.0.1). Ensure Sail is up: `cd api && ./vendor/bin/sail up -d`.",
        code: isAbort ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNREACHABLE",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
