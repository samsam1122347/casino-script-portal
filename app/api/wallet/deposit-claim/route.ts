import { NextResponse } from "next/server";
import { z } from "zod";
import { serverLaravelFetch, getAuthToken } from "@/lib/server/laravel";

const bodySchema = z.object({
  currency: z.string().trim().min(1).max(50),
  network: z.string().trim().min(1).max(50),
});

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
        message: "Invalid claim request.",
        issues: parsed.error.flatten(),
      },
      { status: 422 },
    );
  }

  const forwardHeaders = new Headers();
  forwardHeaders.set("Content-Type", "application/json");

  const res = await serverLaravelFetch("/api/v1/wallet/deposit-claim", {
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
