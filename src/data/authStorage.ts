export const TOKEN_KEY = "mb_verified_token";
export const USER_KEY = "jba_user_data";

export function setVerifiedToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function getVerifiedToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function clearVerifiedToken() {
  localStorage.removeItem(TOKEN_KEY);
}
// User data storage (object returned from /api/v1/auth/login)
export function setUser(data: any) {
  localStorage.setItem(USER_KEY, JSON.stringify(data));
}
export function getUser(): any | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}
export function clearUser() {
  localStorage.removeItem(USER_KEY);
}
