"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { LiveBetsRail } from "@/components/blocks/LiveBetsRail";
import { cn } from "@/lib/cn";

/**
 * On viewports below `lg`, the live-bets feed is collapsed by default so the
 * Crash page feels less busy on phones. Desktop keeps the rail fully visible.
 */
export function CrashLiveBetsSection() {
  const t = useTranslations("liveActivity");
  const [expanded, setExpanded] = useState(false);
  const [wideLayout, setWideLayout] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWideLayout(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div className="mt-4 min-w-0 max-w-full overflow-x-clip">
      {!wideLayout ? (
        <button
          type="button"
          className="mb-2 flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/[0.12] hover:bg-black/40"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
        >
          <span className="font-display text-sm font-extrabold tracking-tight text-white">
            {t("liveBetsTitle")}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-white/55 transition-transform duration-200",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      ) : null}
      <div className={cn(!wideLayout && !expanded && "hidden")}>
        <LiveBetsRail className="mt-0 max-lg:grid-cols-1" />
      </div>
    </div>
  );
}
