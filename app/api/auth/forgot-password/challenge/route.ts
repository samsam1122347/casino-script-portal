import { NextResponse } from "next/server";
import { serverLaravelFetch } from "@/lib/server/laravel";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const res = await serverLaravelFetch("/api/v1/auth/forgot-password/challenge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(
      {
        message: payload.message ?? "Could not start password recovery.",
        errors: payload.errors,
      },
      { status: res.status },
    );
  }

  return NextResponse.json(payload);
}
