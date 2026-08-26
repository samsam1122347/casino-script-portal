"use client";

import { useEffect } from "react";

/**
 * Registers the app shell service worker in production so the site stays installable.
 * Set NEXT_PUBLIC_ENABLE_PWA_SW=true locally to test installation flows.
 */
export function PwaServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const enable =
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ENABLE_PWA_SW === "true";

    if (!enable) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
