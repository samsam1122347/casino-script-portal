/** Cleared on login/register/logout so the next Shell mount probes Sanctum again. */
export const AUTH_SESSION_PROBE_KEY = "crashx_auth_session_probe_v1";

export function resetAuthSessionProbe(): void {
  try {
    sessionStorage.removeItem(AUTH_SESSION_PROBE_KEY);
  } catch {
    // noop
  }
}
