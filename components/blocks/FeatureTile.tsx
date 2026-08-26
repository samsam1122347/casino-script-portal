import type { ReactNode } from "react";

export function FeatureTile({
  icon,
  title,
  body,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  subtitle?: string;
}) {
  return (
    <article className="rounded-2xl bg-[var(--color-panel)] p-5">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
        {icon}
      </span>
      <h2 className="h4 mt-3">{title}</h2>
      {subtitle ? (
        <span className="numeric mt-1 block text-sm font-bold text-[var(--color-text-muted)]">
          {subtitle}
        </span>
      ) : null}
      <p className="mt-2 text-sm font-medium text-[var(--color-text-muted)]">{body}</p>
    </article>
  );
}
