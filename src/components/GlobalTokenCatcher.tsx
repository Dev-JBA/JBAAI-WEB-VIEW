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

// Lấy loginToken từ query hoặc hash
// Hỗ trợ: ?loginToken=.., #loginToken=.., #/path?loginToken=..
function extractLoginToken(search: string, hash: string) {
  // 1. query ?loginToken=...
  const q = new URLSearchParams(search).get("loginToken")?.trim();
  if (q) return q;

  // 2. hash
  const raw = (hash || "").replace(/^#/, "");
  if (!raw) return "";

  // dạng #loginToken=xxx
  if (raw.includes("loginToken=") && !raw.includes("/")) {
    return new URLSearchParams(raw).get("loginToken")?.trim() || "";
  }

  // dạng #mbapp?loginToken=xxx hoặc #/mbapp?loginToken=xxx
  const qm = raw.indexOf("?");
  if (qm >= 0) {
    return (
      new URLSearchParams(raw.slice(qm + 1)).get("loginToken")?.trim() || ""
    );
  }

  // fallback regex
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

// Xoá riêng loginToken khỏi URL, giữ nguyên path + param khác
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
    search: sp.toString() ? `?${sp}` : "",
    hash: newHash ? `#${newHash}` : "",
  };
}

const GlobalTokenCatcher: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const runningRef = React.useRef(false);

  React.useEffect(() => {
    const loginToken = extractLoginToken(location.search, location.hash);
    const isResultPage = location.pathname === "/mbapp/result";

    // 🔑 Bắt buộc hash phải chứa 'mbapp' (vd: #mbapp, #/mbapp, #mbapp?loginToken=...)
    const HASH_KEYWORD = "mbapp";
    const hasValidHash =
      !!location.hash && location.hash.toLowerCase().includes(HASH_KEYWORD);

    // Chỉ verify nếu:
    //  - Có loginToken
    //  - Và hash hợp lệ (có 'mbapp')
    //  - Hoặc là trang /mbapp/result (không cần hash)
    const hasIncomingToken = !!loginToken && (hasValidHash || isResultPage);

    // Trang kết quả bỏ qua verify
    if (isResultPage) return;

    // Nếu không có token hợp lệ, hoặc đã verified, hoặc đang chạy → bỏ qua
    if (!hasIncomingToken || isVerified() || runningRef.current) return;

    runningRef.current = true;
    const ac = new AbortController();

    (async () => {
      try {
        // Nếu API cần thêm hash, có thể truyền location.hash.slice(1)
        const payload = await verifyToken(loginToken, ac.signal);
        const raw: any = (payload as any)?.data ?? payload;

        const sessionId: string =
          raw?.sessionId ?? raw?.token ?? raw?.accessToken ?? "";

        const cif: string | null =
          typeof raw?.cif === "string" && raw.cif
            ? raw.cif
            : typeof raw?.user?.cif === "string"
            ? raw.user.cif
            : null;

        const fullname: string | null =
          raw?.fullName ?? raw?.fullname ?? raw?.user?.fullName ?? null;

        if (!sessionId)
          throw new Error("Không tìm thấy sessionId/token trong response");

        // ⛳ Lưu session vào sessionStorage
        setSession({
          sessionId,
          cif: cif ?? null,
          fullname: fullname ?? null,
          raw,
        });

        // Xoá loginToken khỏi URL để không verify lại
        navigate(stripLoginToken(location), { replace: true });
      } catch (e) {
        if (isAbortError(e)) return;
        clearSession();
        if (!isResultPage) {
          navigate("/require-login", {
            replace: true,
            state: {
              message:
                "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng mở lại Mini App từ ứng dụng MB.",
            },
          });
        }
      } finally {
        runningRef.current = false;
      }
    })();

    // Không abort để tránh StrictMode hủy request đầu
    return () => {};
  }, [location, navigate]);

  return null;
};

export default GlobalTokenCatcher;
