import { getTranslations } from "next-intl/server";
import { LogIn } from "lucide-react";
import { serverLaravelFetch } from "@/lib/server/laravel";
import { EmptyHistory } from "./EmptyHistory";
import { ROUTES } from "@/lib/paths";
import { formatMoney } from "@/lib/format";

type Row = {
  id: string;
  type: string;
  amount: number;
  meta?: {
    status?: string | null;
    symbol?: string | null;
    network?: string | null;
  } | null;
  created_at?: string | null;
};

export async function TransactionsPanel({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "profile.transactions",
  });

  const res = await serverLaravelFetch(
    "/api/v1/wallet/transactions?per_page=30",
  );

  if (res.status === 401) {
    return (
      <EmptyHistory
        title={t("historyTitle")}
        emptyHeading={t("sessionExpiredHeading")}
        cta={t("sessionExpiredCta")}
        href={ROUTES.login}
        description={t("sessionExpiredDescription")}
        CtaIcon={LogIn}
      />
    );
  }

  if (!res.ok) {
    return (
      <EmptyHistory
        title={t("historyTitle")}
        cta={t("historyCta")}
        href={ROUTES.deposit}
        description={t("historyDescription")}
      />
    );
  }

  const data = (await res.json()) as { data?: Row[] };
  const rows = data.data ?? [];

  if (!rows.length) {
    return (
      <EmptyHistory
        title={t("historyTitle")}
        cta={t("historyCta")}
        href={ROUTES.deposit}
        description={t("emptyHint")}
      />
    );
  }

  function typeLabel(ty: string) {
    switch (ty) {
      case "signup_bonus":
      case "first_deposit_bonus":
        return t("txSignupBonus");
      case "deposit":
        return t("txDeposit");
      case "withdrawal":
      case "withdraw":
      case "withdrawal_refund":
        return t("txWithdrawal");
      case "wager":
      case "bet":
        return t("txWager");
      case "payout":
      case "win":
        return t("txPayout");
      default:
        return t("txOther");
    }
  }

  function statusClass(status: string) {
    switch (status) {
      case "pending":
        return "border-amber-300/25 bg-amber-400/10 text-amber-200";
      case "approved":
      case "processed":
        return "border-emerald-300/25 bg-emerald-400/10 text-emerald-200";
      case "rejected":
        return "border-rose-300/25 bg-rose-400/10 text-rose-200";
      default:
        return "border-white/10 bg-white/[0.04] text-[var(--color-brand)]";
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--color-panel)] shadow-[var(--shadow-card)]">
      <div className="hidden grid-cols-[minmax(0,1fr)_auto_auto] gap-3 border-b border-white/[0.06] px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--color-text-dim)] sm:grid sm:px-6">
        <span>{t("tableType")}</span>
        <span className="text-right">{t("tableAmount")}</span>
        <span className="text-right">{t("tableWhen")}</span>
      </div>
      <ul className="divide-y divide-white/[0.05]">
        {rows.map((row) => {
          const status = row.meta?.status ?? null;
          const when = row.created_at
            ? new Date(row.created_at).toLocaleString(locale, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—";
          return (
            <li
              key={row.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/[0.025] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:px-6"
            >
              <span className="min-w-0">
                <span className="block truncate text-[var(--color-text-muted)]">
                  {typeLabel(row.type)}
                </span>
                {status ? (
                  <span
                    className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] ${statusClass(status)}`}
                  >
                    {status}
                  </span>
                ) : null}
                <span className="numeric mt-0.5 block text-[11px] font-medium text-[var(--color-text-dim)] tabular-nums sm:hidden">
                  {when}
                </span>
              </span>
              <span
                className={`numeric self-center text-right tabular-nums ${row.amount < 0 ? "text-[var(--color-pink)]" : "text-[var(--color-brand)]"}`}
              >
                {row.amount < 0 ? "−" : "+"}
                {formatMoney(Math.abs(row.amount))}
              </span>
              <span className="numeric hidden self-center text-right text-xs font-medium text-[var(--color-text-dim)] tabular-nums sm:block">
                {when}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
