import { NextResponse } from "next/server";
import { z } from "zod";
import { serverLaravelFetch, getAuthToken } from "@/lib/server/laravel";

const bodySchema = z.object({
  crypto_asset_id: z.string().trim().min(1).max(32),
  destination_address: z.string().trim().min(8).max(512),
  amount_minor: z.number().int().positive().max(999_999_999_999),
});

function safeIdempotencyKey(raw: string | null): string | null {
  if (!raw) {
    return null;
  }
  const t = raw.trim();
  if (t.length === 0 || t.length > 128) {
    return null;
  }
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
      {
        message: "Invalid withdrawal request.",
        issues: parsed.error.flatten(),
      },
      { status: 422 },
    );
  }

  const idempotencyKey = safeIdempotencyKey(request.headers.get("Idempotency-Key"));

  const forwardHeaders = new Headers();
  forwardHeaders.set("Content-Type", "application/json");
  if (idempotencyKey) {
    forwardHeaders.set("Idempotency-Key", idempotencyKey);
  }

  const res = await serverLaravelFetch("/api/v1/wallet/withdraw", {
    method: "POST",
    headers: forwardHeaders,
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 503) {
    const payload = (await res.json().catch(() => ({}))) as { message?: string };
    return NextResponse.json(
      { message: payload.message ?? "API unavailable." },
      { status: 503 },
    );
  }

  const payload: unknown = await res.json().catch(() => ({}));

  return NextResponse.json(payload, { status: res.status });
}
