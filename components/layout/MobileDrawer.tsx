"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/Sheet";
import { Sidebar, type SidebarUserPreview } from "./Sidebar";

export function MobileDrawer({
  authed,
  userPreview,
}: {
  authed: boolean;
  userPreview?: SidebarUserPreview;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const collapse = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", collapse);
    collapse();
    return () => mq.removeEventListener("change", collapse);
  }, [open]);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="group relative grid size-11 touch-manipulation place-items-center overflow-hidden rounded-2xl bg-gradient-to-b from-[var(--color-panel-2)] to-[var(--color-bg-deep)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_24px_-10px_rgba(35,243,111,0.45)] ring-2 ring-[var(--color-brand)]/25 transition-[transform,box-shadow,ring-color] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_32px_-8px_rgba(35,243,111,0.55)] hover:ring-[var(--color-brand)]/50 active:scale-[0.96] md:hidden"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-nav-sheet"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(35,243,111,0.12)_50%,transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
          />
          <Menu
            className="relative h-[1.15rem] w-[1.15rem] text-white drop-shadow-[0_0_10px_rgba(35,243,111,0.35)]"
            aria-hidden
            strokeWidth={2.25}
          />
        </button>
      </SheetTrigger>
      <SheetContent
        id="mobile-nav-sheet"
        side="left"
        className="w-[min(300px,calc(100vw-56px))] border-r border-[var(--chrome-border)] p-0 lg:hidden"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Main menu with links to games, profile, deposits and support.
        </SheetDescription>
        {/* Single scroll surface: avoids nested scroll traps + clipped footer on iOS */}
        <div className="flex min-h-0 flex-1 flex-col overscroll-y-contain [scrollbar-gutter:stable]">
          <div
            className="mobile-drawer-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div
              className="pb-[max(12px,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]"
            >
              <Sidebar
                authed={authed}
                embedded
                onNavigate={() => setOpen(false)}
                showHeader
                userPreview={userPreview}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
