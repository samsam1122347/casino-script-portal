"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

const sides = {
  left:
    "left-0 top-0 h-dvh max-h-dvh radix-sheet-left touch-pan-y w-[88%] max-w-sm outline-none",
  right:
    "right-0 top-0 h-dvh max-h-dvh radix-sheet-right touch-pan-y w-[88%] max-w-sm outline-none",
} as const;

export const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: keyof typeof sides;
  }
>(({ className, side = "left", children, ...props }, ref) => {
  const t = useTranslations("common");
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="radix-overlay fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-[125] flex min-h-0 flex-col overflow-hidden bg-[var(--color-panel)] shadow-2xl outline-none",
          sides[side],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.75rem,env(safe-area-inset-top))] z-10 grid size-11 place-items-center rounded-xl text-[var(--color-text-muted)] transition-colors hover:bg-white/10 hover:text-white md:size-10"
          aria-label={t("close")}
        >
          <X className="h-6 w-6 md:h-5 md:w-5" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
SheetContent.displayName = "SheetContent";

export const SheetTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-extrabold tracking-tight", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

export const SheetDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm font-medium text-[var(--color-text-muted)]", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";
