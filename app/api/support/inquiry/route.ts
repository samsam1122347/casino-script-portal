import { NextResponse } from "next/server";
import { z } from "zod";
import { serverLaravelFetch } from "@/lib/server/laravel";

const inquirySchema = z.object({
  message: z.string().trim().min(1).max(2000),
  email: z.string().trim().email().max(255).optional(),
  client_message_id: z.string().trim().max(128).optional(),
});

/**
 * Proxies chat lines to Laravel for logging (`storage/logs/support-*.log`).
 */
export async function POST(request: Request) {
  let bodyUnknown: unknown;
  try {
    bodyUnknown = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(bodyUnknown);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid body." }, { status: 400 });
  }

  const { message, email, client_message_id } = parsed.data;

  const payload: { message: string; email?: string; client_message_id?: string } = {
    message,
  };

  if (email) {
    payload.email = email;
  }
  if (client_message_id) {
    payload.client_message_id = client_message_id;
  }

  const res = await serverLaravelFetch("/api/v1/support/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    return NextResponse.json(
      { ok: false, message: err.message ?? "Upstream support logging failed." },
      { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
    );
  }

  const data = (await res.json().catch(() => ({ ok: true }))) as Record<string, unknown>;

  return NextResponse.json({ ok: true, ...data }, { status: 200 });
}
