import { NextRequest, NextResponse } from "next/server";
import { serverLaravelFetch, tenantSlug } from "@/lib/server/laravel";

export async function GET(request: NextRequest) {
  const tenant = request.nextUrl.searchParams.get("tenant") ?? tenantSlug();
  const res = await serverLaravelFetch(
    `/api/v1/site/config?tenant=${encodeURIComponent(tenant)}`,
    { cache: "no-store" },
  );

  const payload = await res.json().catch(() => null);
  if (!res.ok || !payload) {
    return NextResponse.json({ message: "Config unavailable." }, { status: 503 });
  }

  return NextResponse.json(payload);
}
