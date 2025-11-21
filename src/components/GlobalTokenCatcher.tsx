import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyToken } from "../data/api/api_verify_token";
import { clearSession, isVerified, setSession } from "../data/authStorage";

function isAbortError(e: any) {
  return (
    e?.name === "AbortError" ||
    String(e?.message || "")
      .toLowerCase()
      .includes("abort")
  );
}

/**
 * Lấy loginToken từ các dạng URL MB app trả về
 */
function extractLoginToken(search: string, hash: string) {
  // 1) Lấy từ query
  const q = new URLSearchParams(search).get("loginToken")?.trim();
  if (q) return q;

  // 2) Lấy từ hash
  const raw = (hash || "").replace(/^#/, "");
  if (!raw) return "";

  if (raw.includes("loginToken=") && !raw.includes("/")) {
    const p = new URLSearchParams(raw).get("loginToken")?.trim();
    if (p) return p;
  }

  // 3) #mbapp?loginToken=xxx
  const qm = raw.indexOf("?");
  if (qm >= 0) {
    const fromQs = new URLSearchParams(raw.slice(qm + 1))
      .get("loginToken")
      ?.trim();
    if (fromQs) return fromQs;
  }

  // 4) fallback regex
  const m = raw.match(/(?:^|[?&#])loginToken=([^&#]+)/i);
  if (m?.[1]) {
    try {
      return decodeURIComponent(m[1]).trim();
    } catch {
      return m[1].trim();
    }
  }

  return "";
}

/**
 * Xóa loginToken khỏi URL để tránh verify lại ở lần render tiếp theo
 */
function stripLoginToken(loc: ReturnType<typeof useLocation>) {
  const sp = new URLSearchParams(loc.search);
  sp.delete("loginToken");

  let newHash = (loc.hash || "").replace(/^#/, "");
  if (newHash) {
    const qm = newHash.indexOf("?");
    if (qm >= 0) {
      const before = newHash.slice(0, qm);
      const qs = new URLSearchParams(newHash.slice(qm + 1));
      qs.delete("loginToken");
      const s = qs.toString();
      newHash = s ? `${before}?${s}` : before;
    } else {
      const hp = new URLSearchParams(newHash);
      if (hp.has("loginToken")) {
        hp.delete("loginToken");
        newHash = hp.toString();
      }
    }
  }

  return {
    pathname: loc.pathname,
    search: sp.toString() ? `?${sp.toString()}` : "",
    hash: newHash ? `#${newHash}` : "",
  };
}

const GlobalTokenCatcher: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const runningRef = React.useRef(false);

  const REQUIRE_HASH = false; // để test MB dễ hơn

  React.useEffect(() => {
    const loginToken = extractLoginToken(location.search, location.hash);
    const hasHash = !!location.hash && location.hash.length > 1;
    const isResultPage = location.pathname === "/mbapp/result";

    const hasIncomingToken =
      !!loginToken && (!REQUIRE_HASH || hasHash || isResultPage);

    if (isResultPage) return;

    if (!hasIncomingToken || isVerified() || runningRef.current) return;

    runningRef.current = true;
    const ac = new AbortController();

    (async () => {
      try {
        // Debug để kiểm tra trong WebView MB
        alert("Token nhận được từ URL:\n" + loginToken);

        // ❗ GỌI ĐÚNG CÁCH: verifyToken(loginToken, ac.signal)
        const session = await verifyToken(loginToken, ac.signal);

        // Lưu session
        setSession(session);

        // Xóa token khỏi URL
        navigate(stripLoginToken(location), { replace: true });
      } catch (e) {
        if (isAbortError(e)) return;

        clearSession();
        navigate("/require-login", {
          replace: true,
          state: {
            message:
              "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
          },
        });
      } finally {
        runningRef.current = false;
      }
    })();

    return () => {};
  }, [location, navigate]);

  return null;
};

export default GlobalTokenCatcher;
