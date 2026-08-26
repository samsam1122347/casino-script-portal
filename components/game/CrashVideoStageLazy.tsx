"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

const CrashVideoStage = dynamic(
  () =>
    import("@/components/game/CrashVideoStage").then((m) => ({
      default: m.CrashVideoStage,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="relative isolate flex h-[min(46svh,330px)] min-h-[240px] items-center justify-center overflow-hidden rounded-xl bg-[#07101f] sm:h-[min(52svh,430px)] sm:min-h-[360px] sm:rounded-2xl lg:min-h-[440px] xl:h-auto xl:min-h-[500px]"
        aria-hidden
      >
        <Skeleton className="absolute inset-2 rounded-xl bg-white/5" />
        <span className="relative text-sm font-bold text-white/30">
          Loading…
        </span>
      </div>
    ),
  },
);

export function CrashVideoStageLazy(
  props: ComponentProps<typeof CrashVideoStage>,
) {
  return <CrashVideoStage {...props} />;
}
