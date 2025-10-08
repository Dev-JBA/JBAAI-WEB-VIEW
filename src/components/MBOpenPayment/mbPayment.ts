export type MBPaymentData = {
  merchant: { code: string; name: string };
  type: { code: string; name: string; allowCard: boolean };
  id: string; // <=45
  amount: number; // integer >= 0
  description: string; // <=200
  successMessage?: string;
};

export function openMBPaymentScreen(data: MBPaymentData) {
  const msg = { type: "PAYMENT_HUB_TRANSACTION" as const, data };
  const rn = (window as any).ReactNativeWebView;
  if (rn?.postMessage) {
    rn.postMessage(JSON.stringify(msg));
  } else {
    console.log("[DEV MODE] Would send payload:", msg);
    window.dispatchEvent(
      new CustomEvent("MB_PAYMENT_DEBUG_SENT", { detail: msg })
    );
    alert("DEV MODE: payload đã log ra console.");
  }
}
