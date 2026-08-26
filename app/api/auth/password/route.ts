import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthToken, serverLaravelFetch } from "@/lib/server/laravel";

const schema = z.object({
  current_password: z.string().min(1).max(512),
  password: z.string().min(8).max(512),
  password_confirmation: z.string().min(8).max(512),
});

export async function PATCH(request: Request) {
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

  const parsed = schema.safeParse(bodyUnknown);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid request.",
        issues: parsed.error.flatten(),
      },
      { status: 422 },
    );
  }

  const res = await serverLaravelFetch("/api/v1/auth/password", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
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
