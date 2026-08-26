"use client";

import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/paths";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/Input";
import { AuthCard } from "./AuthCard";
import { flattenApiErrors } from "@/lib/auth/flatten-api-errors";

type Step = "username" | "answers" | "password" | "done";

type RecoveryQuestion = {
  key: string;
};

type ApiPayload = {
  message?: string;
  errors?: Record<string, string[] | string>;
  challenge_id?: string;
  questions?: RecoveryQuestion[];
  reset_token?: string;
};

async function postJson(path: string, body: unknown): Promise<ApiPayload> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => ({}))) as ApiPayload;
  if (!res.ok) {
    const err = new Error(json.message ?? "Request failed") as Error & {
      payload?: ApiPayload;
    };
    err.payload = json;
    throw err;
  }

  return json;
}

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [questions, setQuestions] = useState<RecoveryQuestion[]>([]);
  const [answersByKey, setAnswersByKey] = useState<Record<string, string>>({});
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [remoteMessage, setRemoteMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function resetErrors() {
    setRemoteMessage(null);
    setFieldErrors({});
  }

  function applyError(error: unknown, fallback: string) {
    const payload =
      error instanceof Error && "payload" in error
        ? (error as Error & { payload?: ApiPayload }).payload
        : undefined;
    const flattened = flattenApiErrors(payload?.errors);
    setFieldErrors(flattened);
    setRemoteMessage(payload?.message ?? (Object.keys(flattened).length ? null : fallback));
  }

  async function onUsernameSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    resetErrors();
    setPending(true);

    try {
      const data = await postJson("/api/auth/forgot-password/challenge", {
        username: username.trim().toLowerCase(),
      });
      const nextQuestions = data.questions ?? [];
      setChallengeId(data.challenge_id ?? "");
      setQuestions(nextQuestions);
      setAnswersByKey(Object.fromEntries(nextQuestions.map((question) => [question.key, ""])));
      setStep("answers");
    } catch (error) {
      applyError(error, t("forgotPasswordGenericError"));
    } finally {
      setPending(false);
    }
  }

  async function onAnswersSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    resetErrors();

    const answers = questions.map((question) => ({
      question_key: question.key,
      answer: (answersByKey[question.key] ?? "").trim(),
    }));

    if (answers.some((answer) => answer.answer.length < 2)) {
      setRemoteMessage(t("forgotPasswordAnswersIncomplete"));
      return;
    }

    setPending(true);
    try {
      const data = await postJson("/api/auth/forgot-password/verify", {
        challenge_id: challengeId,
        answers,
      });
      setResetToken(data.reset_token ?? "");
      setStep("password");
    } catch (error) {
      applyError(error, t("forgotPasswordGenericError"));
    } finally {
      setPending(false);
    }
  }

  async function onPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    resetErrors();

    if (password !== passwordConfirmation) {
      setFieldErrors({ password_confirmation: t("passwordMismatch") });
      return;
    }

    setPending(true);
    try {
      await postJson("/api/auth/forgot-password/reset", {
        reset_token: resetToken,
        password,
        password_confirmation: passwordConfirmation,
      });
      setStep("done");
    } catch (error) {
      applyError(error, t("forgotPasswordGenericError"));
    } finally {
      setPending(false);
    }
  }

  const showAlert = remoteMessage || Object.keys(fieldErrors).length > 0;

  if (step === "done") {
    return (
      <AuthCard
        title={t("forgotPasswordSuccessTitle")}
        subtitle={t("forgotPasswordSuccessBody")}
        footer={
          <p className="text-center text-sm font-bold text-[var(--color-text-muted)]">
            <Link href={ROUTES.login} className="text-[var(--color-brand)] hover:underline">
              {t("backToLogin")}
            </Link>
          </p>
        }
      >
        <Button asChild size="lg" block>
          <Link href={ROUTES.login}>{t("forgotPasswordBackToLogin")}</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t("forgotPasswordTitle")}
      subtitle={t("forgotPasswordBody")}
      shellClassName="max-w-[min(520px,calc(100vw-2rem))]"
      footer={
        <p className="text-center text-sm font-bold text-[var(--color-text-muted)]">
          <Link href={ROUTES.login} className="text-[var(--color-brand)] hover:underline">
            {t("backToLogin")}
          </Link>
        </p>
      }
    >
      <form
        onSubmit={
          step === "username"
            ? onUsernameSubmit
            : step === "answers"
              ? onAnswersSubmit
              : onPasswordSubmit
        }
        className="grid gap-5"
        noValidate
      >
        <div className="rounded-2xl bg-[var(--color-bg-elevated)] p-5 ring-1 ring-white/[0.06]">
          <div className="flex gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-soft)] ring-1 ring-[var(--color-brand)]/25">
              <ShieldCheck className="h-5 w-5 text-[var(--color-brand)]" aria-hidden />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="font-display text-sm font-extrabold tracking-[-0.02em] text-white">
                {t("forgotPasswordStepTitle")}
              </p>
              <p className="mt-1 text-xs font-medium leading-relaxed text-[var(--color-text-muted)]">
                {t("forgotPasswordStepBody")}
              </p>
            </div>
          </div>
        </div>

        {showAlert ? (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-2xl border border-[var(--color-pink)]/40 bg-[var(--color-pink)]/[0.08] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            {remoteMessage ? (
              <p className="text-sm font-bold leading-snug text-[var(--color-pink)]">
                {remoteMessage}
              </p>
            ) : null}
            {Object.keys(fieldErrors).length ? (
              <p className="mt-1.5 text-xs font-semibold leading-relaxed text-white/85">
                {t("formErrorsHint")}
              </p>
            ) : null}
          </div>
        ) : null}

        {step === "username" ? (
          <FieldGroup
            label={t("username")}
            htmlFor="forgot-username"
            hint={t("usernameHint")}
            error={fieldErrors.username ?? fieldErrors.answers}
          >
            <Input
              id="forgot-username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("usernamePlaceholder")}
              minLength={3}
              maxLength={24}
              required
            />
          </FieldGroup>
        ) : null}

        {step === "answers"
          ? questions.map((question, index) => (
              <FieldGroup
                key={question.key}
                label={t(`recoveryQuestions.${question.key}`)}
                htmlFor={`forgot-answer-${question.key}`}
                hint={t("recoveryQuestionNumber", { n: index + 1 })}
                error={
                  fieldErrors[`answers.${index}.answer`] ??
                  fieldErrors[`answers.${index}.question_key`] ??
                  fieldErrors.answers
                }
              >
                <Input
                  id={`forgot-answer-${question.key}`}
                  name={`answer_${question.key}`}
                  type="text"
                  autoComplete="off"
                  value={answersByKey[question.key] ?? ""}
                  onChange={(e) =>
                    setAnswersByKey((prev) => ({
                      ...prev,
                      [question.key]: e.target.value,
                    }))
                  }
                  placeholder={t("recoveryAnswerPlaceholder")}
                  minLength={2}
                  maxLength={128}
                  required
                />
              </FieldGroup>
            ))
          : null}

        {step === "password" ? (
          <>
            <FieldGroup label={t("newPassword")} htmlFor="forgot-password" error={fieldErrors.password}>
              <Input
                id="forgot-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                required
              />
            </FieldGroup>
            <FieldGroup
              label={t("confirmPassword")}
              htmlFor="forgot-password-confirmation"
              error={fieldErrors.password_confirmation}
            >
              <Input
                id="forgot-password-confirmation"
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                required
              />
            </FieldGroup>
          </>
        ) : null}

        <Button type="submit" size="lg" block disabled={pending}>
          {pending
            ? "…"
            : step === "username"
              ? t("forgotPasswordContinue")
              : step === "answers"
                ? t("forgotPasswordVerifyAnswers")
                : t("forgotPasswordResetSubmit")}
        </Button>
      </form>
    </AuthCard>
  );
}
