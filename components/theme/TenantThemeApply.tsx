"use client";

import { useLayoutEffect } from "react";

type TenantThemeApplyProps = {
  /** CSS variables e.g. { "--color-brand": "#00f080" } */
  vars: Record<string, string>;
};

/** Applies whitelabel theme tokens onto `:root` without a flash on navigation. */
export function TenantThemeApply({ vars }: TenantThemeApplyProps) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const prev: Record<string, string> = {};
    for (const [key, value] of Object.entries(vars)) {
      prev[key] = root.style.getPropertyValue(key);
      root.style.setProperty(key, value);
    }
    return () => {
      for (const key of Object.keys(vars)) {
        const old = prev[key];
        if (old) root.style.setProperty(key, old);
        else root.style.removeProperty(key);
      }
    };
  }, [vars]);

  return null;
}
