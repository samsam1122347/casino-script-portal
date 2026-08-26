import { NextResponse } from "next/server";
import { getAuthToken, serverLaravelFetch } from "@/lib/server/laravel";

export async function POST() {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const res = await serverLaravelFetch("/api/v1/games/crash/bets/cancel", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  const payload: unknown = await res.json().catch(() => ({}));

  return NextResponse.json(payload, { status: res.status });
}
