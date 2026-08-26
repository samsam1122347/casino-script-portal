import { cache } from "react";
import type { ApiUser } from "@/lib/types/account";
import { serverLaravelFetch } from "@/lib/server/laravel";

async function loadSessionUser(): Promise<ApiUser | null> {
  try {
    const res = await serverLaravelFetch("/api/v1/auth/me");
    if (!res.ok) return null;
    const data = (await res.json()) as { user?: ApiUser };
    return data.user ?? null;
  } catch {
    return null;
  }
}

export const getSessionUser = cache(loadSessionUser);
