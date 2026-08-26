"use client";

export type AppToastInput = {
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
};

type Listener = (toast: AppToastInput & { id: string }) => void;

const listeners = new Set<Listener>();

/** Fire-and-forget toast (subscriber is `AppToaster` in `[locale]` layout). */
export function toast(input: AppToastInput): void {
  const payload = {
    ...input,
    variant: input.variant ?? "default",
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `toast-${Date.now()}`,
  };
  for (const cb of listeners) cb(payload);
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
