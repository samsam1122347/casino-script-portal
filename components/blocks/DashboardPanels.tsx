import Image from "next/image";
import {
  CalendarClock,
  Headphones,
  LockKeyhole,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { leaderboardRows, tournamentRows } from "@/lib/data/dashboard";
import { formatMoney } from "@/lib/format";

const trustIcons = [WalletCards, ShieldCheck, LockKeyhole, Headphones];

export async function DashboardPanels() {
  const t = await getTranslations("dashboard");

  const trustItems = [
    { title: t("trustInstantTitle"), body: t("trustInstantBody") },
    { title: t("trustFairTitle"), body: t("trustFairBody") },
    { title: t("trustSecureTitle"), body: t("trustSecureBody") },
    { title: t("trustSupportTitle"), body: t("trustSupportBody") },
  ] as const;

  const tournamentCopy = [
    {
      title: t("tournamentDailyTitle"),
      status: t("tournamentDailyStatus"),
      avatar: tournamentRows[0]!.avatar,
      prize: tournamentRows[0]!.prize,
    },
    {
      title: t("tournamentBattleTitle"),
      status: t("tournamentBattleStatus"),
      avatar: tournamentRows[1]!.avatar,
      prize: tournamentRows[1]!.prize,
    },
    {
      title: t("tournamentWeekendTitle"),
      status: t("tournamentWeekendStatus"),
      avatar: tournamentRows[2]!.avatar,
      prize: tournamentRows[2]!.prize,
    },
  ];

  return (
    <>
      <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <article className="dashboard-shell p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-extrabold text-white">
              {t("leaderboardTitle")}
            </h2>
            <span className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[11px] font-extrabold text-white/62">
              {t("thisWeek")}
            </span>
          </div>
          <ol className="grid gap-2">
            {leaderboardRows.map((row) => (
              <li
                key={row.username}
                className="dashboard-row grid grid-cols-[2rem_auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5"
              >
                <span className="numeric grid size-7 place-items-center rounded-full bg-white/[0.08] text-xs font-extrabold text-white/72">
                  {row.rank}
                </span>
                <Image
                  src={row.avatar}
                  alt=""
                  width={28}
                  height={28}
                  className="size-7 rounded-full object-cover"
                />
                <span className="truncate text-sm font-extrabold text-white/86">
                  {row.username}
                </span>
                <strong className="numeric text-sm font-extrabold text-[var(--color-brand)]">
                  {formatMoney(row.amount)}
                </strong>
              </li>
            ))}
          </ol>
        </article>

        <article className="dashboard-shell p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-extrabold text-white">
              {t("tournamentsTitle")}
            </h2>
            <span className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[11px] font-extrabold text-white/62">
              {t("viewAll")}
            </span>
          </div>
          <div className="grid gap-3">
            {tournamentCopy.map((row) => (
              <div
                key={row.title}
                className="dashboard-row grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3"
              >
                <span className="relative grid size-12 place-items-center overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/[0.12]">
                  <Image
                    src={row.avatar}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-extrabold text-white">
                    {row.title}
                  </h3>
                  <p className="numeric mt-0.5 text-xs font-bold text-white/52">
                    {t("prizePool")}{" "}
                    <b className="text-[var(--color-brand)]">
                      {formatMoney(row.prize)}
                    </b>
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-white/38">
                    <CalendarClock className="h-3 w-3" aria-hidden />
                    {row.status}
                  </p>
                </div>
                <button
                  type="button"
                  className="min-h-10 rounded-xl border border-[var(--color-purple)]/35 bg-[var(--color-purple)]/10 px-4 text-xs font-extrabold text-white transition-colors hover:bg-[var(--color-purple)]/18"
                >
                  {t("join")}
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-shell mt-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map(({ title, body }, i) => {
          const Icon = trustIcons[i]!;
          return (
            <div key={title} className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-[var(--color-brand)]/10 text-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/20">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-extrabold text-white">
                  {title}
                </h3>
                <p className="truncate text-xs font-semibold text-white/45">
                  {body}
                </p>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
