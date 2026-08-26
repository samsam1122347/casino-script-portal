"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AnimatedBrandLogo } from "@/components/layout/AnimatedBrandLogo";
import { SITE } from "@/lib/site";

/** Minimal fallback when the locale layout (and NextIntl) did not mount. Copy mirrors `globalError` in messages/en.json. */
const copy = {
  title: "Something went wrong",
  description:
    "We've been notified. Try again, or head back to the home page.",
  tryAgain: "Try again",
} as const;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[var(--color-bg-deep)] text-white antialiased">
        <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[var(--color-bg-deep)] p-6 text-center">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,rgba(255,51,104,0.12),transparent_55%),radial-gradient(ellipse_60%_45%_at_50%_110%,rgba(94,238,220,0.07),transparent_55%)]"
            aria-hidden
          />
          <div className="relative max-w-md">
            <div className="mb-6 flex flex-col items-center gap-3">
              <div className="brand-plinth relative h-16 w-16 overflow-hidden rounded-2xl">
                <AnimatedBrandLogo
                  priority
                  className="absolute inset-0 z-[1] h-full w-full object-cover"
                />
              </div>
              <span className="font-display text-xl font-extrabold leading-none">
                {SITE.name}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold">{copy.title}</h1>
            <p className="mt-3 text-sm opacity-90 sm:text-base">
              {copy.description}
            </p>
            <Button className="mt-6" onClick={reset}>
              {copy.tryAgain}
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
