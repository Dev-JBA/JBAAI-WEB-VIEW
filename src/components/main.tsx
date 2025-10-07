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
import Login from "./AccountPayment/AccountPayment";
import AccountPayment from "./AccountPayment/AccountPayment";
import images from "../assets";

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

  useEffect(() => {
    if (hasHash && !hasToken) {
      try {
        const w = window as any;
        if (w && typeof w.ReactNativeWebView?.postMessage === "function") {
          w.ReactNativeWebView.postMessage(
            JSON.stringify({ type: "GO_BACK" })
          );
        }
      } catch (err) {
        // ignore
      }
    }
  }, [hasHash, hasToken]);

  // Hàm gửi yêu cầu đóng popup/webview 
  const sendGoBack = () => {
    try {
      const w = window as any;
      if (w && typeof w.ReactNativeWebView?.postMessage === "function") {
        w.ReactNativeWebView.postMessage(JSON.stringify({ type: "GO_BACK" }));
      } else if (typeof window.close === "function") {
        // fallback trên browser nếu cần
        window.close();
      }
    } catch (err) {
      // ignore
    }
  };


  // Điều kiện:
  // 1) Có token và có hash -> Main
  // 2) Không token và không hash -> Main
  // 3) Chỉ có hash (không token) -> RequireLogin
  // 4) Có token nhưng không hash -> RequireLogin
  const goMain = (hasToken && hasHash) || (!hasToken && !hasHash);

  // Nếu chỉ có hash mà không có token: hiển thị thông báo lỗi + nút đóng
  if (hasHash && !hasToken) {
    return (
      <>
        <style>{`
          .hash-error-root {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: #0b1220;
            color: #fff;
            flex-direction: column;
            gap: 16px;
            box-sizing: border-box;
          }
          .hash-error-card {
            max-width: 560px;
            width: 100%;
            background: #0f172a;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #1f2937;
            text-align: center;
            box-sizing: border-box;
          }
          .hash-error-card h2 { margin: 0 0 8px; font-size: 20px; }
          .hash-error-card p { margin: 0; color: #cbd5e1; font-size: 14px; line-height: 1.4; }

          .hash-actions {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-top: 12px;
          }
          .hash-btn {
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #334155;
            background: #111827;
            color: #fff;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          @media (max-width: 480px) {
            .hash-error-root { padding: 12px; }
            .hash-error-card {
              max-width: none;
              width: calc(100% - 24px);
              padding: 16px;
              border-radius: 12px;
            }
            .hash-error-card h2 { font-size: 18px; }
            .hash-error-card p { font-size: 13px; }

            /* Stack buttons vertically and make them full width */
            .hash-actions { flex-direction: column; gap: 10px; align-items: stretch; }
            .hash-btn, 
          }
          @media (min-width: 481px) and (max-width: 768px) {
            .hash-error-card { max-width: 520px; padding: 18px; border-radius: 10px; }
            .hash-error-card h2 { font-size: 19px; }
          }
        `}</style>

        <div className="hash-error-root">
          <div className="hash-error-card">
            <img alt="Error" src="" style={{ width: 40, height: 40, marginBottom: 8 }} />
            <h2>Không tìm thấy mã xác thực</h2>
            <p>
              LoginToken hợp lệ.
              Vui lòng đóng cửa sổ này và thử lại từ ứng dụng chính.
            </p>

            <div className="hash-actions">
              <button onClick={sendGoBack} className="hash-btn">
                Đóng
              </button>

            </div>
          </div>
        </div>
      </>
    );
  }

  // Panel hiển thị JSON (chỉ render khi có token và bật SHOW_TOKEN_PANEL)
  const [copied, setCopied] = useState(false);
  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { }
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

          {/* ✅ Giữ nguyên query & hash khi sang /mbapp/result */}
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
        {/* Trang kết quả theo URL yêu cầu */}
        <Route path="/mbapp/result" element={<ResultPage />} />

        {/* Các trang khác */}
        <Route path="/work" element={<WorkPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Trang báo lỗi đăng nhập */}
        <Route path="/require-login" element={<RequireLogin />} />

        {/* Trang chủ với guard */}
        <Route path="/" element={<HomeGuard />} />

        {/* Trang đăng nhập (nếu cần) */}
        <Route path="/account-payment" element={<AccountPayment />} />
      </Routes>
    </Router>
  );
};

export default Main;
