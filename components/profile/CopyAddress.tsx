"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { shortenAddress } from "@/lib/format";

export function CopyAddress({
  address,
  shortenPreview = true,
  onCopy,
}: {
  address: string;
  /** When false, show the full address in the row (still tap Copy for clipboard). */
  shortenPreview?: boolean;
  onCopy?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      if (onCopy) {
        window.setTimeout(() => onCopy(), 2000);
      }
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--color-line)] bg-[#09101f] px-4 py-3 text-left text-sm font-extrabold tabular-nums transition-colors hover:border-[var(--color-brand)]"
    >
      <span
        className={`min-w-0 flex-1 shrink text-left ${shortenPreview ? "truncate" : "break-all whitespace-normal"}`}
      >
        {shortenPreview ? shortenAddress(address, 12, 6) : address}
      </span>
      <span
        className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-panel-3)] px-2.5 py-1 text-xs"
        aria-live="polite"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-[var(--color-brand)]" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy
          </>
        )}
      </span>
    </button>
  );
}
