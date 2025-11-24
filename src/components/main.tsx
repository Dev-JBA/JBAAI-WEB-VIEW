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

const SHOW_TOKEN_PANEL = true;

// ======================================================================
// DEBUG BANNER — HIỂN THỊ URL, PATH, SEARCH, HASH TRONG WEBVIEW MB APP
// ======================================================================
const DebugBanner: React.FC = () => {
  const enabled =
    (import.meta.env.VITE_SHOW_DEBUG_URL as string | undefined) === "1";

  if (!enabled) return null;

  const href = typeof window !== "undefined" ? window.location.href : "";
  const location = useLocation();

  const debugText = JSON.stringify(
    {
      href,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    },
    null,
    2
  );

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(debugText);
        alert("Đã copy debug info:\n" + debugText);
      } else {
        alert(debugText);
      }
    } catch {
      alert(debugText);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999999,
        background: "rgba(0,0,0,0.85)",
        color: "#fff",
        padding: "8px",
        fontSize: 10,
        lineHeight: "14px",
      }}
    >
      <div style={{ maxHeight: 60, overflow: "auto", whiteSpace: "pre-wrap" }}>
        {debugText}
      </div>
      <button
        onClick={handleCopy}
        style={{
          marginTop: 4,
          padding: "3px 6px",
          fontSize: 10,
          borderRadius: 4,
          background: "#22c55e",
          color: "#fff",
          border: "none",
        }}
      >
        Copy
      </button>
    </div>
  );
};
// ======================================================================

// =========================== HOME ============================
const Home: React.FC = () => {
  const { search, hash } = useLocation();

  const { loginToken, hasToken, hasHash, cleanHash } = useMemo(() => {
    const params = new URLSearchParams(search);
    const token = (params.get("loginToken") || "").trim();
    return {
      loginToken: token,
      hasToken: token.length > 0,
      hasHash: !!hash && hash.length > 1,
      cleanHash: hash && hash.length > 1 ? hash.slice(1) : "",
    };
  }, [search, hash]);

  const jsonPayload = useMemo(
    () => JSON.stringify({ loginToken, hash: cleanHash }, null, 2),
    [loginToken, cleanHash]
  );

  useEffect(() => {
    if (hasToken) console.log(jsonPayload);
  }, [hasToken, jsonPayload]);

  useEffect(() => {
    if (!hasToken && hasHash) {
      try {
        const w = window as any;
        if (w?.ReactNaiveWebView?.postMessage) {
          w.ReactNaiveWebView.postMessage(JSON.stringify({ type: "GO_BACK" }));
        }
      } catch {}
    }
  }, [hasToken, hasHash]);

  const [copied, setCopied] = useState(false);
  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div>
      <Navbar />

      {hasToken && SHOW_TOKEN_PANEL && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 999,
            background: "#0f172a",
            color: "white",
            padding: "12px 12px 0",
            borderBottom: "1px solid #1f2937",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <strong>loginToken payload</strong>
            <button
              onClick={copyJson}
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                color: "white",
                border: "1px solid #334155",
                background: "transparent",
              }}
            >
              {copied ? "✓ Copied" : "Copy JSON"}
            </button>

            <Link
              to={{ pathname: "/mbapp/result", search, hash }}
              style={{ color: "#93c5fd", marginLeft: "auto" }}
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

// =========================== REQUIRE LOGIN ============================
const RequireLoginAuto: React.FC = () => {
  const nav = useNavigate();
  const loc = useLocation();
  useEffect(() => {
    const goNext = () => {
      const next = (loc.state as any)?.next || "/";
      nav(next, { replace: true });
    };
    if (isVerified() && getSession()?.sessionId) goNext();

    const handler = () => goNext();
    window.addEventListener("mb:verified", handler);
    return () => window.removeEventListener("mb:verified", handler);
  }, [nav, loc.state]);

  return <RequireLogin />;
};

// =========================== ROUTER MAIN ============================
const Main: React.FC = () => (
  <Router>
    {/* DEBUG WEBVIEW URL */}
    <DebugBanner />

    <GlobalTokenCatcher />

    <Routes>
      <Route path="/require-login" element={<RequireLoginAuto />} />
      <Route path="/account-payment" element={<AccountPayment />} />
      <Route path="/payment" element={<MBOpenPaymentPage />} />
      <Route path="/mbapp/result" element={<ResultPage />} />
      <Route path="/mbapxp/result" element={<ResultPage />} />
      <Route path="/instruction" element={<InstructionPage />} />

      {/* Protected pages */}
      <Route element={<VerifiedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
    </Routes>
  </Router>
);

export default Main;
