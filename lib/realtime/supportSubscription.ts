import Pusher from "pusher-js";

import { env } from "@/lib/env";

declare global {
  interface Window {
    PusherSupport?: typeof Pusher;
  }
}

export type SupportBroadcastPayload = {
  id?: string;
  support_inquiry_id?: string;
  body?: string;
  is_from_admin?: boolean;
  admin_name?: string | null;
  created_at?: string | null;
};

function isStaffPayload(raw: unknown): raw is Required<
  Pick<SupportBroadcastPayload, "id" | "body">
> &
  SupportBroadcastPayload {
  if (!raw || typeof raw !== "object") return false;
  const r = raw as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.body === "string" &&
    r.is_from_admin === true
  );
}

/**
 * Guest / ticket-token subscription — uses `/api/support/broadcasting/auth` with `subscribe_token`
 * because Laravel `/api/broadcasting/auth` requires a Sanctum user for private signatures.
 */
export function subscribeSupportInquiryWithTicket(
  inquiryId: string,
  subscribeToken: string,
  onStaffMessage: (payload: Required<Pick<SupportBroadcastPayload, "id" | "body">> &
    SupportBroadcastPayload) => void,
): { disconnect: () => void } | null {
  if (typeof window === "undefined") {
    return null;
  }

  const key = env.NEXT_PUBLIC_PUSHER_APP_KEY?.trim();
  if (!env.NEXT_PUBLIC_REALTIME_ENABLED || !key) {
    return null;
  }

  window.PusherSupport ??= Pusher;
  const pusher = new window.PusherSupport(key, {
    cluster: env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
    wsHost: env.NEXT_PUBLIC_WS_HOST,
    wsPort: env.NEXT_PUBLIC_WS_PORT,
    wssPort: env.NEXT_PUBLIC_WSS_PORT,
    forceTLS: env.NEXT_PUBLIC_PUSHER_SCHEME === "https",
    disableStats: true,
    enabledTransports: ["ws", "wss"],
    authEndpoint: "/api/support/broadcasting/auth",
    auth: {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
      },
      params: {
        subscribe_token: subscribeToken,
      },
    },
  });

  const fullName = `private-support-inquiries.${inquiryId}`;
  const channel = pusher.subscribe(fullName);

  const handler = (raw: unknown) => {
    if (!isStaffPayload(raw)) return;
    onStaffMessage(raw);
  };

  channel.bind("SupportInquiryMessage", handler);
  channel.bind(".SupportInquiryMessage", handler);

  return {
    disconnect: () => {
      channel.unbind("SupportInquiryMessage", handler);
      channel.unbind(".SupportInquiryMessage", handler);
      try {
        pusher.unsubscribe(fullName);
      } catch {
        /* ignore */
      }
      pusher.disconnect();
    },
  };
}
