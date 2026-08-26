import { NextRequest, NextResponse } from "next/server";
import { serverLaravelFetch, tenantSlug } from "@/lib/server/laravel";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const tenant = request.nextUrl.searchParams.get("tenant") ?? tenantSlug();
  const res = await serverLaravelFetch(
    `/api/v1/site/crash-state?tenant=${encodeURIComponent(tenant)}`,
    { cache: "no-store" },
  );

  let payload = await res.json().catch(() => null);
  if (!res.ok || !payload) {
    const fallback = await fetch(
      `${env.NEXT_PUBLIC_SITE_URL}/api/v1/site/crash-state?tenant=${encodeURIComponent(tenant)}`,
      { cache: "no-store" },
    ).catch(() => null);
    if (fallback?.ok) {
      payload = await fallback.json().catch(() => null);
    }
  }

  if (!payload) {
    return NextResponse.json({ message: "Crash state unavailable." }, { status: 503 });
  }

  return NextResponse.json(payload);
}
