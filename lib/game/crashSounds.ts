/**
 * Lightweight Crash UI sounds via Web Audio (no asset files).
 * Requires a user gesture to unlock/resume AudioContext (`unlockCrashSounds`).
 */

export type CrashSoundKind =
  | "bet"
  | "win"
  | "lose"
  | "close"
  | "roundStart"
  | "tickSoft";

const STORAGE_KEY = "crash:sounds";

let audioCtx: AudioContext | null = null;

export function crashSoundsMuted(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  return window.localStorage.getItem(STORAGE_KEY) === "off";
}

export function setCrashSoundsMuted(muted: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, muted ? "off" : "on");
}

/** Call from pointer/tap handlers so autoplay policies allow playback. */
export function unlockCrashSounds(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const Ctx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!Ctx) {
      return;
    }
    audioCtx ??= new Ctx();
    void audioCtx.resume();
  } catch {
    audioCtx = null;
  }
}

function scheduleBeep(
  ctx: AudioContext,
  t0: number,
  freq: number,
  duration: number,
  type: OscillatorType,
  peakGain: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);

  gain.gain.setValueAtTime(1e-4, t0);
  gain.gain.linearRampToValueAtTime(peakGain, t0 + Math.min(0.02, duration * 0.25));
  gain.gain.exponentialRampToValueAtTime(1e-4, t0 + duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/** Fire-and-forget; no-op if muted or AudioContext unavailable. */
export function playCrashSound(kind: CrashSoundKind): void {
  if (crashSoundsMuted() || typeof window === "undefined") {
    return;
  }
  if (!audioCtx) {
    return;
  }

  const ctx = audioCtx;
  const t0 = ctx.currentTime;

  try {
    switch (kind) {
      case "bet":
        scheduleBeep(ctx, t0, 520, 0.07, "sine", 0.1);
        scheduleBeep(ctx, t0 + 0.055, 820, 0.07, "sine", 0.08);
        break;
      case "win":
        scheduleBeep(ctx, t0, 523, 0.09, "triangle", 0.07);
        scheduleBeep(ctx, t0 + 0.085, 659, 0.1, "triangle", 0.078);
        scheduleBeep(ctx, t0 + 0.18, 784, 0.13, "triangle", 0.065);
        break;
      case "lose":
        scheduleBeep(ctx, t0, 185, 0.16, "sawtooth", 0.055);
        scheduleBeep(ctx, t0 + 0.1, 98, 0.22, "square", 0.04);
        break;
      case "close":
        scheduleBeep(ctx, t0, 380, 0.065, "sine", 0.06);
        scheduleBeep(ctx, t0 + 0.04, 240, 0.08, "sine", 0.045);
        break;
      case "roundStart":
        scheduleBeep(ctx, t0, 280, 0.05, "sine", 0.055);
        scheduleBeep(ctx, t0 + 0.06, 420, 0.07, "sine", 0.06);
        break;
      case "tickSoft":
        scheduleBeep(ctx, t0, 1200, 0.028, "sine", 0.025);
        break;
      default:
        break;
    }
  } catch {
    /* ignore */
  }
}
