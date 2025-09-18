// src/components/PaymentSuccess.tsx
import React from "react";

type Props = {
  orderId?: string;
  packageName?: string;
  amount?: number | string;
  currency?: string;
  paidAt?: string; // ISO string hoặc đã format
};

export default function PaymentSuccess({
  orderId,
  packageName,
  amount,
  currency = "VND",
  paidAt,
}: Props) {
  // 👉 Hàm quay về Home
  const backHome = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("view");
    ["orderId", "packageName", "amount", "currency", "paidAt"].forEach((k) =>
      url.searchParams.delete(k)
    );
    window.history.replaceState(null, "", url.toString());
    // Trigger re-render cho App
    window.dispatchEvent(new Event("popstate"));
  };

  // 👉 Hàm đóng WebView (sau này tích hợp SDK MB)
  const closeWebview = () => {
    console.log("[PaymentSuccess] Close WebView (TODO: tích hợp MB SDK)");
    backHome(); // tạm thời behave như backHome
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 16,
        background: "#f7fafc",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        }}
      >
        {/* Check icon */}
        <div
          style={{ display: "grid", placeItems: "center", marginBottom: 16 }}
        >
          <svg
            width="84"
            height="84"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.35" />
            <path
              d="M7 12l3 3 7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 style={{ textAlign: "center", margin: 0 }}>
          Thanh toán thành công
        </h2>
        <p style={{ textAlign: "center", color: "#475569", marginTop: 8 }}>
          Cảm ơn bạn đã sử dụng dịch vụ.
        </p>

        <div
          style={{
            marginTop: 16,
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: 14,
            background: "#fafafa",
          }}
        >
          {packageName && <Row label="Gói dịch vụ" value={packageName} />}
          {amount !== undefined && (
            <Row label="Số tiền" value={`${amount} ${currency}`} />
          )}
          {paidAt && <Row label="Thời gian" value={paidAt} />}
          {orderId && <Row label="Mã giao dịch" value={orderId} />}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginTop: 18,
          }}
        >
          <button onClick={backHome} style={btnStyle({ variant: "secondary" })}>
            Về trang chủ
          </button>
          <button
            onClick={closeWebview}
            style={btnStyle({ variant: "primary" })}
          >
            Đóng
          </button>
        </div>

        <p
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "#64748b",
            textAlign: "center",
          }}
        >
          *Lưu ý: Bạn có thể xem lại lịch sử giao dịch trong ứng dụng.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 8,
        padding: "6px 0",
      }}
    >
      <div style={{ color: "#64748b" }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function btnStyle({ variant }: { variant: "primary" | "secondary" }) {
  return {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid " + (variant === "primary" ? "#0f172a" : "#cbd5e1"),
    background: variant === "primary" ? "#0f172a" : "#ffffff",
    color: variant === "primary" ? "#ffffff" : "#0f172a",
    cursor: "pointer",
  } as React.CSSProperties;
}
