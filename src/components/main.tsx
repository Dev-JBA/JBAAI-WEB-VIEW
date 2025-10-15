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

// Home có panel hiển thị JSON token+hash
const Home: React.FC = () => {
  const { search, hash } = useLocation();

  // Lấy loginToken + hash (bỏ #)
  const { loginToken, hasToken, hasHash, cleanHash } = useMemo(() => {
    const params = new URLSearchParams(search);
    const token = (params.get("loginToken") || "").trim();
    const tokenExists = token.length > 0;
     const hasHashFlag = !!hash && hash.length > 1; // "#MBAPP" -> true
    const normalizedHash = hash && hash.length > 1 ? hash.slice(1) : "";
    return {
      loginToken: token,
      hasToken: tokenExists,
      hasHash: hasHashFlag,
      cleanHash: normalizedHash,
    };
  }, [search, hash]);

  const jsonPayload = useMemo(
    () => JSON.stringify({ loginToken, hash: cleanHash }, null, 2),
    [loginToken, cleanHash]
  );

  // Log ra console khi CÓ token
  useEffect(() => {
    if (hasToken) {
      // eslint-disable-next-line no-console
      console.log(jsonPayload);
    }
  }, [hasToken, jsonPayload]);

  // Nếu KHÔNG có token mà CÓ hash → đóng webview
   useEffect(() => {
    if (!hasToken && hasHash) {
      try {
        const w = window as any;
        if (w && typeof w.ReactNaiveWebView?.postMessage === "function") {
          w.ReactNaiveWebView.postMessage(
            JSON.stringify({ type: "GO_BACK" })
          );
        }
      } catch { }
    }
  }, [hasToken, hasHash]);

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

      {/* Panel hiển thị JSON khi có token */}
      {hasToken && SHOW_TOKEN_PANEL && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 999,
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
              to={{ pathname: "/mbapp/result", search, hash }}
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
      <PricingBlock />
      <UsageGuideBlock />
    </div>
  );
};

// /require-login: khi verify xong thì tự quay về “next” (nếu có)
const RequireLoginAuto: React.FC = () => {
  const nav = useNavigate();
  const loc = useLocation();
  React.useEffect(() => {
    const goNext = () => {
      const next = (loc.state as any)?.next || "/";
      nav(next, { replace: true });
    };
    if (isVerified() && getSession()?.sessionId) goNext();
    const onVerified = () => goNext();
    window.addEventListener("mb:verified", onVerified);
    return () => window.removeEventListener("mb:verified", onVerified);
  }, [nav, loc.state]);
  return <RequireLogin />;
};

const Main: React.FC = () => (
  <Router>
    {/* ✅ VERIFY 1 LẦN Ở ĐÂY */}
    <GlobalTokenCatcher />

    <Routes>
      {/* Các trang KHÔNG cần phiên */}
      <Route path="/require-login" element={<RequireLoginAuto />} />
      <Route path="/account-payment" element={<AccountPayment />} />
      <Route path="/payment" element={<MBOpenPaymentPage />} />

      {/* Các trang CẦN phiên MB → bọc dưới VerifiedRoute */}
      <Route element={<VerifiedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/mbapp/result" element={<ResultPage />} />
        <Route path="/instruction" element={<InstructionPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
    </Routes>
  </Router>
);

export default Main;
