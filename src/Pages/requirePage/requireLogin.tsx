import React from "react";
import { useLocation, Link } from "react-router-dom";

const RequireLogin: React.FC = () => {
  const location = useLocation() as { state?: { message?: string } };
  const message =
    location.state?.message || "Bạn cần đăng nhập để tiếp tục sử dụng dịch vụ.";

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: 16 }}>
      <div
        role="alert"
        aria-live="polite"
        style={{
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 12,
          padding: 16,
          background: "rgba(255, 235, 230, 0.6)",
        }}
      >
        <strong style={{ display: "block", marginBottom: 8 }}>Thông báo</strong>
        <p style={{ margin: 0 }}>{message}</p>
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <Link
          to="/"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
            textDecoration: "none",
          }}
        >
          Về trang chủ
        </Link>

        <a
          href={(import.meta.env.VITE_LOGIN_URL as string) || "#"}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            textDecoration: "none",
            background: "black",
            color: "white",
          }}
        >
          Đăng nhập lại
        </a>
      </div>
    </div>
  );
};

export default RequireLogin;
