"use client";

import { useCallback, useState } from "react";
import { Check, ChevronDown, ShieldCheck, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { formatMultiplier } from "@/lib/format";
import { useCrashPublicState } from "@/lib/game/useCrashPublicState";

type VerifyResult =
  | { kind: "idle" }
  | { kind: "match" }
  | { kind: "mismatch" }
  | { kind: "error" };

/** SHA-256(server_seed + "|" + pf_nonce + "|" + external_round_id), hex. */
async function computeCommitment(
  serverSeed: string,
  nonce: string,
  roundId: string,
): Promise<string> {
  const input = `${serverSeed}|${nonce}|${roundId}`;
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function FieldRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-white/[0.05] py-1.5 last:border-b-0">
      <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/40">
        {label}
      </span>
      <span className="numeric break-all font-mono text-[11px] font-semibold tabular-nums text-white/75">
        {value ?? "—"}
      </span>
    </div>
  );
}

/**
 * Collapsible provably-fair verifier. Reads the public crash-state `round`
 * object and lets the player recompute the hash commitment from the revealed
 * server seed entirely client-side. `enabled` gates the underlying poll so it
 * only runs for real-money players.
 */
export function FairnessVerifier({ enabled }: { enabled: boolean }) {
  const t = useTranslations("crashGame");
  const { round } = useCrashPublicState(enabled);
  const [result, setResult] = useState<VerifyResult>({ kind: "idle" });

  const seed = round?.revealed_server_seed ?? null;
  const nonce = round?.pf_nonce ?? null;
  const roundId = round?.external_round_id ?? null;
  const commitment = round?.hash_commitment ?? null;
  const canVerify = Boolean(seed && nonce && roundId && commitment);

  const handleVerify = useCallback(async () => {
    if (!seed || !nonce || !roundId || !commitment) return;
    try {
      const computed = await computeCommitment(seed, nonce, roundId);
      setResult(
        computed.toLowerCase() === commitment.toLowerCase()
          ? { kind: "match" }
          : { kind: "mismatch" },
      );
    } catch {
      setResult({ kind: "error" });
    }
  }, [seed, nonce, roundId, commitment]);

  return (
    <details className="group mt-2 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] sm:rounded-2xl">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/55 sm:px-4">
        <span className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/65 sm:text-[12px]">
          <ShieldCheck
            className="h-3.5 w-3.5 text-[var(--color-brand)]"
            aria-hidden
          />
          {t("verifyPanelTitle")}
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
      </summary>

      <div className="border-t border-white/[0.05] px-3 pb-3 pt-2 sm:px-4">
        {round === null ? (
          <p className="py-2 text-[11px] font-semibold text-white/45">
            {t("verifyNoRound")}
          </p>
        ) : (
          <>
            <div className="grid">
              <FieldRow label={t("verifyRoundIdLabel")} value={roundId} />
              <FieldRow label={t("verifyNonceLabel")} value={nonce} />
              <FieldRow
                label={t("verifyCommitmentLabel")}
                value={commitment}
              />
              <FieldRow label={t("verifyServerSeedLabel")} value={seed} />
              <FieldRow
                label={t("verifyCrashPointLabel")}
                value={
                  round.crash_point_multiplier != null
                    ? formatMultiplier(round.crash_point_multiplier)
                    : null
                }
              />
            </div>

            <p className="mt-2 text-[10px] font-semibold leading-snug text-white/40">
              {t("verifyHowTo")}
            </p>

            {canVerify ? (
              <button
                type="button"
                onClick={() => void handleVerify()}
                className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-brand)]/35 bg-[var(--color-brand)]/12 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/55"
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                {t("verifyButton")}
              </button>
            ) : (
              <p className="mt-2.5 rounded-lg border border-sky-400/25 bg-sky-500/[0.07] px-3 py-2 text-[11px] font-semibold leading-snug text-sky-100/90">
                {t("verifyWaiting")}
              </p>
            )}

            {result.kind !== "idle" ? (
              <p
                role="status"
                className={cn(
                  "mt-2 flex items-start gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold leading-snug",
                  result.kind === "match" &&
                    "border border-[var(--color-brand)]/35 bg-[var(--color-brand)]/10 text-[var(--color-brand)]",
                  (result.kind === "mismatch" || result.kind === "error") &&
                    "border border-[var(--color-pink)]/40 bg-[var(--color-pink)]/10 text-[var(--color-pink)]",
                )}
              >
                {result.kind === "match" ? (
                  <Check className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                ) : (
                  <X className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                )}
                <span>
                  {result.kind === "match"
                    ? t("verifyMatch")
                    : result.kind === "mismatch"
                      ? t("verifyMismatch")
                      : t("verifyError")}
                </span>
              </p>
            ) : null}
          </>
        )}
      </div>
    </details>
  );
}
