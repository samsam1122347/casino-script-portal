"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, FieldGroup } from "@/components/ui/Input";
import { CryptoSelect } from "./CryptoSelect";
import { cryptos } from "@/lib/data/crypto";
import type { CryptoCurrency } from "@/lib/types";
import type { TenantCryptoAsset } from "@/lib/types/tenant-crypto";
import { assets } from "@/lib/assets";
import { cn } from "@/lib/cn";
import { formatMoney, formatMoneyCompact } from "@/lib/format";

type WithdrawPanelProps = {
  apiAssets: TenantCryptoAsset[];
  /** Playable USD balance from session (whole dollars + cents → minor upstream). */
  balanceMinor?: number | null;
};

function cryptoKey(c: Pick<CryptoCurrency, "id" | "network">): string {
  return `${c.id}:${c.network}`;
}

function mergeDisplayCrypto(api: TenantCryptoAsset): CryptoCurrency | null {
  const base =
    cryptos.find((c) => c.id === api.id) ??
    cryptos.find((c) => c.symbol === api.symbol.toUpperCase());
  const minUsd =
    typeof api.min_withdraw_usd === "number" ? api.min_withdraw_usd : 10;

  if (!base) {
    return {
      id: api.id,
      symbol: api.symbol,
      name: api.name,
      network: api.network,
      icon: cryptos[0].icon,
      minDeposit: minUsd,
    };
  }

  return {
    ...base,
    id: api.id,
    minDeposit: minUsd,
    network: api.network || base.network,
    supportedNetworks: base.supportedNetworks,
  };
}

/** Parse user USD input to ledger minor units; empty / invalid → null. */
function usdInputToMinor(raw: string): number | null {
  const cleaned = raw.trim().replace(/,/g, "");
  if (cleaned === "") {
    return null;
  }
  const v = Number(cleaned);
  if (!Number.isFinite(v) || v <= 0) {
    return null;
  }
  const minor = Math.round(v * 100);
  return minor < 1 ? null : minor;
}

export function WithdrawPanel({ apiAssets, balanceMinor }: WithdrawPanelProps) {
  const t = useTranslations("profile.withdraw");
  const router = useRouter();

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
    return list;
  }, [apiAssets]);

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

  const [address, setAddress] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const minMinorWhole = display ? Math.round(display.minDeposit * 100) : 1000;

  const amountMinorParsed = useMemo(() => usdInputToMinor(amountUsd), [amountUsd]);

  const insufficient =
    amountMinorParsed != null &&
    balanceMinor != null &&
    amountMinorParsed > balanceMinor;

  const valid =
    display !== null &&
    address.trim().length >= 8 &&
    amountMinorParsed != null &&
    amountMinorParsed >= minMinorWhole &&
    !insufficient;

  async function onSubmit() {
    if (!display || amountMinorParsed == null) {
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    const idempotencyKey =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          crypto_asset_id: display.id,
          destination_address: address.trim(),
          amount_minor: amountMinorParsed,
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        message?: string;
        min_amount_minor?: number;
        max_amount_minor?: number;
      };

      if (!res.ok) {
        setError(
          payload.message ??
            t("errorGeneric", { status: String(res.status) }),
        );
        return;
      }

      setSuccess(t("successMessage"));
      setAmountUsd("");
      setAddress("");
      router.refresh();
    } catch {
      setError(t("networkError"));
    } finally {
      setSubmitting(false);
    }
  }

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
  const balanceMajor =
    balanceMinor != null ? balanceMinor / 100 : null;

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
          <span className="mt-2 block text-xs font-bold text-[var(--color-text-muted)]">
            {t("cryptoOnlySub")}
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

        <p className="mt-4 rounded-xl bg-[var(--color-panel)] p-3 text-xs font-bold leading-relaxed text-[var(--color-text-muted)]">
          {t("usdRailNote", { symbol: display.symbol, network: display.network })}
        </p>

        <FieldGroup
          label={t("addressLabel")}
          hint={t("addressHint", { network: active?.network ?? display.network })}
          htmlFor="wd-addr"
          className="mt-5"
        >
          <Input
            id="wd-addr"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t("addressPlaceholder", { symbol: display.symbol })}
            spellCheck={false}
            autoComplete="off"
          />
        </FieldGroup>

        <FieldGroup
          label={t("amountUsdLabel")}
          hint={t("amountUsdHint", {
            min: formatMoney(display.minDeposit),
            balance:
              balanceMajor != null ? formatMoneyCompact(balanceMajor) : "—",
          })}
          htmlFor="wd-amt"
          className="mt-4"
        >
          <Input
            id="wd-amt"
            type="text"
            inputMode="decimal"
            value={amountUsd}
            onChange={(e) => setAmountUsd(e.target.value)}
            placeholder="0.00"
          />
        </FieldGroup>

        {error ? (
          <p
            className="mt-3 rounded-xl border border-[var(--color-pink)]/40 bg-[var(--color-pink)]/10 px-3 py-2 text-sm font-bold text-[var(--color-pink)]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {success ? (
          <p
            className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-200"
            role="status"
          >
            {success}
          </p>
        ) : null}

        {insufficient ? (
          <p className="mt-2 text-sm font-bold text-[var(--color-pink)]">
            {t("insufficient")}
          </p>
        ) : null}

        <Button
          block
          size="lg"
          className="mt-5"
          disabled={!valid || submitting}
          onClick={onSubmit}
        >
          <span className={cn(submitting && "opacity-80")}>
            {submitting ? t("submitting") : t("submit")}
          </span>
        </Button>
      </div>

      <div className="grid place-items-center rounded-2xl bg-[var(--color-bg-elevated)] p-6 text-center sm:p-8">
        <Image
          src={assets.hero.noMore}
          alt=""
          width={483}
          height={342}
          sizes="220px"
          className="opacity-90"
          style={{ width: 220, height: "auto" }}
        />
        <h3 className="mt-3 text-lg font-extrabold tracking-tight">
          {t("asideTitle")}
        </h3>
        <p className="mt-1 max-w-[40ch] text-sm font-bold text-[var(--color-text-muted)]">
          {t("asideBody")}
        </p>
      </div>
    </Card>
  );
}
