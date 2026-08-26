"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  Download,
  Laptop,
  MoreVertical,
  Monitor,
  Share2,
  Smartphone,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { cn } from "@/lib/cn";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function detectPlatform(): "ios" | "android" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/i.test(ua)) return "ios";
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function readStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)");
  const iosStandalone =
    "standalone" in navigator &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return mq.matches || iosStandalone;
}

function subscribeStandalone(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function usePwaStandalone(): boolean {
  return useSyncExternalStore(
    subscribeStandalone,
    readStandalone,
    () => false,
  );
}

function InstallSteps({
  intro,
  steps,
}: {
  intro: string;
  steps: { n: number; body: string; Icon: LucideIcon }[];
}) {
  const IconAccent = steps[0]?.Icon ?? Share2;

  return (
    <div>
      <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-text-dim)]">
        <IconAccent className="h-4 w-4 text-[var(--color-brand)]" aria-hidden />
        {intro}
      </p>
      <div className="mt-3 grid gap-2">
        {steps.map(({ n, body, Icon }) => (
          <div
            key={n}
            className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-black/35 font-mono text-xs font-black text-[var(--color-brand)] ring-1 ring-white/10">
              {n}
            </span>
            <div className="flex min-w-0 gap-2">
              <Icon
                className="mt-0.5 size-5 shrink-0 text-white/65"
                aria-hidden
              />
              <p className="text-sm font-medium leading-relaxed text-[var(--color-text-muted)]">
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const tabMuted =
  "h-10 min-w-0 flex-1 rounded-lg px-2 text-xs font-extrabold sm:px-3 sm:text-[13px] data-[state=active]:bg-white/[0.11] data-[state=active]:text-white data-[state=inactive]:text-white/52 data-[state=active]:ring-1 data-[state=active]:ring-white/12";

export function FooterInstallApp({ className }: { className?: string }) {
  const t = useTranslations("pwa");
  const [open, setOpen] = useState(false);
  const standalone = usePwaStandalone();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installing, setInstalling] = useState(false);
  const [tab, setTab] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const runInstall = useCallback(async () => {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setInstalling(false);
      setDeferred(null);
      setOpen(false);
    }
  }, [deferred]);

  if (standalone) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 text-xs font-bold text-[var(--color-brand)]",
          className,
        )}
      >
        <Check className="h-4 w-4 shrink-0" aria-hidden />
        {t("footerInstalled")}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-brand)]/35 hover:text-[var(--color-brand)]",
          className,
        )}
      >
        <Smartphone className="h-4 w-4 shrink-0" aria-hidden />
        {t("footerLink")}
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setTab(detectPlatform());
        }}
      >
        <DialogContent className="max-h-[min(90dvh,680px)] overflow-y-auto pb-6">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="flex items-center gap-2 pr-10 text-xl">
              <Download
                className="h-7 w-7 shrink-0 text-[var(--color-brand)]"
                aria-hidden
              />
              {t("dialogTitle")}
            </DialogTitle>
            <DialogDescription>{t("dialogSubtitle")}</DialogDescription>
          </DialogHeader>

          <div className="mt-1 rounded-xl border border-white/[0.07] bg-[var(--color-bg-elevated)] p-4">
            <p className="font-display text-sm font-extrabold text-white">
              {t("whyTitle")}
            </p>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-[var(--color-text-muted)]">
              {t("whyBody")}
            </p>
          </div>

          {deferred ? (
            <div className="mt-3 rounded-xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-soft)]/35 p-4 ring-1 ring-[var(--color-brand)]/15">
              <p className="text-sm font-bold text-white">
                {t("browserOfferReady")}
              </p>
              <Button
                type="button"
                variant="primary"
                size="lg"
                block
                className="mt-3 shadow-[0_0_28px_-10px_rgba(0,240,128,0.45)]"
                disabled={installing}
                onClick={() => void runInstall()}
              >
                {installing ? t("installing") : t("installButton")}
              </Button>
            </div>
          ) : (
            <p className="mt-3 text-[13px] font-medium leading-relaxed text-[var(--color-text-dim)]">
              {t("installUnavailableHint")}
            </p>
          )}

          <Tabs
            value={tab}
            onValueChange={(v) =>
              setTab(v as "ios" | "android" | "desktop")
            }
            className="mt-4"
          >
            <TabsList className="flex h-auto w-full flex-wrap gap-1 rounded-xl bg-black/35 p-1 ring-1 ring-white/10">
              <TabsTrigger value="ios" className={tabMuted}>
                {t("tabIos")}
              </TabsTrigger>
              <TabsTrigger value="android" className={tabMuted}>
                {t("tabAndroid")}
              </TabsTrigger>
              <TabsTrigger value="desktop" className={tabMuted}>
                {t("tabDesktop")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ios" className="mt-3">
              <InstallSteps
                intro={t("iosIntro")}
                steps={[
                  { n: 1, Icon: Share2, body: t("iosStep1") },
                  { n: 2, Icon: Smartphone, body: t("iosStep2") },
                  { n: 3, Icon: Check, body: t("iosStep3") },
                ]}
              />
            </TabsContent>

            <TabsContent value="android" className="mt-3">
              <InstallSteps
                intro={t("androidIntro")}
                steps={[
                  { n: 1, Icon: MoreVertical, body: t("androidStep1") },
                  { n: 2, Icon: Smartphone, body: t("androidStep2") },
                  { n: 3, Icon: Check, body: t("androidStep3") },
                ]}
              />
            </TabsContent>

            <TabsContent value="desktop" className="mt-3">
              <InstallSteps
                intro={t("desktopIntro")}
                steps={[
                  { n: 1, Icon: Laptop, body: t("desktopStep1") },
                  { n: 2, Icon: Monitor, body: t("desktopStep2") },
                ]}
              />
            </TabsContent>
          </Tabs>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            block
            className="mt-5 border border-white/[0.08] text-[var(--color-text-muted)] hover:bg-white/[0.06] hover:text-white"
            onClick={() => setOpen(false)}
          >
            {t("close")}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
