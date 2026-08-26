import { NextResponse } from "next/server";

import { serverLaravelFetch } from "@/lib/server/laravel";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inquiryId = searchParams.get("inquiry_id")?.trim();
  const subscribeToken = searchParams.get("subscribe_token")?.trim();

  if (!inquiryId) {
    return NextResponse.json({ message: "inquiry_id is required." }, { status: 400 });
  }

  const q = subscribeToken
    ? `?${new URLSearchParams({ subscribe_token: subscribeToken })}`
    : "";

  const res = await serverLaravelFetch(
    `/api/v1/support/inquiries/${encodeURIComponent(inquiryId)}/thread${q}`,
    {
      method: "GET",
    },
  );

  const bodyText = await res.text();

  return new NextResponse(bodyText, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
