import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/cn";

export const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn("text-sm font-bold tracking-[-0.01em]", className)}
    {...props}
  />
));
Label.displayName = "Label";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(({ className, type = "text", invalid, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    aria-invalid={invalid ? true : undefined}
    className={cn(
      "h-12 min-h-12 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-bg-elevated)] px-4 text-[16px] font-medium leading-tight text-white transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-[var(--color-text-dim)] sm:text-sm focus:outline-none focus:ring-2",
      invalid
        ? "border-[var(--color-pink)]/70 focus:border-[var(--color-pink)] focus:ring-[var(--color-pink)]/25"
        : "focus:border-[var(--color-brand)] focus:ring-[var(--color-brand)]/20",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(({ className, children, invalid, ...props }, ref) => (
  <select
    ref={ref}
    aria-invalid={invalid ? true : undefined}
    className={cn(
      "h-12 min-h-12 w-full appearance-none rounded-xl border border-[var(--color-line)] bg-[var(--color-bg-elevated)] px-4 text-[16px] font-medium text-white transition-[border-color,box-shadow,background-color] duration-200 focus:outline-none focus:ring-2 sm:text-sm",
      invalid
        ? "border-[var(--color-pink)]/70 focus:border-[var(--color-pink)] focus:ring-[var(--color-pink)]/25"
        : "focus:border-[var(--color-brand)] focus:ring-[var(--color-brand)]/20",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

function isFormControlElement(node: React.ReactNode): node is React.ReactElement<{ invalid?: boolean }> {
  if (!React.isValidElement(node)) return false;
  const t = node.type as { displayName?: string } | string;
  if (typeof t === "string") return false;
  return t.displayName === "Input" || t.displayName === "Select";
}

export function FieldGroup({
  label,
  hint,
  error,
  children,
  className,
  htmlFor,
  labelClassName,
  hintClassName,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  labelClassName?: string;
  hintClassName?: string;
}) {
  const errorId = React.useId();
  let control: React.ReactNode = children;

  if (error && React.Children.count(children) === 1) {
    try {
      const only = React.Children.only(children);
      if (isFormControlElement(only)) {
        const prev = only.props as { "aria-describedby"?: string };
        const mergedDesc = [prev["aria-describedby"], errorId].filter(Boolean).join(" ").trim();
        control = React.cloneElement(only, {
          invalid: true,
          ...(mergedDesc ? { "aria-describedby": mergedDesc } : {}),
        });
      }
    } catch {
      control = children;
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor} className={labelClassName}>
          {label}
        </Label>
        {hint ? (
          <span
            className={cn(
              "numeric text-xs font-bold text-[var(--color-text-muted)]",
              hintClassName,
            )}
          >
            {hint}
          </span>
        ) : null}
      </div>
      {control}
      {error ? (
        <p id={errorId} className="text-xs font-bold text-[var(--color-pink)]" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
