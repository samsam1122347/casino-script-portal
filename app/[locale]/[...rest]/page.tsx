import { notFound } from "next/navigation";

/** Catches unknown paths under `[locale]` so the localized `not-found` page renders. */
export default function CatchAllLocale() {
  notFound();
}
