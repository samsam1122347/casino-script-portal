import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  shellClassName,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  shellClassName?: string;
}) {
  return (
    <div
      className={cn(
        "dashboard-shell auth-shell-aurora w-full max-w-[440px] p-px shadow-[0_26px_64px_-32px_rgba(0,0,0,0.75)]",
        shellClassName,
      )}
    >
      <div className="auth-shell-inner rounded-[calc(var(--radius-2xl)-1px)] bg-[color-mix(in_srgb,var(--color-panel)_86%,transparent)] p-[1px] backdrop-blur-md">
        <div className="rounded-[calc(var(--radius-2xl)-2px)] bg-[radial-gradient(ellipse_60%_45%_at_100%_0%,rgba(35,243,111,0.1),transparent_65%),linear-gradient(180deg,rgba(255,255,255,0.07),transparent)] p-6 sm:p-8">
          <h1 className="font-display text-2xl font-extrabold tracking-[-0.035em] text-white sm:text-[28px]">
            {title}
          </h1>
          <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--color-text-muted)]">
            {subtitle}
          </p>
          <div className="mt-8 border-t border-white/[0.07] pt-8">{children}</div>
          {footer ? (
            <div className="mt-8 border-t border-white/10 pt-6">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
