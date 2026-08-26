"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

export function ChangePasswordCard() {
  const t = useTranslations("profile.settings.passwordForm");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const valid =
    currentPassword.trim().length > 0 &&
    password.length >= 8 &&
    password === passwordConfirmation;

  async function onSubmit() {
    setSaving(true);
    setError(null);
    setDone(false);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        message?: string;
        errors?: Record<string, string[]>;
      };

      if (!res.ok) {
        const fromErrors = payload.errors?.current_password?.[0];
        setError(fromErrors ?? payload.message ?? t("genericError"));
        return;
      }

      setDone(true);
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
    } catch {
      setError(t("networkError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-lg font-extrabold tracking-tight">
        {t("heading")}
      </h2>
      <p className="mt-1 text-sm font-bold text-[var(--color-text-muted)]">
        {t("sub")}
      </p>

      <FieldGroup label={t("current")} htmlFor="pwd-cur" className="mt-5">
        <Input
          id="pwd-cur"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </FieldGroup>

      <FieldGroup label={t("next")} htmlFor="pwd-new" className="mt-4">
        <Input
          id="pwd-new"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FieldGroup>

      <FieldGroup label={t("confirm")} htmlFor="pwd-confirm" className="mt-4">
        <Input
          id="pwd-confirm"
          type="password"
          autoComplete="new-password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
        />
      </FieldGroup>

      {error ? (
        <p
          className="mt-3 rounded-xl border border-[var(--color-pink)]/40 bg-[var(--color-pink)]/10 px-3 py-2 text-sm font-bold text-[var(--color-pink)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {done ? (
        <p
          className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-200"
          role="status"
        >
          {t("success")}
        </p>
      ) : null}

      <Button
        className={cn("mt-5")}
        disabled={!valid || saving}
        size="lg"
        onClick={onSubmit}
      >
        {saving ? t("saving") : t("submit")}
      </Button>
    </Card>
  );
}
