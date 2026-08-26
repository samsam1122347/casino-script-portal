import { NextResponse } from "next/server";
import { z } from "zod";

import { serverLaravelFetch } from "@/lib/server/laravel";

const followSchema = z.object({
  inquiry_id: z.string().uuid(),
  message: z.string().trim().min(1).max(2000),
  subscribe_token: z.string().min(16).max(128).optional(),
  client_message_id: z.string().trim().max(128).optional(),
});

export async function POST(request: Request) {
  let bodyUnknown: unknown;
  try {
    bodyUnknown = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = followSchema.safeParse(bodyUnknown);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid body." }, { status: 400 });
  }

  const { inquiry_id, message, subscribe_token, client_message_id } = parsed.data;

  const payload: Record<string, string> = {
    inquiry_id,
    message,
  };
  if (subscribe_token !== undefined) {
    payload.subscribe_token = subscribe_token;
  }
  if (client_message_id !== undefined) {
    payload.client_message_id = client_message_id;
  }

  const res = await serverLaravelFetch("/api/v1/support/inquiries/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    return NextResponse.json(
      { ok: false, message: err.message ?? "Support follow-up rejected." },
      { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
    );
  }

  const data = (await res.json().catch(() => ({ ok: true }))) as Record<string, unknown>;

  return NextResponse.json(data, { status: 200 });
}
