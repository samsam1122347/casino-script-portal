"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import {
  Headset,
  MessageCircle,
  SendHorizonal,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { subscribeSupportInquiryWithTicket } from "@/lib/realtime/supportSubscription";
import {
  readSupportThread,
  shortSupportChatRef,
  writeSupportThread,
} from "@/lib/supportThreadStorage";
import { useSupportChat } from "./SupportChatContext";

type ChatMessage = {
  id: string;
  role: "user" | "agent";
  text: string;
  createdAt: number;
  /** Staff display name when the message is from support (API / realtime). */
  agentName?: string | null;
};

type ApiThreadMsg = {
  id?: unknown;
  body?: unknown;
  is_from_admin?: unknown;
  admin_name?: unknown;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function mapRoleFromApi(row: ApiThreadMsg): ChatMessage | null {
  const id =
    typeof row.id === "string" && row.id.trim() !== "" ? row.id : makeId();
  const body = typeof row.body === "string" ? row.body : "";
  if (body === "") return null;
  const fromStaff = row.is_from_admin === true;
  const adminName =
    typeof row.admin_name === "string" && row.admin_name.trim() !== ""
      ? row.admin_name.trim()
      : null;
  const at =
    typeof (row as { created_at?: unknown }).created_at === "string"
      ? Date.parse((row as { created_at: string }).created_at)
      : Date.now();
  return {
    id,
    role: fromStaff ? "agent" : "user",
    text: body,
    createdAt: Number.isFinite(at) ? at : Date.now(),
    agentName: fromStaff ? adminName : undefined,
  };
}

async function hydrateFromServer(apply: (rows: ChatMessage[]) => void) {
  const cred = readSupportThread();
  if (!cred) {
    return;
  }
  const url = new URL("/api/support/thread", window.location.origin);
  url.searchParams.set("inquiry_id", cred.inquiryId);
  url.searchParams.set("subscribe_token", cred.subscribeToken);
  const res = await fetch(url.toString(), { credentials: "same-origin" });
  if (!res.ok) {
    return;
  }
  const payload = (await res.json()) as {
    messages?: unknown;
    initial_message?: unknown;
    request_id?: unknown;
  };

  if (typeof payload.request_id === "string" && payload.request_id.trim() !== "") {
    const cred = readSupportThread();
    if (cred) {
      writeSupportThread({ ...cred, requestId: payload.request_id.trim() });
    }
  }

  const list = Array.isArray(payload.messages) ? payload.messages : [];
  const mapped = list
    .map((m) =>
      typeof m === "object" && m !== null ? mapRoleFromApi(m as ApiThreadMsg) : null,
    )
    .filter(Boolean) as ChatMessage[];

  if (mapped.length === 0) {
    const im =
      typeof payload.initial_message === "string"
        ? payload.initial_message.trim()
        : "";
    if (im === "") {
      return;
    }
    mapped.push({
      id: "initial-sync",
      role: "user",
      text: im,
      createdAt: Date.now() - 1,
    });
  }

  apply(mapped);
}

export function LiveChatPanel() {
  const t = useTranslations("liveChat");
  const { open, setOpen } = useSupportChat();
  const inputId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suppressIdleRef = useRef(false);
  const seenBroadcastIdsRef = useRef(new Set<string>());

  const greetingBubble = useMemo(
    (): ChatMessage => ({
      id: "__greeting__",
      role: "agent",
      text: t("greeting"),
      createdAt: 0,
    }),
    [t],
  );

  // State holds only real thread messages — the greeting is derived in render, so
  // it never needs an effect to keep it pinned (and can't trigger cascading renders).
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [draft, setDraft] = useState("");
  const [persisting, setPersisting] = useState(false);
  const [relayAck, setRelayAck] = useState(false);
  const [relayError, setRelayError] = useState(false);

  /** Bumps realtime subscription wiring after minting ticket credentials */
  const [threadEpoch, bumpThreadEpoch] = useState(0);

  /** Short public code for this chat (from `request_id`); helps users quote the session to staff. */
  const [chatRefCode, setChatRefCode] = useState<string | null>(null);

  const syncChatRefFromStorage = useCallback(() => {
    const c = readSupportThread();
    setChatRefCode(c?.requestId ? shortSupportChatRef(c.requestId) : null);
  }, []);

  const scrollToEnd = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    syncChatRefFromStorage();
    if (!readSupportThread()) {
      return;
    }
    void hydrateFromServer((rows) => {
      setMessages(sortByCreated(rows));
      syncChatRefFromStorage();
    });
  }, [open, threadEpoch, syncChatRefFromStorage]);

  useEffect(() => {
    if (open) {
      scrollToEnd();
      const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [open, scrollToEnd]);

  useEffect(() => {
    if (open) scrollToEnd();
  }, [messages, persisting, open, scrollToEnd]);

  useEffect(() => {
    if (!relayError) return;
    const hid = window.setTimeout(() => setRelayError(false), 8000);
    return () => window.clearTimeout(hid);
  }, [relayError]);

  useEffect(() => {
    if (!relayAck) return;
    const hid = window.setTimeout(() => setRelayAck(false), 7000);
    return () => window.clearTimeout(hid);
  }, [relayAck]);

  useEffect(() => {
    if (!open) return;
    suppressIdleRef.current = false;
    const idle = window.setTimeout(() => {
      if (suppressIdleRef.current) return;
      setMessages((prev) => {
        if (suppressIdleRef.current) return prev;
        const users = prev.filter((m) => m.role === "user");
        if (users.length > 0 || persisting) return prev;
        return [
          ...prev,
          {
            id: makeId(),
            role: "agent",
            text: t("nudgeIdle"),
            createdAt: Date.now(),
          },
        ];
      });
    }, 26000);

    return () => window.clearTimeout(idle);
  }, [open, persisting, t]);

  useEffect(() => {
    if (!open) return;
    const cred = readSupportThread();
    if (!cred) return;

    const realtime = subscribeSupportInquiryWithTicket(
      cred.inquiryId,
      cred.subscribeToken,
      (evt) => {
        if (!evt.id || seenBroadcastIdsRef.current.has(evt.id)) return;
        seenBroadcastIdsRef.current.add(evt.id);
        setMessages((prev) => [
          ...prev,
          {
            id: evt.id,
            role: "agent",
            text: evt.body,
            agentName:
              typeof evt.admin_name === "string" && evt.admin_name.trim() !== ""
                ? evt.admin_name.trim()
                : null,
            createdAt:
              evt.created_at && Date.parse(evt.created_at)
                ? Date.parse(evt.created_at)
                : Date.now(),
          },
        ]);
      },
    );

    const pollMs = 15000;
    const pollId = window.setInterval(() => {
      void hydrateFromServer((rows) => {
        setMessages(sortByCreated(rows));
        syncChatRefFromStorage();
      });
    }, pollMs);

    return () => {
      realtime?.disconnect();
      window.clearInterval(pollId);
    };
  }, [open, threadEpoch, syncChatRefFromStorage]);

  const persistLine = useCallback(async (trimmed: string): Promise<boolean> => {
    const client_message_id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : makeId();

    const stored = readSupportThread();

    let res: Response;
    const baseBody: Record<string, string> = { message: trimmed };
    baseBody.client_message_id = client_message_id;

    if (stored !== null) {
      res = await fetch("/api/support/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          inquiry_id: stored.inquiryId,
          subscribe_token: stored.subscribeToken,
          ...baseBody,
        }),
      });
    } else {
      res = await fetch("/api/support/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(baseBody),
      });

      if (res.ok) {
        const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        if (
          typeof json.inquiry_id === "string" &&
          typeof json.subscribe_token === "string"
        ) {
          writeSupportThread({
            inquiryId: json.inquiry_id,
            subscribeToken: json.subscribe_token,
            requestId:
              typeof json.request_id === "string" && json.request_id.trim() !== ""
                ? json.request_id.trim()
                : undefined,
          });
          bumpThreadEpoch((e) => e + 1);
          syncChatRefFromStorage();
        }
      }
    }

    return res.ok;
  }, [bumpThreadEpoch, syncChatRefFromStorage]);

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || persisting) return;

      suppressIdleRef.current = true;

      const localId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : makeId();

      setRelayAck(false);
      setRelayError(false);

      setMessages((prev) => [
        ...prev,
        {
          id: localId,
          role: "user",
          text: trimmed,
          createdAt: Date.now(),
        },
      ]);
      setDraft("");
      setPersisting(true);

      try {
        const ok = await persistLine(trimmed);
        if (!ok) {
          setRelayError(true);
          return;
        }
        setRelayAck(true);
        setRelayError(false);
        if (readSupportThread()) {
          void hydrateFromServer((rows) => {
            setMessages(sortByCreated(rows));
            syncChatRefFromStorage();
          });
        }
      } catch {
        setRelayError(true);
      } finally {
        setPersisting(false);
      }
    },
    [persisting, persistLine, syncChatRefFromStorage],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendText(draft);
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setRelayAck(false);
        setRelayError(false);
      }}
    >
      {open ? (
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-[2px]" />
          <DialogPrimitive.Content
            className={cn(
              "fixed z-[125] flex flex-col overflow-hidden bg-[var(--color-panel)] shadow-[var(--shadow-chrome)] outline-none",
              "ring-1 ring-white/12",
              "inset-x-0 bottom-0 max-h-[min(580px,88dvh)] w-full rounded-t-2xl",
              "sm:inset-x-auto sm:bottom-24 sm:right-5 sm:left-auto sm:top-auto sm:h-[min(520px,calc(100dvh-7rem))] sm:max-h-[min(580px,calc(100dvh-7rem))] sm:w-[min(400px,calc(100vw-2.5rem))] sm:rounded-2xl",
            )}
          >
            <DialogPrimitive.Title className="sr-only">{t("title")}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              {t("subtitle")}
            </DialogPrimitive.Description>
            <header className="relative shrink-0 border-b border-white/[0.07] bg-gradient-to-r from-[var(--color-bg-elevated)] to-[var(--color-panel)] px-4 py-3.5 pr-14">
              <div className="flex items-start gap-3" aria-hidden="true">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-soft)] ring-1 ring-[var(--color-brand)]/30">
                  <Headset className="h-5 w-5 text-[var(--color-brand)]" aria-hidden />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="font-display text-base font-extrabold tracking-[-0.03em] text-white">
                    {t("title")}
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-[var(--color-text-muted)]">
                    {t("subtitle")}
                  </p>
                  {chatRefCode ? (
                    <p
                      className="mt-1 text-[10px] font-mono font-bold tracking-[0.04em] text-[var(--color-text-dim)]"
                      dir="ltr"
                    >
                      {t("referenceCode", { code: chatRefCode })}
                    </p>
                  ) : null}
                  <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-brand)]">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brand)] opacity-40" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-brand)]" />
                    </span>
                    {t("online")}
                  </p>
                </div>
              </div>
              <DialogPrimitive.Close
                className="absolute right-3 top-3 grid size-10 place-items-center rounded-xl text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </header>

            <div
              ref={listRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
            >
              {[greetingBubble, ...messages].map((m) => {
                const showAgentLabel = m.role === "agent" && m.id !== "__greeting__";
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex",
                      m.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "flex max-w-[min(100%,280px)] flex-col",
                        m.role === "user" ? "items-end" : "items-start",
                      )}
                    >
                      {showAgentLabel ? (
                        <span
                          className="mb-1 text-[10px] font-extrabold uppercase tracking-wide text-[var(--color-text-muted)]"
                          dir="auto"
                        >
                          {m.agentName
                            ? t("fromNamedAgent", { name: m.agentName })
                            : t("fromSupport")}
                        </span>
                      ) : null}
                      <div
                        className={cn(
                          "rounded-2xl px-3.5 py-2.5 text-sm font-medium leading-relaxed shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
                          m.role === "user"
                            ? "rounded-br-md bg-[var(--color-brand)] text-[var(--color-brand-dark)]"
                            : "rounded-bl-md bg-[var(--color-bg-elevated)] text-[var(--color-text)] ring-1 ring-white/[0.06]",
                        )}
                      >
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              {persisting ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-[var(--color-bg-elevated)] px-3.5 py-2.5 text-xs font-bold text-[var(--color-text-muted)] ring-1 ring-white/[0.06]">
                    <MessageCircle className="h-3.5 w-3.5 animate-pulse text-[var(--color-brand)]" />
                    {t("typing")}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="shrink-0 space-y-2 border-t border-white/[0.06] bg-[var(--color-bg)]/90 px-3 py-3 backdrop-blur-md">
              {relayError ? (
                <p className="rounded-lg border border-[var(--color-pink)]/35 bg-[var(--color-pink)]/10 px-2.5 py-1.5 text-[10px] font-bold leading-snug text-[var(--color-pink)]">
                  {t("relayFailed")}
                </p>
              ) : null}
              {relayAck ? (
                <p className="rounded-lg bg-[var(--color-brand-soft)]/50 px-2.5 py-1.5 text-[10px] font-bold leading-snug text-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/20">
                  {t("syncedNotice")}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="soft"
                  size="sm"
                  className="rounded-full font-extrabold"
                  onClick={() => void sendText(t("quickDeposit"))}
                  disabled={persisting}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("quickDeposit")}
                </Button>
                <Button
                  type="button"
                  variant="soft"
                  size="sm"
                  className="rounded-full font-extrabold"
                  onClick={() => void sendText(t("quickWithdraw"))}
                  disabled={persisting}
                >
                  {t("quickWithdraw")}
                </Button>
                <Button
                  type="button"
                  variant="soft"
                  size="sm"
                  className="rounded-full font-extrabold"
                  onClick={() => void sendText(t("quickBonus"))}
                  disabled={persisting}
                >
                  {t("quickBonus")}
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <label htmlFor={inputId} className="sr-only">
                  Message
                </label>
                <textarea
                  id={inputId}
                  ref={inputRef}
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendText(draft);
                    }
                  }}
                  placeholder={t("placeholder")}
                  autoComplete="off"
                  disabled={persisting}
                  className={cn(
                    "max-h-28 min-h-[44px] w-full resize-none rounded-xl border border-[var(--color-line)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-sm font-medium text-white",
                    "placeholder:font-medium placeholder:text-[var(--color-text-dim)]",
                    "focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20",
                  )}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-xl"
                  disabled={!draft.trim() || persisting}
                  aria-label={t("send")}
                >
                  <SendHorizonal className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      ) : null}
    </DialogPrimitive.Root>
  );
}

function sortByCreated(rows: ChatMessage[]): ChatMessage[] {
  return [...rows].sort((a, b) => a.createdAt - b.createdAt);
}
