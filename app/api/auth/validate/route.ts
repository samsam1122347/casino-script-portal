import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { serverLaravelFetch } from "@/lib/server/laravel";

/** Clears the HttpOnly session cookie when Laravel rejects the Bearer token (e.g. revoked token). */
export async function GET() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ ok: true, cleared: false });
  }

  const res = await serverLaravelFetch("/api/v1/auth/me");

  if (res.status === 401 || res.status === 403) {
    const out = NextResponse.json({ ok: true, cleared: true });
    out.cookies.delete(SESSION_COOKIE_NAME);
    return out;
  }

  return NextResponse.json({ ok: true, cleared: false });
}
