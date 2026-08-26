import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import type { Game } from "@/lib/types";
import { cn } from "@/lib/cn";

export function GameCard({
  game,
  playCta,
  originalsLine,
  hotLabel = "Hot",
  newLabel = "New",
}: {
  game: Game;
  playCta: string;
  originalsLine: string;
  hotLabel?: string;
  newLabel?: string;
}) {
  return (
    <Link
      href={game.href}
      aria-label={`${game.title}: ${playCta}`}
      className={cn(
        "lift group relative isolate block aspect-[3/4] overflow-hidden rounded-2xl",
        "ring-1 ring-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_-28px_rgba(0,0,0,0.9)]",
        "transition-[transform,box-shadow,ring-color] duration-300 hover:-translate-y-0.5 hover:ring-[var(--color-brand)]/35",
      )}
    >
      {/* Unified base — avoids mismatched purple vs empty dark tiles */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,#1c1235_0%,#0f1530_42%,#080d18_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_18%,rgba(124,58,237,0.26),transparent_58%),radial-gradient(ellipse_80%_90%_at_80%_100%,rgba(0,240,128,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(3,8,18,0.92)_0%,rgba(3,8,18,0.45)_38%,transparent_72%)]"
        aria-hidden
      />

      <div className="pointer-events-none absolute left-4 top-4 z-20 flex flex-col gap-1.5 pr-14">
        {game.hot ? <Badge variant="hot">{hotLabel}</Badge> : null}
        {game.isNew ? <Badge variant="new">{newLabel}</Badge> : null}
      </div>

      {/* Art stays inside rounded frame — contain prevents rocket / wide JPEG cropping bugs */}
      <div className="absolute inset-[10%_8%_36%_8%] z-[1]">
        <Image
          src={game.image}
          alt=""
          fill
          sizes="(max-width: 480px) 42vw, (max-width: 1024px) 22vw, 140px"
          className="pointer-events-none object-contain object-center drop-shadow-[0_12px_32px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:scale-[1.04]"
          priority={game.hot === true}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-3 pt-16">
        <div className="rounded-xl border border-white/[0.07] bg-black/55 px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
          <span className="font-display block text-center text-[13px] font-extrabold leading-snug tracking-[-0.03em] text-white sm:text-[14px]">
            {game.title}
          </span>
          <p className="mt-1 text-center text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/52">
            {originalsLine}
          </p>
          <p className="mt-0.5 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-white/38">
            {game.provider}
          </p>

          <span className="mt-2 flex h-9 w-full items-center justify-center gap-1 rounded-lg bg-[var(--color-brand)] text-[11px] font-extrabold tracking-[-0.01em] text-[var(--color-brand-dark)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] transition group-hover:brightness-[1.06] group-active:translate-y-px">
            {playCta}
            <ChevronRight className="h-[1.0625rem] w-[1.0625rem] opacity-90" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
