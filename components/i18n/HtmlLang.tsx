"use client";

import { useEffect } from "react";

/** Syncs `<html lang>` with the active locale (document shell lives in root `app/layout.tsx`). */
export function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}
