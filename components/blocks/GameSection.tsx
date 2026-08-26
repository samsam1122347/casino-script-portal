import { getTranslations } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/paths";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { IconName, Game } from "@/lib/types";
import { cn } from "@/lib/cn";
import { GameCard } from "./GameCard";
import { LandingGridVideo } from "@/components/blocks/LandingGridVideo";

export async function GameSection({
  icon,
  title,
  games,
  viewHref,
  columns = 7,
  heroVideo,
}: {
  icon?: IconName;
  title: string;
  games?: Game[];
  viewHref?: string;
  columns?: 5 | 6 | 7 | 8;
  /** Single full-width clip instead of the originals grid (e.g. Play Crash home rail). */
  heroVideo?: { src: string; poster: string };
}) {
  const tHome = await getTranslations("home");
  const tCard = await getTranslations("gameCard");
  const tGames = await getTranslations("gamesCatalog");
  const playCta = tHome("crashCtaButton");
  const originalsLine = tHome("originalsBadge");

  if (heroVideo) {
    const target = viewHref ?? ROUTES.crash;
    return (
      <section className="dashboard-shell mt-4 overflow-hidden p-0">
        <SectionHeader
          icon={icon}
          title={title}
          className="mb-0 border-b border-white/[0.06] px-4 py-3.5 sm:px-5 sm:py-4"
        />
        <Link
          href={target}
          className="group relative isolate block w-full overflow-hidden"
          aria-label={`${title}. ${playCta}`}
        >
          <div className="relative h-36 w-full bg-black sm:h-40 md:h-44 lg:h-48">
            <LandingGridVideo
              src={heroVideo.src}
              poster={heroVideo.poster}
              priority
              className="transition-transform duration-500 ease-out group-hover:scale-[1.015]"
            />
          </div>
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 px-4 pb-3.5 pt-10 sm:px-5 sm:pb-4">
            <div className="min-w-0 pb-0.5">
              <p className="truncate font-display text-[1.0625rem] font-extrabold tracking-tight text-white sm:text-lg">
                {title}
              </p>
              <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.22em] text-white/42 sm:text-[10px]">
                {originalsLine}
              </p>
            </div>
            <span
              className="pointer-events-none inline-flex h-10 shrink-0 items-center gap-0.5 rounded-full bg-[var(--color-brand)] pl-4 pr-1 text-[var(--color-brand-dark)] shadow-[inset_0_1px_0_rgba(255,255,255,0.34),0_12px_32px_-10px_rgba(35,243,111,0.55)] sm:h-11 sm:pl-5 sm:pr-1 sm:text-[13px]"
              aria-hidden
            >
              <span className="max-w-[9.5rem] truncate whitespace-nowrap pl-1 text-[11px] font-extrabold tracking-[-0.02em] sm:max-w-none sm:text-[13px]">
                {playCta}
              </span>
              <span className="grid size-8 place-items-center self-center rounded-full bg-black/22 sm:size-9">
                <ChevronRight
                  className="size-[1.0625rem] text-[var(--color-brand-dark)] opacity-95 sm:size-[18px]"
                  strokeWidth={2.75}
                  aria-hidden
                />
              </span>
            </span>
          </div>
        </Link>
      </section>
    );
  }

  const list = games ?? [];
  if (!list.length) return null;

  const colsClass =
    columns === 5
      ? "lg:grid-cols-5"
      : columns === 6
        ? "lg:grid-cols-6"
        : columns === 8
          ? "lg:grid-cols-8"
          : "lg:grid-cols-7";

  return (
    <section className="dashboard-shell mt-4 p-4 sm:p-5">
      <SectionHeader icon={icon} title={title} href={viewHref} />
      <div
        className={cn(
          "gap-3",
          "max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:scroll-px-4 max-sm:overflow-x-auto max-sm:pb-1 max-sm:[scrollbar-width:none] [&::-webkit-scrollbar]:max-sm:hidden",
          "sm:grid sm:grid-cols-3 md:grid-cols-4",
          colsClass,
        )}
      >
        {list.map((game) => (
          <div
            key={game.id}
            className="max-sm:w-[46%] max-sm:min-w-[10rem] max-sm:flex-none max-sm:snap-start"
          >
            <GameCard
              game={{
                ...game,
                title: tGames(game.id),
              }}
              playCta={playCta}
              originalsLine={originalsLine}
              hotLabel={tCard("badgeHot")}
              newLabel={tCard("badgeNew")}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
