// src/services/auth.service.ts
import api from "./http";
import { url_verify_user } from "./constants";

export type CustomerInfo = {
  customerId?: string;
  name?: string;
  phone?: string;
};

type VerifyResp = { ok: boolean; customer?: CustomerInfo };

type VerifyMeta = {
  rawQuery?: string;
  rawHash?: string;
  queryParams?: Record<string, string>;
};

const VERIFIED_KEY = "mb_login_token_verified";
const CUSTOMER_KEY = "mb_customer_info";
const TOKEN_KEY = "mb_login_token";

export async function verifyLoginTokenOnceFE(
  loginToken: string,
  meta?: VerifyMeta
): Promise<VerifyResp> {
  const verified = sessionStorage.getItem(VERIFIED_KEY);
  const cached = sessionStorage.getItem(CUSTOMER_KEY);
  if (verified === "1" && cached) {
    try {
      return { ok: true, customer: JSON.parse(cached) as CustomerInfo };
    } catch {
      clearCache();
    }
  }

  try {
    // ✅ gửi JSON thay vì form-data
    const payload = {
      loginToken,
      rawQuery: meta?.rawQuery ?? "",
      rawHash: meta?.rawHash ?? "",
      queryParams: meta?.queryParams ?? {},
    };

    console.log("[auth.service] sending verify payload:", payload);

    const res = await api.post(url_verify_user(), payload, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("[auth.service] response:", res.data);

    const data = (res?.data ?? {}) as VerifyResp;

    if (data?.ok) {
      sessionStorage.setItem(VERIFIED_KEY, "1");
      sessionStorage.setItem(CUSTOMER_KEY, JSON.stringify(data.customer ?? {}));
      sessionStorage.setItem(TOKEN_KEY, loginToken);
    } else {
      clearCache();
    }
    return data;
  } catch (e) {
    clearCache();
    return { ok: false };
  }
}

function clearCache() {
  sessionStorage.removeItem(VERIFIED_KEY);
  sessionStorage.removeItem(CUSTOMER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}
