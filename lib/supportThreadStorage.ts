/**
 * Guest support conversation credentials stored in sessionStorage so the live chat
 * can resume after navigation. Used by {@link LiveChatPanel} and {@link FloatSupport}.
 */

export const SUPPORT_THREAD_STORAGE_KEY = "crashx_support_thread_v1";

/** Dispatched on `window` after {@link writeSupportThread} (same tab). */
export const SUPPORT_THREAD_UPDATED_EVENT = "crashx-support-thread-updated";

export type SupportThreadCred = {
  inquiryId: string;
  subscribeToken: string;
  /** From Laravel `support_inquiries.request_id` (UUID). */
  requestId?: string;
};

export function readSupportThread(): SupportThreadCred | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SUPPORT_THREAD_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as {
      inquiry_id?: unknown;
      subscribe_token?: unknown;
      request_id?: unknown;
    };
    const inquiryId =
      typeof o.inquiry_id === "string" ? o.inquiry_id.trim() : "";
    const subscribeToken =
      typeof o.subscribe_token === "string" ? o.subscribe_token.trim() : "";
    if (!inquiryId || !subscribeToken) return null;
    const requestId =
      typeof o.request_id === "string" && o.request_id.trim() !== ""
        ? o.request_id.trim()
        : undefined;
    return { inquiryId, subscribeToken, requestId };
  } catch {
    return null;
  }
}

export function writeSupportThread(cred: SupportThreadCred): void {
  const payload: Record<string, string> = {
    inquiry_id: cred.inquiryId,
    subscribe_token: cred.subscribeToken,
  };
  if (cred.requestId) {
    payload.request_id = cred.requestId;
  }
  sessionStorage.setItem(SUPPORT_THREAD_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new Event(SUPPORT_THREAD_UPDATED_EVENT));
}

/** Short code from UUID for display (matches in-chat header). */
export function shortSupportChatRef(requestId: string): string {
  return requestId.replace(/-/g, "").slice(0, 8).toUpperCase();
}
