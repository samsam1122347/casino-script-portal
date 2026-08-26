import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { FloatSupport } from "./FloatSupport";
import { Footer } from "./Footer";
import { NavigationProgress } from "./NavigationProgress";
import { AuthSessionCleanup } from "@/components/auth/AuthSessionCleanup";

import { getSessionUser } from "@/lib/server/session-user";
import { getTranslations } from "next-intl/server";

export async function Shell({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const authed = Boolean(user);
  const ta = await getTranslations("a11y");

  return (
    <div
      className="relative grid min-h-dvh w-full max-w-full grid-cols-1 overflow-x-clip lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)]"
      suppressHydrationWarning
    >
      <NavigationProgress />
      <AuthSessionCleanup />
      <a href="#main" className="skip-link">
        {ta("skipToContent")}
      </a>

      <div className="sticky top-0 hidden h-dvh overflow-y-auto overscroll-contain lg:block">
        <Sidebar authed={authed} />
      </div>

      <div className="relative isolate flex min-w-0 max-w-full flex-col overflow-x-clip before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_75%_55%_at_50%_-8%,rgba(35,243,111,0.06),transparent_58%),radial-gradient(ellipse_65%_80%_at_50%_110%,rgba(138,85,255,0.08),transparent_55%)]">
        <Topbar authed={authed} />
        <main
          id="main"
          className="relative mx-auto w-full max-w-[1320px] overflow-x-clip px-3 pb-32 pt-4 sm:px-5 sm:pt-6 lg:px-5 lg:pb-16 xl:px-7 [--section-space:var(--section-gap)]"
        >
          {children}
          <Footer />
        </main>
      </div>

      <FloatSupport />
      <BottomNav authed={authed} />
    </div>
  );
}
