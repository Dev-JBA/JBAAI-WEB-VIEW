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
  const q = new URLSearchParams(search).get("loginToken")?.trim();
  if (q) return q;

  const raw = (hash || "").replace(/^#/, "");
  if (!raw) return "";

  if (raw.includes("loginToken=") && !raw.includes("/")) {
    return new URLSearchParams(raw).get("loginToken")?.trim() || "";
  }

  const qm = raw.indexOf("?");
  if (qm >= 0) {
    return (
      new URLSearchParams(raw.slice(qm + 1)).get("loginToken")?.trim() || ""
    );
  }

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

  // Nếu muốn chỉ chấp nhận token khi có hash (vd: #mbapp) thì giữ true
  // Nếu MB không thêm hash mà chỉ gọi ?loginToken=... thì đổi thành false
  const REQUIRE_HASH = true;

  React.useEffect(() => {
    const loginToken = extractLoginToken(location.search, location.hash);
    const hasHash = !!location.hash && location.hash.length > 1;
    const isResultPage = location.pathname === "/mbapp/result";

    // Có token hợp lệ để verify hay không
    const hasIncomingToken =
      !!loginToken && (!REQUIRE_HASH || hasHash || isResultPage);

    // Trang kết quả thì bỏ qua verify
    if (isResultPage) return;

    // ✅ Verify duy nhất 1 lần: có token + chưa verified + không chạy rồi
    if (!hasIncomingToken || isVerified() || runningRef.current) return;

    runningRef.current = true;
    const ac = new AbortController();

    (async () => {
      try {
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

    return () => {
      // Không abort để tránh StrictMode huỷ request đầu
    };
  }, [location, navigate]);

  return null;
};

export default GlobalTokenCatcher;
