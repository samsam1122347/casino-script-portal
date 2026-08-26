import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileSectionTabs } from "@/components/profile/ProfileSectionTabs";
import { INTERNAL_FROM_HEADER } from "@/lib/auth/constants";
import { safeInternalRedirect } from "@/lib/auth/safe-redirect";
import { ROUTES } from "@/lib/paths";
import { getSessionUser } from "@/lib/server/session-user";

export default async function ProfileLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getSessionUser();

  if (!user) {
    const h = await headers();
    const fallback = `/${locale}${ROUTES.profile}`;
    const rawFrom = h.get(INTERNAL_FROM_HEADER);
    const safeFrom = safeInternalRedirect(rawFrom ?? fallback, fallback);
    redirect(
      `/${locale}${ROUTES.login}?from=${encodeURIComponent(safeFrom)}`,
    );
  }

  return (
    <div className="grid gap-4">
      <ProfileSectionTabs />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
