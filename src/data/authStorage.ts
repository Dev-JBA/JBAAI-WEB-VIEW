export const TOKEN_KEY = "mb_verified_token";

export function setVerifiedToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function getVerifiedToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function clearVerifiedToken() {
  localStorage.removeItem(TOKEN_KEY);
}
