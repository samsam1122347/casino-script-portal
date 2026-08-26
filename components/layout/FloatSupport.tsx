"use client";

import { Headset } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import {
  readSupportThread,
  shortSupportChatRef,
  SUPPORT_THREAD_UPDATED_EVENT,
} from "@/lib/supportThreadStorage";
import { useSupportChat } from "@/components/support/SupportChatContext";

export function FloatSupport() {
  const { openLiveChat, open } = useSupportChat();
  const t = useTranslations("a11y");

  const [refCode, setRefCode] = useState<string | null>(null);

  const syncRef = useCallback(() => {
    const c = readSupportThread();
    setRefCode(c?.requestId ? shortSupportChatRef(c.requestId) : null);
  }, []);

  useEffect(() => {
    syncRef();
    const on = () => syncRef();
    window.addEventListener(SUPPORT_THREAD_UPDATED_EVENT, on);
    return () => window.removeEventListener(SUPPORT_THREAD_UPDATED_EVENT, on);
  }, [syncRef]);

  if (open) return null;

  const label =
    refCode !== null
      ? t("openLiveChatWithRef", { code: refCode })
      : t("openLiveChat");

  return (
    <button
      type="button"
      onClick={openLiveChat}
      aria-label={label}
      title={label}
      aria-haspopup="dialog"
      className={cn(
        "group fixed z-[95] grid h-14 w-14 place-items-center rounded-[28px_28px_28px_8px]",
        "border border-white/[0.08]",
        "bg-gradient-to-br from-[var(--color-panel-2)] via-[var(--color-panel)] to-[var(--color-bg-elevated)]",
        "shadow-[0_14px_38px_-14px_rgba(0,0,0,0.72),0_0_0_1px_rgba(255,255,255,0.06)_inset,0_1px_0_rgba(255,255,255,0.07)_inset]",
        "ring-1 ring-[var(--color-brand)]/22",
        "backdrop-blur-md backdrop-saturate-150",
        "transition-[transform,box-shadow,color,background-color] duration-200",
        "hover:-translate-y-0.5 hover:ring-[var(--color-brand)]/38 hover:shadow-[0_18px_42px_-14px_rgba(0,0,0,0.78),0_0_28px_-14px_rgba(0,240,128,0.11),0_0_0_1px_rgba(255,255,255,0.08)_inset]",
        "active:translate-y-px active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
        "max-lg:bottom-[calc(4.85rem+env(safe-area-inset-bottom))] max-lg:right-4 lg:bottom-7 lg:right-7 lg:h-16 lg:w-16",
      )}
    >
      {refCode !== null ? (
        <span
          className="pointer-events-none absolute bottom-1 right-1 max-w-[4.25rem] truncate rounded-md bg-[var(--color-brand)] px-1 py-0.5 text-[8px] font-mono font-extrabold leading-none text-[var(--color-brand-dark)] shadow-sm ring-1 ring-black/15"
          aria-hidden
        >
          {refCode}
        </span>
      ) : null}
      <Headset
        className="h-[22px] w-[22px] shrink-0 text-[var(--color-brand)] opacity-[0.82] transition-opacity drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] group-hover:opacity-100 lg:h-7 lg:w-7"
        strokeWidth={2}
        aria-hidden
      />
    </button>
  );
}
