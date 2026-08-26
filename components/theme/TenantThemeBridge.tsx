import { TenantThemeApply } from "./TenantThemeApply";
import { serverLaravelFetch, tenantSlug } from "@/lib/server/laravel";

export async function TenantThemeBridge() {
  let vars: Record<string, string> | null = null;
  try {
    const res = await serverLaravelFetch(
      `/api/v1/site/config?tenant=${encodeURIComponent(tenantSlug())}`,
      { next: { revalidate: 120 } },
    );
    if (res.ok) {
      const data: { theme?: unknown } = await res.json();
      const theme = data.theme;
      if (theme && typeof theme === "object" && !Array.isArray(theme)) {
        vars = theme as Record<string, string>;
      }
    }
  } catch {
    vars = null;
  }

  if (!vars || Object.keys(vars).length === 0) return null;

  return <TenantThemeApply vars={vars} />;
}
