// src/data/authStorage.ts
export interface SessionInfo {
  sessionId: string;
  cif: string;
  fullname: string;
  [k: string]: any;
}

const SESSION_KEY = "MB_SESSION";
const VERIFIED_KEY = "MB_TOKEN_VERIFIED";

export function setSession(session: SessionInfo) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    sessionStorage.setItem(VERIFIED_KEY, "1");
    // 🔔 phát sự kiện để các component (HomeGuard/RequireLogin) re-render
    window.dispatchEvent(new CustomEvent("mb:verified"));
  } catch {}
}

export function getSession(): SessionInfo | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionInfo) : null;
  } catch {
    return null;
  }
}

export function isVerified(): boolean {
  try {
    return sessionStorage.getItem(VERIFIED_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(VERIFIED_KEY);
    // 🔔 phát sự kiện logout
    window.dispatchEvent(new CustomEvent("mb:logout"));
  } catch {}
}

// (nếu bạn còn code cũ)
export const getUser = getSession;
export const setUser = setSession;
