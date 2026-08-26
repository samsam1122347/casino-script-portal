import Echo from "laravel-echo";
import Pusher from "pusher-js";

import { env } from "@/lib/env";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

let echo: Echo<"pusher"> | null = null;

export function getEcho(): Echo<"pusher"> | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!env.NEXT_PUBLIC_REALTIME_ENABLED) {
    return null;
  }

  const key = env.NEXT_PUBLIC_PUSHER_APP_KEY?.trim();
  if (!key) {
    return null;
  }

  if (!echo) {
    window.Pusher = Pusher;
    echo = new Echo({
      broadcaster: "pusher",
      key,
      cluster: env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
      wsHost: env.NEXT_PUBLIC_WS_HOST,
      wsPort: env.NEXT_PUBLIC_WS_PORT,
      wssPort: env.NEXT_PUBLIC_WSS_PORT,
      forceTLS: env.NEXT_PUBLIC_PUSHER_SCHEME === "https",
      disableStats: true,
      enabledTransports: ["ws", "wss"],
      authEndpoint: "/api/broadcasting/auth",
      auth: {
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      },
    });
  }

  return echo;
}

export function crashPrivateChannelName(tenantSlug: string): string {
  return `tenants.${tenantSlug}.crash`;
}
