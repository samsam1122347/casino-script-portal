import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { tenantSlug, upstreamAbortSignal } from "@/lib/server/laravel";

/**
 * Signs private support threads for visitors carrying `subscribe_token` (Echo auth params merge into POST body).
 */
export async function POST(request: Request) {
  const raw = await request.text();

  let res: Response;
  try {
    res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/support/broadcast-auth`, {
      method: "POST",
      headers: {
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
          "API unreachable or timed out. Ensure Laravel is running and NEXT_PUBLIC_API_URL is set.",
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
