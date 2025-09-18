// src/utils/navigation.ts
const RESULT_STATE_KEY = "mb_result_payload";

function notifyUrlChanged() {
  window.dispatchEvent(new Event("popstate"));
  window.dispatchEvent(new Event("urlchange"));
}

export type ResultPayload = {
  ui?: "success" | "none";
  orderId?: string;
  packageName?: string;
  amount?: number | string;
  currency?: string;
  paidAt?: string;
};

export function navigateToResultShort(payload: ResultPayload = { ui: "none" }) {
  // lưu vào sessionStorage (backup phòng mất history.state)
  try {
    sessionStorage.setItem(RESULT_STATE_KEY, JSON.stringify(payload));
  } catch {}

  // đổi path + đính kèm state (không có query)
  const url = new URL(window.location.href);
  url.pathname = "/mbapp/result";
  window.history.replaceState(
    { __mb: RESULT_STATE_KEY, payload },
    "",
    url.toString()
  );
  notifyUrlChanged();
}

/** Utils hỗ trợ ResultPage đọc lại payload */
export function readResultPayloadFromStorage(): ResultPayload | null {
  try {
    const raw = sessionStorage.getItem(RESULT_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearResultPayload() {
  try {
    sessionStorage.removeItem(RESULT_STATE_KEY);
  } catch {}
}
