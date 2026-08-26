"use client";

import * as Toast from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribeToasts, type AppToastInput } from "@/lib/toast-bus";
import { cn } from "@/lib/cn";

type Item = AppToastInput & { id: string };

export function AppToaster() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    return subscribeToasts((incoming) => {
      setItems((prev) => [...prev, incoming]);
    });
  }, []);

  return (
    <Toast.Provider duration={5000} swipeDirection="right">
      {items.map((t) => (
        <Toast.Root
          key={t.id}
          type={t.variant === "destructive" ? "foreground" : "background"}
          onOpenChange={(open) => {
            if (!open) setItems((prev) => prev.filter((x) => x.id !== t.id));
          }}
          className={cn(
            "radix-content relative pointer-events-auto flex max-w-[min(100vw-2rem,22rem)] items-start gap-3 rounded-2xl border p-4 pr-11 shadow-xl outline-none backdrop-blur-md",
            t.variant === "success" &&
              "border-[var(--color-brand)]/40 bg-[#062218]/94 text-white shadow-[0_14px_40px_-14px_rgba(0,240,128,0.35)]",
            t.variant === "destructive" &&
              "border-[var(--color-pink)]/45 bg-[#1a0a11]/94 text-white shadow-[0_14px_40px_-14px_rgba(255,62,118,0.35)]",
            (t.variant === "default" || !t.variant) &&
              "border-white/12 bg-[var(--color-panel-2)]/95 text-white shadow-lg",
          )}
        >
          <div className="min-w-0 flex-1">
            <Toast.Title className="text-sm font-extrabold tracking-tight text-white">
              {t.title}
            </Toast.Title>
            {t.description ? (
              <Toast.Description className="mt-1 text-xs font-semibold leading-relaxed text-white/75">
                {t.description}
              </Toast.Description>
            ) : null}
          </div>
          <Toast.Close
            className="absolute right-3 top-3 rounded-lg p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" aria-hidden />
          </Toast.Close>
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed bottom-0 right-0 z-[200] flex max-h-[100dvh] w-full flex-col gap-3 overflow-y-auto overscroll-contain px-4 pt-16 pb-[calc(6.25rem+env(safe-area-inset-bottom))] max-lg:items-stretch lg:bottom-8 lg:right-6 lg:max-w-[23rem] lg:px-0 lg:pb-8 lg:pt-14" />
    </Toast.Provider>
  );
}
