"use client";

import { HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import {
  playCrashSound,
  unlockCrashSounds,
} from "@/lib/game/crashSounds";

export function HowToPlayDialog() {
  const t = useTranslations("crashHowTo");
  const steps = t.raw("steps") as string[];

  return (
    <Dialog
      onOpenChange={(open) => {
        unlockCrashSounds();
        if (!open) {
          playCrashSound("close");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="border border-white/[0.07] bg-white/[0.03] text-[11px] font-extrabold uppercase tracking-[0.14em]">
          <HelpCircle className="h-4 w-4" />
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>
        <ol className="grid gap-3 text-sm font-bold text-[var(--color-text-muted)]">
          {steps.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--color-brand-soft)] text-xs font-extrabold text-[var(--color-brand)]">
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
