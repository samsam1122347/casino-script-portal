"use client";

import {
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { playCrashSound } from "@/lib/game/crashSounds";
import {
  getCrashState,
  liveAuthoritativeMultiplier,
  reportFrame,
  setCrashEconomy,
  useCrashState,
  type Phase,
} from "@/lib/game/crashStore";

const GROWTH_PER_SEC = 0.055;
const CRASH_HOLD_MS = 2400;
const PREP_SECONDS = 8;
const MILESTONES = [2, 5, 10, 25, 50] as const;
/**
 * The RAF loop runs at display refresh rate to keep `reportFrame` (store +
 * frameMultiplier) and sounds in sync, but it only pushes React state at this
 * cadence. The smooth ~60fps number is rendered by SmoothMultiplier straight
 * from `frameMultiplier`, so 10fps React updates here are plenty for the video
 * phase control + crashed overlay and avoid a per-frame re-render storm.
 */
const REACT_THROTTLE_MS = 100;

function generateCrashPoint() {
  const r = Math.random();
  if (r < 0.05) return 1.01;
  return Math.min(14, 1 + 1 / (1 - r));
}

export type UseCrashGameLoopOptions = {
  /** Mount node for IntersectionObserver (pause RAF off-screen). Use ref callback state. */
  containerEl: HTMLDivElement | null;
  useAuthoritativeFeed: boolean;
  initialRealBalanceMinor: number;
  onMultiplier?: (value: number, phase: Phase) => void;
};

/**
 * RAF loop driving {@link reportFrame} (practice RNG + authoritative modes).
 * Mirrors the former CrashCanvas core without any canvas drawing.
 */
export function useCrashGameLoop({
  containerEl,
  useAuthoritativeFeed,
  initialRealBalanceMinor,
  onMultiplier,
}: UseCrashGameLoopOptions): {
  phase: Phase;
  multiplier: number;
  prepLeft: number;
  prepBarDenom: number;
} {
  const [phase, setPhase] = useState<Phase>("running");
  const [multiplier, setMultiplier] = useState(1);
  const [prepLeft, setPrepLeft] = useState(0);

  const authoritativeBetWin = useCrashState((s) =>
    useAuthoritativeFeed && s.mode === "real" ? s.authorityBetWindow : null,
  );
  const prepBarDenom =
    authoritativeBetWin !== null
      ? Math.max(
          2,
          Math.round(
            (authoritativeBetWin.closesMs - authoritativeBetWin.opensMs) /
              1000,
          ),
        )
      : PREP_SECONDS;

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const crashAtRef = useRef<number>(2);
  const phaseRef = useRef<Phase>("running");
  const prevPhaseRef = useRef<Phase | null>(null);
  const milestoneRef = useRef(0);
  const authFeedRef = useRef(useAuthoritativeFeed);
  /** Throttle gate for pushing RAF values into React state (see REACT_THROTTLE_MS). */
  const lastReactEmitRef = useRef(0);
  const lastReactPhaseRef = useRef<Phase>("running");

  const onScreenRef = useRef(true);
  const visibleRef = useRef(
    typeof document === "undefined" ? true : !document.hidden,
  );
  const syncLoopRef = useRef<() => void>(() => {});

  useEffect(() => {
    authFeedRef.current = useAuthoritativeFeed;
  }, [useAuthoritativeFeed]);

  useLayoutEffect(() => {
    if (!useAuthoritativeFeed) return;
    setCrashEconomy("real", initialRealBalanceMinor);
  }, [useAuthoritativeFeed, initialRealBalanceMinor]);

  useEffect(() => {
    const prev = prevPhaseRef.current;
    if (prev === "preparing" && phase === "running") {
      playCrashSound("roundStart");
    }
    if (prev === "running" && phase === "crashed") {
      playCrashSound("lose");
    }
    if (phase === "preparing") {
      milestoneRef.current = 0;
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  function maybePlayMilestone(value: number) {
    if (phaseRef.current !== "running") return;
    for (let i = MILESTONES.length - 1; i >= 0; i--) {
      const m = MILESTONES[i];
      if (value >= m && milestoneRef.current < m) {
        milestoneRef.current = m;
        playCrashSound("tickSoft");
        break;
      }
    }
  }

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (phase !== "preparing") return;
    if (!useAuthoritativeFeed) {
      let cleared = false;
      const prepFrame = window.requestAnimationFrame(() => {
        if (cleared) return;
        setPrepLeft(PREP_SECONDS);
      });
      let n = PREP_SECONDS;
      const id = window.setInterval(() => {
        n -= 1;
        setPrepLeft(Math.max(0, n));
        if (n <= 0) window.clearInterval(id);
      }, 1000);
      return () => {
        cleared = true;
        window.cancelAnimationFrame(prepFrame);
        window.clearInterval(id);
      };
    }

    const tick = (): void => {
      const bw = getCrashState().authorityBetWindow;
      if (bw === null) {
        startTransition(() => setPrepLeft(0));
        return;
      }
      const sec = Math.max(0, Math.ceil((bw.closesMs - Date.now()) / 1000));
      startTransition(() => setPrepLeft(sec));
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [phase, useAuthoritativeFeed]);

  useEffect(() => {
    let mounted = true;

    /**
     * Push a value into React state — immediately on a phase change, otherwise
     * throttled to REACT_THROTTLE_MS. The high-frequency smooth display does not
     * go through here; it reads `frameMultiplier` via SmoothMultiplier's RAF.
     */
    function pushReact(ph: Phase, value: number): void {
      const phaseChanged = ph !== lastReactPhaseRef.current;
      const nowTs = performance.now();
      if (!phaseChanged && nowTs - lastReactEmitRef.current < REACT_THROTTLE_MS) {
        return;
      }
      lastReactEmitRef.current = nowTs;
      lastReactPhaseRef.current = ph;
      startTransition(() => {
        setPhase(ph);
        setMultiplier(value);
      });
      onMultiplier?.(value, ph);
    }

    function loop(ts?: number) {
      const now = typeof ts === "number" ? ts : performance.now();
      const snap = getCrashState();
      if (authFeedRef.current && snap.mode === "real") {
        phaseRef.current = snap.phase;
        const liveMult = liveAuthoritativeMultiplier();
        // reportFrame runs every frame (store + frameMultiplier + bet promotion);
        // React state is throttled.
        reportFrame(snap.phase, liveMult);
        maybePlayMilestone(liveMult);
        pushReact(snap.phase, liveMult);
        rafRef.current = window.requestAnimationFrame(loop);
        return;
      }

      const value = Math.min(
        crashAtRef.current,
        Math.exp(((now - startRef.current) / 1000) * GROWTH_PER_SEC),
      );
      const ph = phaseRef.current;
      if (ph === "running") {
        reportFrame("running", value);
        maybePlayMilestone(value);
        pushReact("running", value);

        if (value >= crashAtRef.current) {
          phaseRef.current = "crashed";
          reportFrame("crashed", value);
          pushReact("crashed", value);
          window.setTimeout(() => {
            if (!mounted) return;
            phaseRef.current = "preparing";
            reportFrame("preparing", 1);
            pushReact("preparing", 1);
            window.setTimeout(startRound, PREP_SECONDS * 1000);
          }, CRASH_HOLD_MS);
        }
      }

      rafRef.current = window.requestAnimationFrame(loop);
    }

    function startRound() {
      if (!mounted) return;
      crashAtRef.current = generateCrashPoint();
      startRef.current = performance.now();
      setMultiplier(1);
      phaseRef.current = "running";
      setPhase("running");
      reportFrame("running", 1);
    }

    let looping = false;
    let pausedAt = 0;

    function startLoop(): void {
      if (looping || !mounted) return;
      looping = true;
      if (pausedAt > 0) {
        startRef.current += performance.now() - pausedAt;
        pausedAt = 0;
      }
      rafRef.current = window.requestAnimationFrame(loop);
    }

    function stopLoop(): void {
      if (!looping) return;
      looping = false;
      pausedAt = performance.now();
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    function syncLoop(): void {
      if (visibleRef.current && onScreenRef.current) startLoop();
      else stopLoop();
    }
    syncLoopRef.current = syncLoop;

    const onVisibility = (): void => {
      visibleRef.current = !document.hidden;
      syncLoop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (!authFeedRef.current) {
      startRound();
    } else {
      const s = getCrashState();
      phaseRef.current = s.phase;
      setPhase(s.phase);
      setMultiplier(s.multiplier);
    }

    syncLoop();

    return () => {
      mounted = false;
      looping = false;
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!containerEl || typeof IntersectionObserver === "undefined") {
      onScreenRef.current = true;
      syncLoopRef.current();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) onScreenRef.current = entry.isIntersecting;
        syncLoopRef.current();
      },
      { rootMargin: "120px", threshold: 0.01 },
    );
    observer.observe(containerEl);
    return () => observer.disconnect();
  }, [containerEl]);

  return { phase, multiplier, prepLeft, prepBarDenom };
}
