import type { TenantCryptoAsset } from "@/lib/types/tenant-crypto";
import { tenantSlug } from "@/lib/server/laravel";

export type { TenantCryptoAsset };

/**
 * Loads tenant deposit addresses / limits from Laravel public site config (`crypto_assets`).
 */
export async function getTenantCryptoAssets(): Promise<TenantCryptoAsset[]> {
  const { serverLaravelFetch } = await import("@/lib/server/laravel");

  try {
    const res = await serverLaravelFetch(
      `/api/v1/site/config?tenant=${encodeURIComponent(tenantSlug())}`,
      { next: { revalidate: 120 } },
    );
    if (!res.ok) {
      return [];
    }
    const data = (await res.json()) as { crypto_assets?: unknown };
    if (!Array.isArray(data.crypto_assets)) {
      return [];
    }
    return data.crypto_assets.filter(isTenantCryptoAsset);
  } catch {
    return [];
  }
}

function isTenantCryptoAsset(x: unknown): x is TenantCryptoAsset {
  if (typeof x !== "object" || x === null) {
    return false;
  }
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.symbol === "string" &&
    typeof o.name === "string" &&
    typeof o.network === "string" &&
    typeof o.address === "string"
  );
}
