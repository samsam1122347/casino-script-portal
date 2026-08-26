"use client";

import { useEffect, useRef } from "react";
import { getFrameMultiplier, useCrashState } from "@/lib/game/crashStore";
import { formatMultiplier } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * The big live multiplier number, animated at display refresh rate **without
 * React renders**. Its own RAF loop reads `frameMultiplier` from the crash
 * store and writes straight to the DOM via a ref, so the 60fps number costs
 * nothing in React's render path — only the (rare) phase change re-renders it.
 */
export function SmoothMultiplier({ className }: { className?: string }) {
  const phase = useCrashState((s) => s.phase);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (node === null) return;

    // Paint the current value immediately so a phase change has no blank frame.
    let last = formatMultiplier(getFrameMultiplier());
    node.textContent = last;

    if (phase !== "running") return;

    let raf = 0;
    const tick = () => {
      const next = formatMultiplier(getFrameMultiplier());
      if (next !== last) {
        last = next;
        if (ref.current !== null) ref.current.textContent = next;
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [phase]);

  return (
    <span ref={ref} className={cn("numeric tabular-nums", className)} aria-hidden />
  );
}
