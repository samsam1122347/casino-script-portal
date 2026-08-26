import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getAuthToken, tenantSlug, upstreamAbortSignal } from "@/lib/server/laravel";

/**
 * BFF for Laravel `/api/broadcasting/auth` — attaches Bearer from HttpOnly session cookie.
 */
export async function POST(request: Request) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const raw = await request.text();

  let res: Response;
  try {
    res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/broadcasting/auth`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type":
          request.headers.get("content-type") ?? "application/x-www-form-urlencoded",
        "X-Tenant-Slug": tenantSlug(),
      },
      body: raw,
      cache: "no-store",
      signal: upstreamAbortSignal(),
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "API unreachable or timed out. Ensure Sail is running and NEXT_PUBLIC_API_URL matches (e.g. http://127.0.0.1).",
        code: "UPSTREAM_UNREACHABLE",
      },
      { status: 503 },
    );
  }

  const body = await res.text();

  return new NextResponse(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
