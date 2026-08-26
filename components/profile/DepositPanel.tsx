"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AlertTriangle, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { CryptoSelect } from "./CryptoSelect";
import { CopyAddress } from "./CopyAddress";
import { cryptos } from "@/lib/data/crypto";
import type { CryptoCurrency } from "@/lib/types";
import type { TenantCryptoAsset } from "@/lib/types/tenant-crypto";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

type DepositPanelProps = {
  apiAssets: TenantCryptoAsset[];
};

function cryptoKey(c: Pick<CryptoCurrency, "id" | "network">): string {
  return `${c.id}:${c.network}`;
}

/** USDT TRC20 first (tenant default rail), then other assets alpha by symbol/network. */
function compareDepositAssets(a: CryptoCurrency, b: CryptoCurrency): number {
  const rank = (c: CryptoCurrency): number => {
    const sym = c.symbol.toUpperCase();
    const net = c.network.toUpperCase();
    if (sym === "USDT" && net === "TRC20") {
      return 0;
    }
    if (sym === "USDT") {
      return 1;
    }

    return 2;
  };
  const ra = rank(a);
  const rb = rank(b);
  if (ra !== rb) {
    return ra - rb;
  }
  const symCmp = a.symbol.localeCompare(b.symbol);
  if (symCmp !== 0) {
    return symCmp;
  }

  return a.network.localeCompare(b.network);
}

function mergeDisplayCrypto(api: TenantCryptoAsset): CryptoCurrency | null {
  const base =
    cryptos.find((c) => c.id === api.id) ??
    cryptos.find((c) => c.symbol === api.symbol.toUpperCase());
  if (!base) {
    return {
      id: api.id,
      symbol: api.symbol,
      name: api.name,
      network: api.network,
      icon: cryptos[0].icon,
      minDeposit:
        typeof api.min_deposit_usd === "number" ? api.min_deposit_usd : 50,
    };
  }
  const minUsd =
    typeof api.min_deposit_usd === "number"
      ? api.min_deposit_usd
      : base.minDeposit;
  return {
    ...base,
    id: api.id,
    minDeposit: minUsd,
    network: api.network || base.network,
    supportedNetworks: base.supportedNetworks,
  };
}

