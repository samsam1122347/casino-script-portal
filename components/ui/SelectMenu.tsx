"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export const SelectMenuRoot = SelectPrimitive.Root;
export const SelectMenuGroup = SelectPrimitive.Group;
export const SelectMenuValue = SelectPrimitive.Value;

export const SelectMenuTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    invalid?: boolean;
  }
>(({ className, invalid, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    aria-invalid={invalid ? true : undefined}
    className={cn(
      "group flex h-12 min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg-elevated)] px-4 text-left text-[15px] font-semibold text-white outline-none transition-[border-color,box-shadow,background-color,transform] duration-200 hover:bg-[color-mix(in_srgb,var(--color-bg-elevated)_88%,white)] focus-visible:ring-2 data-[state=open]:bg-[color-mix(in_srgb,var(--color-bg-elevated)_82%,white)] data-[placeholder]:text-[var(--color-text-dim)] sm:text-sm",
      invalid
        ? "border-[var(--color-pink)]/70 focus-visible:border-[var(--color-pink)] focus-visible:ring-[var(--color-pink)]/25"
        : "focus-visible:border-[var(--color-brand)] focus-visible:ring-[var(--color-brand)]/20 data-[state=open]:border-[var(--color-brand)]/60 data-[state=open]:ring-2 data-[state=open]:ring-[var(--color-brand)]/20",
      className,
    )}
    {...props}
  >
    <span className="min-w-0 flex-1 truncate">{children}</span>
    <SelectPrimitive.Icon asChild>
      <ChevronDown
        className="h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-[var(--color-brand)]"
        aria-hidden
      />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectMenuTrigger.displayName = "SelectMenuTrigger";

export const SelectMenuContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", sideOffset = 8, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      sideOffset={sideOffset}
      className={cn(
        "radix-content z-[140] max-h-[min(60vh,22rem)] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-panel-2)]/95 p-1 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectMenuContent.displayName = "SelectMenuContent";

export const SelectMenuItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-start gap-2 rounded-xl py-2.5 pl-3 pr-9 text-sm font-semibold leading-snug text-white/85 outline-none transition-colors duration-150 hover:bg-white/[0.05] focus:bg-white/[0.07] focus:text-white data-[highlighted]:bg-white/[0.07] data-[highlighted]:text-white data-[state=checked]:bg-[var(--color-brand)]/12 data-[state=checked]:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText className="min-w-0 flex-1">
      {children}
    </SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand)]">
      <Check className="h-4 w-4" aria-hidden />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectMenuItem.displayName = "SelectMenuItem";

type Option = { value: string; label: React.ReactNode };

type SelectMenuProps = {
  id?: string;
  name?: string;
  required?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: Option[];
  invalid?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
  "aria-describedby"?: string;
};

export function SelectMenu({
  id,
  name,
  required,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  options,
  invalid,
  triggerClassName,
  contentClassName,
  ...rest
}: SelectMenuProps) {
  return (
    <SelectPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      required={required}
      name={name}
    >
      <SelectMenuTrigger
        id={id}
        invalid={invalid}
        className={triggerClassName}
        aria-describedby={rest["aria-describedby"]}
      >
        <SelectMenuValue placeholder={placeholder} />
      </SelectMenuTrigger>
      <SelectMenuContent className={contentClassName}>
        {options.map((opt) => (
          <SelectMenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectMenuItem>
        ))}
      </SelectMenuContent>
    </SelectPrimitive.Root>
  );
}
