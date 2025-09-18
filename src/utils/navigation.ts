// src/utils/navigation.ts
export function navigateToSuccess({
  orderId,
  packageName,
  amount,
  currency = "VND",
  paidAt,
}: {
  orderId?: string;
  packageName?: string;
  amount?: number | string;
  currency?: string;
  paidAt?: string;
}) {
  const url = new URL(window.location.href);
  url.searchParams.set("view", "success");
  if (orderId) url.searchParams.set("orderId", orderId);
  if (packageName) url.searchParams.set("packageName", packageName);
  if (amount !== undefined) url.searchParams.set("amount", String(amount));
  if (currency) url.searchParams.set("currency", currency);
  if (paidAt) url.searchParams.set("paidAt", paidAt);

  window.history.replaceState(null, "", url.toString());
  window.dispatchEvent(new Event("popstate")); // để App re-render
}
