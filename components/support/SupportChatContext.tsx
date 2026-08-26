"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";

const LiveChatPanel = dynamic(
  () => import("./LiveChatPanel").then((m) => ({ default: m.LiveChatPanel })),
  { ssr: false },
);

type SupportChatContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openLiveChat: () => void;
  closeLiveChat: () => void;
};

const SupportChatContext = createContext<SupportChatContextValue | null>(null);

export function SupportChatProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const openLiveChat = useCallback(() => setOpen(true), []);
  const closeLiveChat = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash === "#support") {
        setOpen(true);
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      openLiveChat,
      closeLiveChat,
    }),
    [open, openLiveChat, closeLiveChat],
  );

  return (
    <SupportChatContext.Provider value={value}>
      {children}
      <LiveChatPanel key={locale} />
    </SupportChatContext.Provider>
  );
}

export function useSupportChat() {
  const ctx = useContext(SupportChatContext);
  if (!ctx) {
    throw new Error("useSupportChat must be used within SupportChatProvider");
  }
  return ctx;
}
