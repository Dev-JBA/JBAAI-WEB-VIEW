// src/components/main.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";

import Navbar from "./Navbar/Navbar";
import IntroductionBlock from "./IntroductionBlock/IntroductionBlock";
import PricingBlock from "./PricingBlock/PricingBlock";
import UsageGuideBlock from "./UsageGuideBlock/UsageGuideBlock";
import ResultPage from "../Pages/resultPage/result";
import WorkPage from "../Pages/work";
import ContactPage from "../Pages/contact";
import RequireLogin from "../Pages/requirePage/requireLogin";
import MBOpenPaymentPage from "../Pages/MBOpenPaymentPage";
import AccountPayment from "./AccountPayment/AccountPayment";
import { openMBPaymentScreen } from "./MBOpenPayment/mbPayment";
import GlobalTokenCatcher from "./GlobalTokenCatcher";
import { getSession, isVerified } from "../data/authStorage";
import VerifiedRoute from "../routes/VerifiedRoute";
import InstructionPage from "../Pages/instructionPage/instruction";

(window as any).openMBPaymentScreen = openMBPaymentScreen;

const SHOW_TOKEN_PANEL = true; // tắt khi lên prod nếu cần

/** Phiên đã verify chưa */
function hasValidSession() {
  const s = getSession();
  return isVerified() && !!s && !!s.sessionId;
}

/** Helper đọc điều kiện từ URL + session */
function useAccessGuard() {
  const { search, hash } = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(search);
    const token = (params.get("loginToken") || "").trim();
    const hasToken = token.length > 0;

    const cleanHash = hash ? hash.slice(1) : ""; // bỏ dấu #
    const isMBAppHash = cleanHash.toUpperCase() === "MBAPP";

    const sessionOK = hasValidSession();

    return {
      loginToken: token,
      hasToken,
      cleanHash,
      isMBAppHash,
      sessionOK,
      // đủ điều kiện cho thanh toán
      canPay: hasToken && isMBAppHash && sessionOK,
    };
  }, [search, hash]);
}

// ====== HOME (luôn vào được) ======
const Home: React.FC = () => {
  const { loginToken, hasToken, cleanHash, isMBAppHash, sessionOK, canPay } =
    useAccessGuard();

  const jsonPayload = useMemo(
    () => JSON.stringify({ loginToken, hash: cleanHash }, null, 2),
    [loginToken, cleanHash]
  );

  // Debug khi có token
  useEffect(() => {
    if (hasToken) {
      // eslint-disable-next-line no-console
      console.log("[Home] token payload:", jsonPayload);
    }
  }, [hasToken, jsonPayload]);

  // Copy JSON
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div>
      <Navbar />

      {/* Banner cảnh báo khi chưa đủ điều kiện thanh toán (tuỳ chọn hiển thị) */}
      {!canPay && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 999,
            background: "rgba(255,196,0,0.12)",
            color: "#8a6d00",
            padding: "12px 16px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600 }}>
            {!hasToken || !isMBAppHash
              ? "Bạn đang truy cập từ trình duyệt."
              : "Thiếu token/phiên."}
          </span>
          <span>
            Vui lòng đăng nhập (mở qua ứng dụng MB) để thực hiện thanh toán.
          </span>
          <Link
            to="/require-login"
            state={{ next: "/" }}
            style={{
              marginLeft: "auto",
              color: "#0ea5e9",
              textDecoration: "underline",
            }}
          >
            Đăng nhập ngay
          </Link>
        </div>
      )}

      {/* Panel hiển thị JSON khi có token (debug) */}
      {hasToken && SHOW_TOKEN_PANEL && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 998,
            background: "#0f172a",
            color: "#fff",
            padding: "12px 12px 0",
            borderBottom: "1px solid #1f2937",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <strong>loginToken payload</strong>
            <button
              onClick={onCopy}
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid #334155",
                background: "transparent",
                color: "#fff",
                cursor: "pointer",
              }}
              title="Copy JSON"
            >
              {copied ? "✓ Copied" : "Copy JSON"}
            </button>

            {/* Giữ nguyên query & hash khi sang /mbapp/result */}
            <Link
              to={{
                pathname: "/mbapp/result",
                search: `?loginToken=${loginToken}`,
                hash: `#${cleanHash}`,
              }}
              style={{ marginLeft: "auto", color: "#93c5fd" }}
            >
              Tới trang kết quả
            </Link>
          </div>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              margin: 0,
              padding: 12,
              background: "#111827",
              borderRadius: 8,
              fontSize: 12,
              lineHeight: 1.4,
              border: "1px solid #1f2937",
            }}
          >
            {jsonPayload}
          </pre>
          <div style={{ height: 12 }} />
        </div>
      )}

      <IntroductionBlock />
      {/* Nút thanh toán và toàn bộ flow chặn/cho phép đã được xử lý bên trong PricingBlock */}
      <PricingBlock />
      <UsageGuideBlock />
    </div>
  );
};

// /require-login: verify xong tự quay về “next” (nếu có)
const RequireLoginAuto: React.FC = () => {
  const nav = useNavigate();
  const loc = useLocation();
  React.useEffect(() => {
    const goNext = () => {
      const next = (loc.state as any)?.next || "/";
      nav(next, { replace: true });
    };
    if (hasValidSession()) goNext();
    const onVerified = () => goNext();
    window.addEventListener("mb:verified", onVerified);
    return () => window.removeEventListener("mb:verified", onVerified);
  }, [nav, loc.state]);
  return <RequireLogin />;
};

const Main: React.FC = () => (
  <Router>
    {/* ✅ Bắt và verify loginToken một lần ở root */}
    <GlobalTokenCatcher />

    <Routes>
      {/* Các trang KHÔNG cần phiên (Home luôn mở được) */}
      <Route path="/" element={<Home />} />
      <Route path="/require-login" element={<RequireLoginAuto />} />
      <Route path="/account-payment" element={<AccountPayment />} />
      <Route path="/payment" element={<MBOpenPaymentPage />} />

      {/* Các trang cần phiên MB (tùy dự án, vẫn giữ VerifiedRoute) */}
      <Route element={<VerifiedRoute />}>
        <Route path="/mbapp/result" element={<ResultPage />} />
        <Route path="/instruction" element={<InstructionPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
    </Routes>
  </Router>
);

export default Main;