export function DepositPanel({ apiAssets }: DepositPanelProps) {
  const t = useTranslations("profile.deposit");

  const selectable = useMemo(() => {
    const list: CryptoCurrency[] = [];
    const seen = new Set<string>();
    for (const a of apiAssets) {
      const c = mergeDisplayCrypto(a);
      const dedupeKey = `${a.id}:${a.network}`;
      if (c && a.address.trim() !== "" && !seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        list.push(c);
      }
    }
    list.sort(compareDepositAssets);

    return list;
  }, [apiAssets]);

  /** User pick when valid; `null` means “follow first selectable”. */
  const [pickedKey, setPickedKey] = useState<string | null>(null);

  const defaultKey = selectable[0] ? cryptoKey(selectable[0]) : "";
  const activeKey = useMemo(() => {
    if (
      pickedKey !== null &&
      selectable.some((s) => cryptoKey(s) === pickedKey)
    ) {
      return pickedKey;
    }
    return defaultKey;
  }, [pickedKey, selectable, defaultKey]);

  const assetByNet = useMemo(() => {
    const m = new Map<string, TenantCryptoAsset>();
    apiAssets.forEach((a) => m.set(`${a.id}:${a.network}`, a));
    return m;
  }, [apiAssets]);

  const display =
    selectable.find((c) => cryptoKey(c) === activeKey) ??
    selectable[0] ??
    null;

  /** Same symbol, multiple rails (e.g. USDT on TRC20 + ERC20): switch address by tapping a network. */
  const assetGroupOptions = useMemo(() => {
    if (!display) return [];
    return selectable.filter((c) => c.symbol === display.symbol);
  }, [selectable, display]);

  const showNetworkSwitcher = assetGroupOptions.length > 1;

  if (selectable.length === 0) {
    return (
      <Card className="grid gap-3 p-5 sm:p-6">
        <div className="flex items-start gap-3 rounded-2xl bg-[var(--color-bg-elevated)] p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/30">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">
              {t("noAssetsTitle")}
            </h2>
            <p className="mt-1 text-sm font-bold leading-relaxed text-[var(--color-text-muted)]">
              {t("noAssetsBody")}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!display) {
    return null;
  }

  const active = assetByNet.get(`${display.id}:${display.network}`);
  const address = active?.address?.trim() ?? "";

  return (
    <Card className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-2xl bg-[var(--color-bg-elevated)] p-5 sm:p-6">
        <h2 className="text-lg font-extrabold tracking-tight">
          {t("stepMethodHeading")}
        </h2>
        <div className="mt-4 rounded-2xl border-2 border-[var(--color-brand)] bg-[var(--color-brand-soft)] p-4">
          <span className="flex items-center gap-2 text-base font-extrabold tracking-tight">
            <Wallet className="h-4 w-4" /> {t("cryptoOnly")}
          </span>
        </div>

        <h2 className="mt-6 text-lg font-extrabold tracking-tight">
          {t("stepCurrencyHeading")}
        </h2>
        <div className="mt-3">
          <CryptoSelect
            value={display}
            cryptos={selectable}
            onChange={(next) => setPickedKey(cryptoKey(next))}
          />
        </div>
        <div
          className="mt-4 rounded-2xl border-2 border-[var(--color-brand)]/40 bg-[var(--color-brand)]/8 p-4"
          role="status"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--color-brand)]">
            {t("networkCalloutTitle")}
          </p>
          <p className="mt-2 font-mono text-2xl font-black tracking-tight text-white sm:text-3xl">
            {display.network}
          </p>
          <p className="mt-2 text-sm font-bold leading-relaxed text-white/80">
            {t("networkCalloutBody", {
              symbol: display.symbol,
              network: display.network,
            })}
          </p>
          {showNetworkSwitcher ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-brand)]">
                {t("usdtNetworksTitle")}
              </p>
              <div
                className="mt-3 flex flex-wrap gap-2"
                role="group"
                aria-label={t("usdtNetworksTitle")}
              >
                {assetGroupOptions.map((c) => {
                  const key = cryptoKey(c);
                  const isSelected = key === activeKey;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPickedKey(key)}
                      aria-pressed={isSelected}
                      className={cn(
                        "touch-manipulation rounded-lg border px-3 py-1.5 font-mono text-xs font-black uppercase tracking-wide transition-colors",
                        isSelected
                          ? "border-[var(--color-brand)]/55 bg-[var(--color-brand)]/18 text-[var(--color-brand)] shadow-[0_0_16px_-6px_rgba(0,240,128,0.55)]"
                          : "cursor-pointer border-white/15 bg-white/[0.04] text-white/55 hover:bg-white/[0.08] hover:text-white/85",
                      )}
                    >
                      {c.network}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs font-bold leading-relaxed text-[var(--color-text-muted)]">
                {t("usdtNetworksFootnote", { network: display.network })}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl bg-[var(--color-bg-elevated)] p-5 sm:p-6">
        <header className="-mx-5 -mt-5 flex flex-col gap-3 border-b border-white/5 px-5 py-4 sm:-mx-6 sm:-mt-6 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex flex-wrap items-center gap-2 text-base font-extrabold tracking-tight">
              <Image
                src={display.icon}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6"
              />
              {display.name}
              <span className="text-[var(--color-text-muted)]">
                {display.symbol}
              </span>
            </h2>
            <span className="shrink-0 rounded-lg bg-[var(--color-brand-soft)] px-2.5 py-1 text-xs font-extrabold text-[var(--color-brand)]">
              {t("selectedBadge")}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-sky-400/35 bg-sky-500/10 px-3 py-2.5 text-sm font-bold text-sky-100/95">
            <AlertTriangle
              className="h-4 w-4 shrink-0 text-sky-400"
              aria-hidden
            />
            <span>
              {t("networkSendWarning", {
                symbol: display.symbol,
                network: display.network,
              })}
            </span>
          </div>
        </header>

        <div className="mt-6 min-w-0">
          {address ? (
            <div className="min-w-0 space-y-3">
              <h3 className="text-base font-extrabold tracking-tight">
                {t("stepSendHeading", { symbol: display.symbol })}
              </h3>
              <CopyAddress address={address} shortenPreview={false} />
              <p className="rounded-xl bg-[var(--color-panel)] p-4 text-sm font-bold leading-relaxed text-[var(--color-text-muted)]">
                {t("disclaimerTreasury")}
              </p>
            </div>
          ) : (
            <p className="text-sm font-bold text-[var(--color-text-muted)]">
              {t("missingAddressBody")}
            </p>
          )}
        </div>

        <dl className="mt-5 grid grid-cols-[1fr_auto] gap-y-3 text-base font-extrabold">
          <dt className="text-[var(--color-text-muted)]">
            {t("minDepositLabel")}
          </dt>
          <dd className="text-right tabular-nums">
            {formatMoney(display.minDeposit)}
          </dd>
          <dt className="text-[var(--color-text-muted)]">{t("networkLabel")}</dt>
          <dd className="text-right">
            <span className="inline-block rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-sm font-black uppercase tracking-wide text-white">
              {display.network}
            </span>
          </dd>
        </dl>
      </div>
    </Card>
  );
}
