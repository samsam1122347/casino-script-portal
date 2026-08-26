import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthToken, serverLaravelFetch } from "@/lib/server/laravel";

const bodySchema = z.object({
  stake_minor: z.number().int().positive(),
  auto_cashout_multiplier: z.number().positive().nullable().optional(),
});

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

  let bodyUnknown: unknown;
  try {
    bodyUnknown = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(bodyUnknown);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid bet.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const idempotencyKey = safeIdempotencyKey(request.headers.get("Idempotency-Key"));

  const forwardHeaders = new Headers();
  forwardHeaders.set("Content-Type", "application/json");
  if (idempotencyKey) {
    forwardHeaders.set("Idempotency-Key", idempotencyKey);
  }

  const res = await serverLaravelFetch("/api/v1/games/crash/bets", {
    method: "POST",
    headers: forwardHeaders,
    body: JSON.stringify(parsed.data),
  });

  const payload: unknown = await res.json().catch(() => ({}));

  return NextResponse.json(payload, { status: res.status });
}
