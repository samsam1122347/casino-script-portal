import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { env } from "@/lib/env";
import { getAuthToken, tenantSlug, upstreamAbortSignal } from "@/lib/server/laravel";

async function revokeLaravel(token: string) {
  await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-Tenant-Slug": tenantSlug(),
    },
    signal: upstreamAbortSignal(),
  }).catch(() => undefined);
}

export async function DELETE() {
  const token = await getAuthToken();
  if (token) {
    await revokeLaravel(token);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
