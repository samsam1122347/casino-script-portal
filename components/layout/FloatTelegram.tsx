"use client";

import { cn } from "@/lib/cn";
import { useSupportChat } from "@/components/support/SupportChatContext";

export function FloatTelegram() {
  const { open } = useSupportChat();

  // Hide the telegram icon when the support chat is open, 
  // same as the support icon does.
  if (open) return null;

  return (
    <a
      href="https://t.me/Crashflyy"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Join our Telegram"
      title="Join our Telegram"
      className={cn(
        "group fixed z-[95] grid h-14 w-14 place-items-center rounded-[28px_28px_28px_8px]",
        "border border-white/[0.08]",
        "bg-gradient-to-br from-[var(--color-panel-2)] via-[var(--color-panel)] to-[var(--color-bg-elevated)]",
        "shadow-[0_14px_38px_-14px_rgba(0,0,0,0.72),0_0_0_1px_rgba(255,255,255,0.06)_inset,0_1px_0_rgba(255,255,255,0.07)_inset]",
        "ring-1 ring-[#0088cc]/30", // Telegram brand color for the ring
        "backdrop-blur-md backdrop-saturate-150",
        "transition-[transform,box-shadow,color,background-color] duration-200",
        "hover:-translate-y-0.5 hover:ring-[#0088cc]/50 hover:shadow-[0_18px_42px_-14px_rgba(0,0,0,0.78),0_0_28px_-14px_rgba(0,136,204,0.15),0_0_0_1px_rgba(255,255,255,0.08)_inset]",
        "active:translate-y-px active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0088cc]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
        "max-lg:bottom-[calc(8.85rem+env(safe-area-inset-bottom))] max-lg:right-4 lg:bottom-[6.5rem] lg:right-7 lg:h-16 lg:w-16",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[22px] w-[22px] shrink-0 text-[#0088cc] opacity-[0.82] transition-opacity drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] group-hover:opacity-100 lg:h-7 lg:w-7"
        aria-hidden
      >
        <path d="M21.543 2.057a.5.5 0 0 0-.5-.125L2.1 6.544a.5.5 0 0 0 .041.956l5.65 1.884 10.744-9.336a.2.2 0 0 1 .288.27l-8.628 8.016v4.619a.5.5 0 0 0 .852.353l2.87-2.87 4.908 3.63a.5.5 0 0 0 .783-.243l3.69-18.448a.5.5 0 0 0-.257-.552z" fill="currentColor" stroke="none" />
      </svg>
    </a>
  );
}
