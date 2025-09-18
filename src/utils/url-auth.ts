// src/utils/url-auth.ts
import { useAuthStore } from "../store/auth";
import { verifyLoginTokenOnceFE } from "../services/auth.service";

export async function bootstrapLoginTokenAndVerifyFE() {
  const url = new URL(window.location.href);
  const loginToken = url.searchParams.get("loginToken") || "";

  const { setLoginToken, setVerified, setCustomer } = useAuthStore.getState();

  // Không có token -> không verify, reset state rồi trả về
  if (!loginToken) {
    setLoginToken(null);
    setVerified(false);
    setCustomer(null);
    return { ok: false };
  }

  setLoginToken(loginToken);

  try {
    const rawQuery = url.search.startsWith("?")
      ? url.search.slice(1)
      : url.search;
    const rawHash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const res = await verifyLoginTokenOnceFE(loginToken, {
      rawQuery,
      rawHash,
      queryParams,
    });
    setVerified(!!res.ok);
    setCustomer(res.ok ? res.customer ?? null : null);
    return res;
  } catch (e) {
    setVerified(false);
    setCustomer(null);
    return { ok: false, error: String(e) };
  }
}
