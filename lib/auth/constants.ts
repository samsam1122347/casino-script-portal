/** HttpOnly Sanctum token set by `/api/auth/login` and `/api/auth/register`. */
export const SESSION_COOKIE_NAME = "crashx_session";

/** Set by `portal/proxy.ts` on each request; pathname + search from the incoming URL (trusted). */
export const INTERNAL_FROM_HEADER = "x-crashx-from";
