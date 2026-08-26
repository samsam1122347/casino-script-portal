import { NextResponse } from "next/server";
import { getAuthToken, serverLaravelFetch } from "@/lib/server/laravel";

function safeIdempotencyKey(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (t.length === 0 || t.length > 128) return null;
  return t;
}

export async function POST(request: Request) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const idempotencyKey = safeIdempotencyKey(request.headers.get("Idempotency-Key"));

  const forwardHeaders = new Headers();
  forwardHeaders.set("Content-Type", "application/json");
  if (idempotencyKey) {
    forwardHeaders.set("Idempotency-Key", idempotencyKey);
  }

  const res = await serverLaravelFetch("/api/v1/games/crash/cashouts", {
    method: "POST",
    headers: forwardHeaders,
    body: JSON.stringify({}),
  });

  const payload: unknown = await res.json().catch(() => ({}));

  return NextResponse.json(payload, { status: res.status });
}
