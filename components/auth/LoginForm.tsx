"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/paths";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/Input";
import { AuthCard } from "./AuthCard";
import { resetAuthSessionProbe } from "@/lib/auth/sessionProbe";
import { flattenApiErrors } from "@/lib/auth/flatten-api-errors";
import { toast } from "@/lib/toast-bus";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const t = useTranslations("auth");
  const tTop = useTranslations("topbar");
  const [pending, setPending] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [remoteMessage, setRemoteMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const signupHref =
    redirectTo !== ROUTES.home
      ? `${ROUTES.signup}?from=${encodeURIComponent(redirectTo)}`
      : ROUTES.signup;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorKey(null);
    setRemoteMessage(null);
    setFieldErrors({});
    setPending(true);
    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          username: String(fd.get("username") ?? "").trim(),
          password: String(fd.get("password") ?? ""),
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        message?: string;
        errors?: Record<string, string[] | string>;
      };

      const fe = flattenApiErrors(payload.errors);

      if (!res.ok) {
        if (Object.keys(fe).length) setFieldErrors(fe);
        if (typeof payload.message === "string" && payload.message.trim()) {
          setRemoteMessage(payload.message.trim());
        } else if (
          Object.keys(fe).length === 0 &&
          (typeof payload.message !== "string" || !payload.message.trim())
        ) {
          setErrorKey(
            res.status === 422 || res.status === 401 ? "invalidCredentials" : "generic",
          );
        }
        setPending(false);
        return;
      }

      resetAuthSessionProbe();
      toast({
        variant: "success",
        title: t("toastLoginTitle"),
        description: t("toastLoginDescription"),
      });
      router.push(redirectTo);
      router.refresh();
    } catch {
      setErrorKey("networkError");
    }
    setPending(false);
  }

  function errorCopy(): string | null {
    if (remoteMessage) return remoteMessage;
    if (errorKey === "invalidCredentials") return t("invalidCredentials");
    if (errorKey === "networkError") return t("networkError");
    if (errorKey === "generic") return t("sessionError");
    return null;
  }

  const summary = errorCopy();
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const showAlert = summary || hasFieldErrors;

  return (
    <AuthCard
      title={t("loginTitle")}
      subtitle={t("loginSubtitle")}
      footer={
        <p className="text-center text-sm font-bold text-[var(--color-text-muted)]">
          {t("noAccount")}{" "}
          <Link
            href={signupHref}
            className="text-[var(--color-brand)] underline-offset-4 hover:text-[var(--color-brand-soft)] hover:underline"
          >
            {tTop("signup")}
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-5" noValidate>
        {showAlert ? (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-2xl border border-[var(--color-pink)]/40 bg-[var(--color-pink)]/[0.08] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            {summary ? (
              <p className="text-sm font-bold leading-snug text-[var(--color-pink)]">{summary}</p>
            ) : null}
            {hasFieldErrors ? (
              <p className="mt-1.5 text-xs font-semibold leading-relaxed text-white/85">
                {t("formErrorsHint")}
              </p>
            ) : null}
          </div>
        ) : null}
        <FieldGroup label={t("username")} htmlFor="login-username" error={fieldErrors.username}>
          <Input
            id="login-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder={t("usernamePlaceholder")}
            required
            minLength={3}
            maxLength={24}
          />
        </FieldGroup>
        <FieldGroup label={t("password")} htmlFor="login-password" error={fieldErrors.password}>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            minLength={8}
          />
        </FieldGroup>
        <div className="flex justify-end">
          <Link
            href={ROUTES.forgotPassword}
            className="rounded-lg px-1 py-0.5 text-xs font-extrabold text-[var(--color-text-muted)] underline-offset-4 hover:text-[var(--color-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/35"
          >
            {t("forgotPassword")}
          </Link>
        </div>
        <Button type="submit" size="lg" block disabled={pending}>
          {pending ? "…" : t("submitLogin")}
        </Button>
      </form>
    </AuthCard>
  );
}
