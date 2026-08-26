import * as React from "react";
import { cn } from "@/lib/cn";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { padded?: boolean }
>(({ className, padded = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "dashboard-card",
      padded && "p-5 sm:p-6",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardElevated = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "dashboard-card bg-[var(--color-bg-elevated)] p-5 sm:p-6",
      className,
    )}
    {...props}
  />
));
CardElevated.displayName = "CardElevated";

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between gap-3", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-extrabold tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-sm font-semibold text-[var(--color-text-muted)]",
        className,
      )}
      {...props}
    />
  );
}
