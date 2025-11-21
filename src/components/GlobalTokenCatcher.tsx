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

// Lấy loginToken từ query hoặc hash (#/path?loginToken=.. | #loginToken=..)
function extractLoginToken(search: string, hash: string) {
  // 1) Thử lấy từ query: ?loginToken=...
  const q = new URLSearchParams(search).get("loginToken")?.trim();
  if (q) return q;

  // 2) Thử trong hash
  const raw = (hash || "").replace(/^#/, "");
  if (!raw) return "";

  // Trường hợp hash giống query string: "loginToken=xxx&mbapp=1" hoặc "mbapp=1&loginToken=xxx"
  if (raw.includes("loginToken=") && !raw.includes("/")) {
    const p = new URLSearchParams(raw).get("loginToken")?.trim();
    if (p) return p;
  }

  // Trường hợp "#mbapp?loginToken=xxx"
  const qm = raw.indexOf("?");
  if (qm >= 0) {
    const fromQs = new URLSearchParams(raw.slice(qm + 1))
      .get("loginToken")
      ?.trim();
    if (fromQs) return fromQs;
  }

  // Fallback: regex bắt loginToken trong mọi dạng
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

// Xóa riêng loginToken khỏi URL, giữ phần còn lại
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

  // Dev: KHÔNG bắt buộc hash để dễ test.
  // Khi lên prod, nếu MB bắt buộc "#mbapp" thì có thể bật lại flag này &
  // kiểm tra cụ thể: location.hash.toLowerCase().includes("mbapp")
  const REQUIRE_HASH = false;

  React.useEffect(() => {
    const loginToken = extractLoginToken(location.search, location.hash);
    const hasHash = !!location.hash && location.hash.length > 1;
    const isResultPage = location.pathname === "/mbapp/result";

    // Có token tới từ URL?
    const hasIncomingToken =
      !!loginToken && (!REQUIRE_HASH || hasHash || isResultPage);

    // Trang kết quả /mbapp/result không cần verify login
    if (isResultPage) return;

    // Nếu không có token mới hoặc đã verified, hoặc đang chạy request -> bỏ qua
    if (!hasIncomingToken || isVerified() || runningRef.current) return;

    runningRef.current = true;
    const ac = new AbortController();

    (async () => {
      try {
        // DEBUG: show token khi test trong WebView (sau ok thì comment lại)
        alert("loginToken bắt được: " + loginToken);

        // Giả định verifyToken(token, { signal }) – chỉnh lại nếu hàm bạn khác
        const payload: any = await verifyToken(loginToken, {
          signal: ac.signal,
        });

        const raw: any = payload?.data ?? payload;

        // Chuẩn hóa lấy sessionId / cif / fullname (tùy API của bạn)
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

        if (!sessionId) {
          throw new Error("Không tìm thấy sessionId/token trong response");
        }

        // Lưu session (bên trong setSession bạn đang dùng sessionStorage)
        setSession({
          sessionId,
          cif: cif ?? null,
          fullname: fullname ?? null,
          raw,
        });

        // Xóa loginToken khỏi URL để tránh verify lại ở render tiếp theo
        navigate(stripLoginToken(location), { replace: true });
      } catch (e) {
        if (isAbortError(e)) return;

        console.error("verifyToken error", e);
        clearSession();

        if (!isResultPage) {
          navigate("/require-login", {
            replace: true,
            state: {
              message:
                "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
            },
          });
        }
      } finally {
        runningRef.current = false;
      }
    })();

    // KHÔNG abort trong cleanup để tránh StrictMode hủy request đầu tiên
    return () => {};
  }, [location, navigate]);

  return null;
};

export default GlobalTokenCatcher;
