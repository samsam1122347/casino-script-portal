"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { formatMultiplier } from "@/lib/format";
import { useCrashGameLoop } from "@/lib/game/useCrashGameLoop";
import { getCrashState } from "@/lib/game/crashStore";
import { SmoothMultiplier } from "@/components/game/SmoothMultiplier";
import { cn } from "@/lib/cn";

/** After the first full play, loop running-phase playback from this timestamp (seconds). */
const VIDEO_LOOP_IN_SEC = 2;
const VIDEO_TIME_EPS = 0.08;

export function CrashVideoStage({
  useAuthoritativeFeed = false,
  initialRealBalanceMinor = 0,
}: {
  useAuthoritativeFeed?: boolean;
  initialRealBalanceMinor?: number;
}) {
  const t = useTranslations("crashGame");
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const phaseForVideoRef = useRef<string>("");
  const prevPhaseVideoRef = useRef<string>("");

  const { phase, multiplier, prepLeft, prepBarDenom } = useCrashGameLoop({
    containerEl,
    useAuthoritativeFeed,
    initialRealBalanceMinor,
  });

  useEffect(() => {
    phaseForVideoRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (phase === "preparing") {
      v.pause();
      try {
        v.currentTime = 0;
      } catch {
        //
      }
    } else if (phase === "crashed") {
      v.pause();
    } else if (
      phase === "running" &&
      prevPhaseVideoRef.current !== "running"
    ) {
      try {
        v.currentTime = 0;
      } catch {
        //
      }
      void v.play().catch(() => {});
    }

    prevPhaseVideoRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    let reseeking = false;

    const seekLoopOrReplay = () => {
      if (phaseForVideoRef.current !== "running") return;
      if (reseeking) return;
      reseeking = true;
      const d = v.duration;
      if (!Number.isFinite(d) || d <= VIDEO_TIME_EPS) {
        reseeking = false;
        return;
      }
      const loopStart = Math.min(
        VIDEO_LOOP_IN_SEC,
        Math.max(0, d - VIDEO_TIME_EPS),
      );
      try {
        v.currentTime = loopStart;
      } catch {
        reseeking = false;
        return;
      }
      void v
        .play()
        .then(() => {
          reseeking = false;
        })
        .catch(() => {
          reseeking = false;
        });
    };

    const onEnded = () => seekLoopOrReplay();

    v.addEventListener("ended", onEnded);
    return () => v.removeEventListener("ended", onEnded);
  }, []);

  return (
    <div
      ref={setContainerEl}
      className="relative isolate h-[min(38svh,270px)] min-h-[200px] overflow-hidden rounded-xl bg-[#04080f] shadow-[inset_0_0_0_1px_rgba(180,230,255,0.06)] sm:h-[min(52svh,430px)] sm:min-h-[360px] sm:rounded-2xl lg:min-h-[440px] xl:h-auto xl:min-h-[500px]"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 z-[1] h-full w-full object-cover"
        muted
        playsInline
        preload="auto"
        aria-hidden
      >
        <source src="/game/bgcrash.webm" type="video/webm" />
        <source src="/game/bgcrash.mp4" type="video/mp4" />
      </video>

      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_60%_55%_at_50%_42%,transparent_30%,rgba(2,6,18,0.55)_85%)]"
        aria-hidden
      />

      {phase === "preparing" && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[7] h-[3px] overflow-hidden"
          aria-hidden
        >
          <span
            className="block h-full origin-left bg-[linear-gradient(90deg,var(--color-brand)_0%,#5eeedc_100%)] shadow-[0_0_18px_rgba(35,243,111,0.7)]"
            style={{
              transform: `scaleX(${Math.min(
                1,
                prepLeft / Math.max(1, prepBarDenom),
              )})`,
              transition: "transform 1s linear",
            }}
          />
        </div>
      )}

      {(phase === "running" || phase === "preparing") && (
        <div className="pointer-events-none absolute inset-x-2 top-1/2 z-[6] -translate-y-[58%] sm:inset-x-6 sm:-translate-y-1/2">
          <strong
            className={cn(
              `numeric block w-full max-w-full select-none text-center font-[var(--font-display)] font-extrabold leading-tight tracking-[-0.04em] sm:leading-[0.95] sm:tracking-[-0.06em]`,
              phase === "preparing"
                ? "whitespace-normal px-2 text-balance text-[clamp(1.25rem,5vw,2.5rem)] text-white/[0.72] sm:px-3 sm:text-[clamp(1.8rem,8vw,3rem)] sm:text-white/[0.6]"
                : "whitespace-nowrap text-[clamp(2.35rem,12vw,5.7rem)] bg-gradient-to-b from-[#f4fdff] via-[#a9f4f2] to-[#5eeadb] bg-clip-text text-transparent drop-shadow-[0_0_36px_rgba(94,234,219,0.45)] sm:text-[clamp(3.1rem,9vw,6rem)]",
            )}
          >
            {phase === "preparing" ? (
              <span className="flex max-w-[100%] flex-col items-center gap-1 text-center tracking-[-0.02em]">
                <span className="max-w-[min(100%,18rem)] px-1 font-sans text-[10px] font-extrabold uppercase leading-snug tracking-[0.2em] text-white/45 sm:max-w-none sm:px-0 sm:text-[0.42em] sm:tracking-[0.22em]">
                  {t("prepGetReady")}
                </span>
                <span className="tabular-nums text-white/[0.82]">
                  {prepLeft > 0 ? (
                    t("prepStartingIn", { seconds: prepLeft })
                  ) : useAuthoritativeFeed &&
                    getCrashState().authorityBetWindow === null ? (
                    t("prepAwaitRound")
                  ) : (
                    t("prepLiftOff")
                  )}
                </span>
              </span>
            ) : (
              <SmoothMultiplier />
            )}
          </strong>
        </div>
      )}

      {phase === "crashed" && (
        <div className="pointer-events-none absolute inset-x-3 top-1/2 z-[6] flex -translate-y-1/2 justify-center sm:inset-x-8">
          <div className="flex max-w-[min(100%,28rem)] flex-col items-center gap-1.5 rounded-2xl border border-[var(--color-pink)]/30 bg-black/70 px-5 py-3.5 shadow-[0_14px_40px_-12px_rgba(255,62,118,0.45)] backdrop-blur-md supports-[backdrop-filter]:bg-black/55 sm:gap-2 sm:px-7 sm:py-5">
            <span className="font-[var(--font-display)] text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--color-pink)]/90">
              {t("bustStateLabel")}
            </span>
            <span className="numeric font-[var(--font-display)] text-[clamp(2.3rem,10vw,3.85rem)] font-black leading-none tracking-[-0.05em] text-[var(--color-pink)]">
              {formatMultiplier(multiplier)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
