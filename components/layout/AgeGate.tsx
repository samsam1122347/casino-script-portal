"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "crashx:age-confirmed";

export function AgeGate() {
  const t = useTranslations("age");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const mountFrame = window.requestAnimationFrame(() => {
      if (!cancelled) setMounted(true);
    });

    let confirmed = false;
    try {
      confirmed = window.localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      // ignore (private mode etc.)
    }

    let openTimer: number | undefined;
    if (!confirmed) {
      openTimer = window.setTimeout(() => setOpen(true), 0);
    }

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(mountFrame);
      if (openTimer !== undefined) window.clearTimeout(openTimer);
    };
  }, []);

  if (!mounted) return null;

  function confirm() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    setOpen(false);
  }

  function leave() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    window.location.href = "https://www.google.com";
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showClose={false}>
        <DialogHeader>
          <span className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("body")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={leave}>
            {t("leave")}
          </Button>
          <Button onClick={confirm}>{t("confirm")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
