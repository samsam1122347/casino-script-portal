"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { cryptos as allCryptos } from "@/lib/data/crypto";
import type { CryptoCurrency } from "@/lib/types";

export function CryptoSelect({
  value,
  onChange,
  cryptos,
}: {
  value: CryptoCurrency;
  onChange: (next: CryptoCurrency) => void;
  /** When omitted, all UI cryptos from data file are listed. */
  cryptos?: CryptoCurrency[];
}) {
  const options = cryptos ?? allCryptos;
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-14 w-full items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[#09101f] px-3 text-sm font-extrabold transition-colors hover:bg-[var(--color-bg-elevated)]"
        >
          <Image
            src={value.icon}
            alt=""
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <span>{value.name}</span>
          <span className="text-[var(--color-text-muted)]">
            {value.symbol}
          </span>
          <span className="ml-auto flex items-center gap-2">
            <span
              className="rounded-lg border border-[var(--color-brand)]/40 bg-[var(--color-brand)]/15 px-2 py-1 font-mono text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-brand)]"
              title={value.network}
            >
              {value.network}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[320px] overflow-y-auto"
      >
        {options.map((c) => (
          <DropdownMenuItem
            key={`${c.id}:${c.network}`}
            onSelect={() => onChange(c)}
            className="flex items-center gap-3"
          >
            <Image
              src={c.icon}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span>{c.name}</span>
            <span className="text-[var(--color-text-muted)]">{c.symbol}</span>
            <span className="ml-auto text-xs font-bold text-[var(--color-text-dim)]">
              {c.network}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
