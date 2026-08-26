"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { resetAuthSessionProbe } from "@/lib/auth/sessionProbe";
import { toast } from "@/lib/toast-bus";

export function LogoutForm({
  className,
  variant = "icon",
}: {
  className?: string;
  variant?: "icon" | "labeled";
}) {
  const router = useRouter();
  const t = useTranslations("topbar");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function onLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      resetAuthSessionProbe();
      const res = await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        throw new Error(`Logout failed (${res.status})`);
      }
      router.refresh();
      router.push("/");
    } catch {
      toast({
        variant: "destructive",
        title: t("logoutFailedTitle"),
        description: t("logoutFailedDescription"),
      });
      setIsLoggingOut(false);
    }
  }

  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className={`inline-flex w-full items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 text-sm font-bold text-white/85 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-wait disabled:opacity-65 ${className ?? ""}`}
      >
        {isLoggingOut ? (
          <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-[var(--color-brand)]" aria-hidden />
        ) : (
          <LogOut className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
        )}
        <span>{isLoggingOut ? t("loggingOut") : t("logout")}</span>
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`shrink-0 text-[var(--color-text-muted)] hover:text-white disabled:cursor-wait disabled:opacity-65 ${className ?? ""}`}
      onClick={onLogout}
      aria-label={t("logout")}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <LoaderCircle className="h-5 w-5 animate-spin text-[var(--color-brand)]" />
      ) : (
        <LogOut className="h-5 w-5" />
      )}
    </Button>
  );
}
