import React from "react";
import PaymentSuccess from "../components/PaymentSuccess";
import {
  readResultPayloadFromStorage,
  clearResultPayload,
  ResultPayload,
} from "../utils/navigation";

export default function ResultPage() {
  const [payload, setPayload] = React.useState<ResultPayload | null>(null);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const mock = (url.searchParams.get("mock") || "").toLowerCase();

    // 1) Nếu có mock=success -> tạo payload ảo để test
    if (mock === "success") {
      const fake: ResultPayload = {
        ui: "success",
        orderId: "ORDER-MOCK-12345",
        packageName: "Premium 180",
        amount: 199000,
        currency: "VND",
        paidAt: new Date().toISOString(),
      };

      try {
        sessionStorage.setItem("mb_result_payload", JSON.stringify(fake));
      } catch {}

      // gắn vào history.state để flow FE cũng giống thật
      const state = { __mb: "mb_result_payload", payload: fake };
      window.history.replaceState(state, "", url.toString());
      setPayload(fake);
      console.log("[ResultPage][MOCK] Using fake payload:", fake);
      return;
    }

    // 2) Bình thường: lấy từ history.state trước, rồi fallback sessionStorage
    const statePayload: ResultPayload | null =
      (window.history.state && window.history.state.payload) || null;
    const storePayload = readResultPayloadFromStorage();
    const merged: ResultPayload | null = statePayload || storePayload || null;

    setPayload(merged);
    console.log("[ResultPage] state payload:", merged);

    // (tuỳ chọn) clear sau khi dùng:
    // clearResultPayload();
  }, []);

  // Nếu là luồng FE (hoặc mock success) -> hiển thị UI PaymentSuccess
  if (payload?.ui === "success") {
    return (
      <PaymentSuccess
        orderId={payload.orderId}
        packageName={payload.packageName}
        amount={payload.amount}
        currency={payload.currency || "VND"}
        paidAt={payload.paidAt}
      />
    );
  }

  // Mặc định: trang gọn cho MB/BE
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "system-ui, -apple-system, Arial",
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 700 }}>ok</div>
    </div>
  );
}
