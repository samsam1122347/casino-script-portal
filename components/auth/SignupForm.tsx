"use client";

import { KeyRound, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/paths";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/Input";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { AuthCard } from "./AuthCard";
import { resetAuthSessionProbe } from "@/lib/auth/sessionProbe";
import { RECOVERY_QUESTION_KEYS } from "@/lib/auth/recovery-question-keys";
import { flattenApiErrors } from "@/lib/auth/flatten-api-errors";
import { toast } from "@/lib/toast-bus";

export function SignupForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const t = useTranslations("auth");
  const tTop = useTranslations("topbar");
  const [pending, setPending] = useState(false);
  const [terms, setTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [recoveryDistinctError, setRecoveryDistinctError] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [remoteMessage, setRemoteMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [recoveryQuestions, setRecoveryQuestions] = useState<[string, string, string]>([
    "",
    "",
    "",
  ]);

  function setRecoveryQuestion(idx: 0 | 1 | 2, value: string) {
    setRecoveryQuestions((prev) => {
      const next = [...prev] as [string, string, string];
      next[idx] = value;
      return next;
    });
    if (recoveryDistinctError) setRecoveryDistinctError(false);
  }

  const loginHref =
    redirectTo !== ROUTES.home
      ? `${ROUTES.login}?from=${encodeURIComponent(redirectTo)}`
      : ROUTES.login;

  const questionOptions = useMemo(
    () =>
      RECOVERY_QUESTION_KEYS.map((key) => ({
        key,
        label: t(`recoveryQuestions.${key}`),
      })),
    [t],
  );

  function recoveryFieldError(kind: "q" | "a", idx: number) {
    const base = kind === "q" ? "recovery_question_keys" : "recovery_answers";
    return fieldErrors[`${base}.${idx}`] ?? fieldErrors[`${base}_${idx}`];
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const pw = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirmPassword") ?? "");
    setTermsError(false);
    setMismatch(false);

    if (pw !== confirm) {
      setMismatch(true);
      return;
    }
    if (!terms) {
      setTermsError(true);
      return;
    }

    const keys = recoveryQuestions;
    if (keys.some((k) => !k) || new Set(keys).size !== 3) {
      setRecoveryDistinctError(true);
      return;
    }
    setRecoveryDistinctError(false);

    setErrorKey(null);
    setRemoteMessage(null);
    setFieldErrors({});
    setPending(true);

    const body = {
      username: String(fd.get("username") ?? "").trim().toLowerCase(),
      password: pw,
      password_confirmation: confirm,
      recovery_question_keys: keys,
      recovery_answers: [
        String(fd.get("recovery_a1") ?? "").trim(),
        String(fd.get("recovery_a2") ?? "").trim(),
        String(fd.get("recovery_a3") ?? "").trim(),
      ],
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });

      const json = (await res.json().catch(() => ({}))) as {
        message?: string;
        errors?: Record<string, string[] | string>;
      };

      const fe = flattenApiErrors(json.errors);

      if (!res.ok) {
        if (Object.keys(fe).length) setFieldErrors(fe);
        if (typeof json.message === "string" && json.message.trim()) {
          setRemoteMessage(json.message.trim());
        } else if (Object.keys(fe).length === 0) {
          setErrorKey("registrationFailed");
        }
        setPending(false);
        return;
      }

      resetAuthSessionProbe();
      toast({
        variant: "success",
        title: t("toastSignupTitle"),
        description: t("toastSignupDescription"),
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
    if (errorKey === "registrationFailed") return t("registrationFailed");
    if (errorKey === "networkError") return t("networkError");
    return null;
  }

  const summary = errorCopy();
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const showAlert = summary || hasFieldErrors;

  return (
    <AuthCard
      title={t("signupTitle")}
      subtitle={t("signupSubtitle")}
      shellClassName="max-w-[min(520px,calc(100vw-2rem))]"
      footer={
        <p className="text-center text-sm font-bold text-[var(--color-text-muted)]">
          {t("hasAccount")}{" "}
          <Link
            href={loginHref}
            className="text-[var(--color-brand)] underline-offset-4 hover:text-[var(--color-brand-soft)] hover:underline"
          >
            {tTop("login")}
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

        <div className="rounded-2xl bg-[var(--color-bg-elevated)] p-5 ring-1 ring-white/[0.06]">
          <div className="flex gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-soft)] ring-1 ring-[var(--color-brand)]/25">
              <KeyRound className="h-5 w-5 text-[var(--color-brand)]" aria-hidden />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="font-display text-sm font-extrabold tracking-[-0.02em] text-white">
                {t("signupSectionAccountTitle")}
              </p>
              <p className="mt-1 text-xs font-medium leading-relaxed text-[var(--color-text-muted)]">
                {t("signupSectionAccountDesc")}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4">
            <FieldGroup
              label={t("username")}
              htmlFor="signup-username"
              hint={t("usernameHint")}
              error={fieldErrors.username}
            >
              <Input
                id="signup-username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder={t("usernamePlaceholder")}
                pattern="[a-zA-Z0-9_]{3,24}"
                minLength={3}
                maxLength={24}
                required
              />
            </FieldGroup>
            <FieldGroup label={t("password")} htmlFor="signup-password" error={fieldErrors.password}>
              <Input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </FieldGroup>
            <FieldGroup
              label={t("confirmPassword")}
              htmlFor="signup-confirm"
              error={
                mismatch
                  ? t("passwordMismatch")
                  : fieldErrors.password_confirmation ?? fieldErrors.confirmPassword
              }
            >
              <Input
                id="signup-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </FieldGroup>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-bg-elevated)] p-5 ring-1 ring-white/[0.06]">
          <div className="flex gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-soft)] ring-1 ring-[var(--color-brand)]/25">
              <Shield className="h-5 w-5 text-[var(--color-brand)]" aria-hidden />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="font-display text-sm font-extrabold tracking-[-0.02em] text-white">
                {t("recoverySectionTitle")}
              </p>
              <p className="mt-1 text-xs font-medium leading-relaxed text-[var(--color-text-muted)]">
                {t("recoverySectionSub")}
              </p>
            </div>
          </div>
          {recoveryDistinctError ? (
            <p className="mt-3 text-xs font-bold text-[var(--color-pink)]" role="status">
              {t("recoveryQuestionsDistinct")}
            </p>
          ) : null}
          <div className="mt-5 grid gap-4">
            {([1, 2, 3] as const).map((n) => {
              const idx = (n - 1) as 0 | 1 | 2;
              const selected = recoveryQuestions[idx];
              const taken = new Set(recoveryQuestions.filter((_, i) => i !== idx && _));
              return (
              <div
                key={n}
                className="grid gap-3 border-t border-white/10 pt-4 first:border-t-0 first:pt-0"
              >
                <FieldGroup
                  label={t("recoveryQuestionNumber", { n })}
                  htmlFor={`recovery-q-${n}`}
                  error={recoveryFieldError("q", idx)}
                >
                  <SelectMenu
                    id={`recovery-q-${n}`}
                    name={`recovery_q${n}`}
                    required
                    value={selected || undefined}
                    onValueChange={(v) => setRecoveryQuestion(idx, v)}
                    placeholder={t("recoveryPickQuestion")}
                    invalid={Boolean(recoveryFieldError("q", idx))}
                    options={questionOptions
                      .filter(({ key }) => key === selected || !taken.has(key))
                      .map(({ key, label }) => ({ value: key, label }))}
                  />
                </FieldGroup>
                <FieldGroup
                  label={t("recoveryAnswerLabel")}
                  htmlFor={`recovery-a-${n}`}
                  error={recoveryFieldError("a", n - 1)}
                >
                  <Input
                    id={`recovery-a-${n}`}
                    name={`recovery_a${n}`}
                    type="text"
                    autoComplete="off"
                    placeholder={t("recoveryAnswerPlaceholder")}
                    required
                    minLength={2}
                    maxLength={128}
                  />
                </FieldGroup>
              </div>
              );
            })}
          </div>
        </div>

        <div
          className={`rounded-2xl bg-[var(--color-bg-elevated)] p-4 ring-1 ring-white/[0.06] ${
            termsError ? "ring-[var(--color-pink)]/45" : ""
          }`}
        >
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="terms"
              checked={terms}
              onChange={(e) => {
                setTerms(e.target.checked);
                if (e.target.checked) setTermsError(false);
              }}
              aria-invalid={termsError ? true : undefined}
              className="mt-1 size-[1.125rem] shrink-0 rounded border border-[var(--color-line)] bg-[var(--color-bg)] accent-[var(--color-brand)]"
            />
            <span className="text-xs font-bold leading-snug text-[var(--color-text-muted)]">
              {t("termsLabel")}{" "}
              <Link
                href={ROUTES.responsibleGaming}
                className="text-[var(--color-brand)] underline-offset-4 hover:underline"
              >
                {t("readPolicy")}
              </Link>
            </span>
          </label>
          {termsError ? (
            <p className="mt-3 pl-[calc(1.125rem+0.75rem)] text-xs font-bold text-[var(--color-pink)]">
              {t("termsRequired")}
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" block disabled={pending}>
          {pending ? "…" : t("submitSignup")}
        </Button>
      </form>
    </AuthCard>
  );
}
