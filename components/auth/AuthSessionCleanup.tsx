"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";

import { AUTH_SESSION_PROBE_KEY } from "@/lib/auth/sessionProbe";

/**
 * Dropped HttpOnly Laravel tokens linger in the cookie jar; `/api/auth/validate` clears them server-side after a failed `/auth/me`,
 * keeping the Echo BFF path from repeatedly posting dead credentials.
 */
export function AuthSessionCleanup() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    try {
      if (sessionStorage.getItem(AUTH_SESSION_PROBE_KEY)) return;
    } catch {
      // private mode / SSR guard
    }

    void fetch("/api/auth/validate", { credentials: "same-origin" })
      .then((r) => r.json() as Promise<{ cleared?: boolean }>)
      .then((body) => {
        try {
          sessionStorage.setItem(AUTH_SESSION_PROBE_KEY, "1");
        } catch {
          // noop
        }
        if (body.cleared) router.refresh();
      })
      .catch(() => undefined);
  }, [router]);

  return null;
}
