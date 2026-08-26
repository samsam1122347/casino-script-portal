import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { footerColumnsForViewer } from "@/lib/nav";
import { assets } from "@/lib/assets";
import { PUBLISHER } from "@/lib/publisher";
import { getSessionUser } from "@/lib/server/session-user";
import { LanguagePicker } from "./LanguagePicker";
import { BrandLockup } from "./BrandLockup";
import { OpenLiveChatButton } from "@/components/support/OpenLiveChatButton";
import { FooterInstallApp } from "@/components/pwa/FooterInstallApp";

export async function Footer() {
  const tRoot = await getTranslations();
  const tFooter = await getTranslations("footer");
  const user = await getSessionUser();
  const authed = Boolean(user);
  const columns = footerColumnsForViewer(authed);
  const year = new Date().getFullYear();

  return (
    <footer className="dashboard-shell mt-8 overflow-hidden p-4 sm:p-6 lg:p-7">
      <div className="grid gap-8 border-b border-[var(--chrome-border)] pb-8 md:grid-cols-2 lg:grid-cols-[1.15fr_repeat(4,minmax(0,1fr))_300px]">
        <div>
          <BrandLockup size="lg" />
          <p className="mt-4 max-w-[32ch] text-sm font-medium leading-relaxed text-[var(--color-text-muted)]">
            The ultimate Crash gaming experience. Play fair. Win big.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["18+", "Secure", "Provably Fair"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/62"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.id}>
            <h4 className="eyebrow mb-4 !text-white">
              {col.id === "profile" && !authed
                ? tFooter("profile.guestHeading")
                : tFooter(`${col.id}.heading`)}
            </h4>
            <ul className="grid gap-3">
              {col.links.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-brand)]"
                  >
                    {tFooter(`${col.id}.${link.id}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div
          id="support"
          className="dashboard-card relative isolate overflow-hidden p-5"
        >
          <h4 className="font-display text-lg font-extrabold tracking-[-0.03em]">
            {tFooter("support.title")}{" "}
            <b className="numeric font-bold text-[var(--color-brand)]">
              {tFooter("support.badge")}
            </b>
          </h4>
          <p className="mt-1 text-sm font-medium text-[var(--color-text-muted)]">
            {tFooter("support.body")}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <OpenLiveChatButton variant="primary" className="h-11" />
          </div>
          <Image
            src={assets.hero.supportGirl}
            alt=""
            width={246}
            height={322}
            sizes="140px"
            className="absolute -right-2 bottom-0 -z-10 opacity-90"
            style={{ width: 140, height: "auto" }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 border-b border-[var(--chrome-border)] py-6 sm:gap-4 md:justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--color-text-dim)]">
          {tFooter("acceptedCryptos")}
        </span>
        <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {[
            { src: assets.crypto.btc, label: "BTC" },
            { src: assets.crypto.eth, label: "ETH" },
            { src: assets.crypto.usdt, label: "USDT" },
            { src: assets.crypto.usdc, label: "USDC" },
            { src: assets.crypto.sol, label: "SOL" },
            { src: assets.crypto.ton, label: "TON" },
            { src: assets.crypto.trx, label: "TRX" },
            { src: assets.crypto.xrp, label: "XRP" },
          ].map((coin) => (
            <li
              key={coin.label}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-white/75"
              title={coin.label}
            >
              <Image
                src={coin.src}
                alt=""
                width={16}
                height={16}
                className="h-4 w-4"
              />
              {coin.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
        <p className="max-w-[58ch] text-xs font-medium text-[var(--color-text-muted)]">
          Provably fair Crash · Instant crypto cash-outs · Curaçao licensed
        </p>
        <div className="flex flex-col items-stretch gap-3 md:max-w-[260px] md:items-end">
          <FooterInstallApp className="md:self-end" />
          <LanguagePicker align="end" />
        </div>
      </div>

      <p className="text-xs font-medium leading-relaxed text-[var(--color-text-muted)]">
        © <span className="numeric">{year}</span> CrashX · All rights reserved ·{" "}
        {tRoot("ageBanner")}{" "}
        · crashx.cc is operated by TechSolutions Group N.V. under a Curaçao
        gaming licence.{" "}
        {tFooter("publisher.prefix")}{" "}
        <a
          href={PUBLISHER.url}
          rel="noopener noreferrer"
          className="font-semibold text-[var(--color-brand)] underline-offset-2 hover:underline"
        >
          {PUBLISHER.name}
        </a>
        {tFooter("publisher.suffix")}
      </p>
    </footer>
  );
}
