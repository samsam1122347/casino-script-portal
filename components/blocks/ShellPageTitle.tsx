import { cn } from "@/lib/cn";

export function ShellPageTitle({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "font-display mb-5 text-3xl font-extrabold leading-tight tracking-[-0.035em] sm:mb-6 sm:text-4xl",
        className,
      )}
    >
      {title}
    </h1>
  );
}
