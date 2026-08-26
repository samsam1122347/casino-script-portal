import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, serverLaravelFetch } from "@/lib/server/laravel";

export async function GET(request: NextRequest) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const rawLimit = Number(request.nextUrl.searchParams.get("limit") ?? "25");
  const limit = Number.isFinite(rawLimit)
    ? Math.min(100, Math.max(1, Math.floor(rawLimit)))
    : 25;

  const res = await serverLaravelFetch(
    `/api/v1/games/crash/my-bets?limit=${limit}`,
    { cache: "no-store" },
  );
  const payload: unknown = await res.json().catch(() => ({}));

  return NextResponse.json(payload, { status: res.status });
}
