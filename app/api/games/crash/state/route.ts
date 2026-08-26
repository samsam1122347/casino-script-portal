import { NextResponse } from "next/server";
import { getAuthToken, serverLaravelFetch } from "@/lib/server/laravel";

export async function GET() {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const res = await serverLaravelFetch("/api/v1/games/crash/state");
  const payload: unknown = await res.json().catch(() => ({}));

  return NextResponse.json(payload, { status: res.status });
}
