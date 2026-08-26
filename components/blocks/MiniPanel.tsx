import { cn } from "@/lib/cn";

export function MiniPanel({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "neutral" | "danger" | "success";
  hint?: string;
}) {
  return (
    <div className="rounded-2xl bg-[var(--color-panel)] p-5">
      <span className="eyebrow block">{label}</span>
      <strong
        className={cn(
          "font-display mt-3 block text-xl font-extrabold leading-snug tracking-[-0.03em]",
          tone === "danger" && "text-[var(--color-pink)]",
          tone === "success" && "text-[var(--color-brand)]",
        )}
      >
        {value}
      </strong>
      {hint ? (
        <span className="mt-1 block text-xs font-medium text-[var(--color-text-dim)]">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
