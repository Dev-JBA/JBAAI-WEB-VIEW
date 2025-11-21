// src/components/GlobalTokenCatcher.tsx
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
 * Hỗ trợ:
 *  - ?loginToken=...
 *  - #loginToken=...
 *  - #mbapp?loginToken=...
 *  - các biến thể có loginToken trong hash
 */
function extractLoginToken(search: string, hash: string) {
  // 1) Lấy từ query
  const q = new URLSearchParams(search).get("loginToken")?.trim();
  if (q) return q;

  // 2) Lấy từ hash
  const raw = (hash || "").replace(/^#/, "");
  if (!raw) return "";

  // Hash kiểu query string: "loginToken=xxx&mbapp=1"
  if (raw.includes("loginToken=") && !raw.includes("/")) {
    const p = new URLSearchParams(raw).get("loginToken")?.trim();
    if (p) return p;
  }

  // Hash kiểu "#mbapp?loginToken=xxx"
  const qm = raw.indexOf("?");
  if (qm >= 0) {
    const fromQs = new URLSearchParams(raw.slice(qm + 1))
      .get("loginToken")
      ?.trim();
    if (fromQs) return fromQs;
  }

  // Fallback: regex
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

    // Trang kết quả /mbapp/result không cần verify login
    if (isResultPage) return;

    // Không có token mới, hoặc đã verified, hoặc đang chạy request -> bỏ qua
    if (!hasIncomingToken || isVerified() || runningRef.current) return;

    runningRef.current = true;
    const ac = new AbortController();

    (async () => {
      try {
        // Debug: kiểm tra token bắt được trong WebView
        alert("Token nhận được từ URL:\n" + loginToken);

        // GỌI ĐÚNG SIGNATURE: verifyToken(token, signal)
        const session = await verifyToken(loginToken, ac.signal);

        // verifyToken đã trả về SessionInfo chuẩn hoá -> lưu luôn
        setSession(session);

        // Xóa loginToken khỏi URL để tránh verify lại
        navigate(stripLoginToken(location), { replace: true });
      } catch (e: any) {
        if (isAbortError(e)) return;

        // Hiển thị lỗi BE trả về để bạn dễ check hơn
        alert("Lỗi verify token:\n" + (e?.message || String(e)));

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

    // Không abort trong cleanup để tránh StrictMode hủy request đầu
    return () => {};
  }, [location, navigate]);

  return null;
};

export default GlobalTokenCatcher;
