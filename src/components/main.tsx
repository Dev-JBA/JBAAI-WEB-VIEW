import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  Link,
} from "react-router-dom";

// Các block/trang sẵn có của bạn:
import IntroductionBlock from "./IntroductionBlock/IntroductionBlock";
import Navbar from "./Navbar/Navbar";
import PricingBlock from "./PricingBlock/PricingBlock";
import UsageGuideBlock from "./UsageGuideBlock/UsageGuideBlock";
import ResultPage from "../Pages/resultPage/result";
import WorkPage from "../Pages/work";
import ContactPage from "../Pages/contact";
import RequireLogin from "../Pages/requirePage/requireLogin";

const SHOW_TOKEN_PANEL = true; // có thể chuyển false khi lên prod

const MainContent: React.FC = () => {
  return (
    <div>
      <Navbar />
      <IntroductionBlock />
      <PricingBlock />
      <UsageGuideBlock />
    </div>
  );
};

const HomeGuard: React.FC = () => {
  const { search, hash } = useLocation();

  const { loginToken, hasToken, hasHash, cleanHash } = useMemo(() => {
    const params = new URLSearchParams(search);
    const token = (params.get("loginToken") || "").trim();
    const tokenExists = token.length > 0;

    // location.hash trả về dạng "#ABC" hoặc ""
    const hasHashFlag = !!hash && hash.length > 1;
    const normalizedHash = hasHashFlag ? hash.slice(1) : ""; // bỏ dấu '#'

    return {
      loginToken: token,
      hasToken: tokenExists,
      hasHash: hasHashFlag,
      cleanHash: normalizedHash,
    };
  }, [search, hash]);

  // JSON payload để log + hiển thị
  const jsonPayload = useMemo(
    () => JSON.stringify({ loginToken, hash: cleanHash }, null, 2),
    [loginToken, cleanHash]
  );

  // Khi có token -> log JSON ra console
  useEffect(() => {
    if (hasToken) {
      // eslint-disable-next-line no-console
      console.log(jsonPayload);
    }
  }, [hasToken, jsonPayload]);

  // Điều kiện:
  // 1) Có token và có hash -> Main
  // 2) Không token và không hash -> Main
  // 3) Chỉ có hash (không token) -> RequireLogin
  // 4) Có token nhưng không hash -> RequireLogin
  const goMain = (hasToken && hasHash) || (!hasToken && !hasHash);

  // Panel hiển thị JSON (chỉ render khi có token và bật SHOW_TOKEN_PANEL)
  const [copied, setCopied] = useState(false);
  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const TokenPanel =
    hasToken && SHOW_TOKEN_PANEL ? (
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
            onClick={copyJson}
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
          <Link
            to="/mbapp/result"
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
    ) : null;

  if (goMain) {
    return (
      <>
        {TokenPanel}
        <MainContent />
      </>
    );
  }

  return <Navigate to="/require-login" replace />;
};

const Main: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Trang kết quả theo URL mới */}
        <Route path="/mbapp/result" element={<ResultPage />} />

        {/* Các trang khác */}
        <Route path="/work" element={<WorkPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Trang báo lỗi đăng nhập */}
        <Route path="/require-login" element={<RequireLogin />} />

        {/* Trang chủ với guard */}
        <Route path="/" element={<HomeGuard />} />
      </Routes>
    </Router>
  );
};

export default Main;
