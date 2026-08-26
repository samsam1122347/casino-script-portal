"use client";

import NextTopLoader from "nextjs-toploader";

export function NavigationProgress() {
  return (
    <NextTopLoader
      color="#00f080"
      height={3}
      showSpinner={false}
      shadow="0 0 12px rgba(0,240,128,0.45)"
      zIndex={9999}
      crawlSpeed={120}
      speed={220}
      easing="ease"
    />
  );
}
