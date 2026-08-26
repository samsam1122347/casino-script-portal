import type { Locale } from "../types";
import { routing } from "@/i18n/routing";

const localeMeta: Record<string, Omit<Locale, "code">> = {
  en: { label: "English", flag: "🇬🇧" },
  es: { label: "Español", flag: "🇪🇸" },
  pt: { label: "Português", flag: "🇧🇷" },
  de: { label: "Deutsch", flag: "🇩🇪" },
  fr: { label: "Français", flag: "🇫🇷" },
  tr: { label: "Türkçe", flag: "🇹🇷" },
  ru: { label: "Русский", flag: "🇷🇺" },
  ja: { label: "日本語", flag: "🇯🇵" },
  fa: { label: "فارسی", flag: "🇮🇷" },
};

export const locales: Locale[] = routing.locales.map((code) => ({
  code,
  ...(localeMeta[code] ?? { label: code.toUpperCase(), flag: "🌐" }),
}));

export const defaultLocale = locales[0];
