import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { serverLaravelFetch } from "@/lib/server/laravel";

const MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const res = await serverLaravelFetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 503) {
    const payload = (await res.json().catch(() => ({}))) as { message?: string };
    return NextResponse.json(
      { message: payload.message ?? "API unavailable." },
      { status: 503 },
    );
  }

  const payload: { token?: string; message?: string; errors?: unknown } = await res
    .json()
    .catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(
      {
        message: payload.message ?? "Login failed.",
        errors: payload.errors,
      },
      { status: res.status },
    );
  }

  if (!payload.token) {
    return NextResponse.json({ message: "Invalid API response." }, { status: 502 });
  }

  const out = NextResponse.json({ ok: true });
  out.cookies.set(SESSION_COOKIE_NAME, payload.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });

  return out;
}
