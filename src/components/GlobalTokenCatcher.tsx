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

// lấy loginToken từ query hoặc hash (#/path?loginToken=.. | #loginToken=..)
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

// xóa riêng loginToken khỏi URL, giữ phần còn lại
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

  // Nếu muốn bắt buộc có hash (ví dụ "#MBAPP"), bật cờ này
  const REQUIRE_HASH = true;

  React.useEffect(() => {
    const loginToken = extractLoginToken(location.search, location.hash);
    const hasHash = !!location.hash && location.hash.length > 1;
    // Route /mbapp/result không cần hash
    const isResultPage = location.pathname === "/mbapp/result";
    const hasIncomingToken = !!loginToken && (!REQUIRE_HASH || hasHash || isResultPage);

    // Nếu là trang /mbapp/result thì bỏ qua verifyToken
    if (isResultPage) return;

    // ✅ chỉ verify đúng 1 lần: khi có token + chưa verified + không đang chạy
    if (!hasIncomingToken || isVerified() || runningRef.current) return;

    runningRef.current = true;
    const ac = new AbortController();

    (async () => {
      try {
        // nếu verifyToken bên bạn nhận thêm hash, truyền: location.hash.slice(1)
        const payload = await verifyToken(
          loginToken,
          ac.signal /* , location.hash.slice(1) */
        );
        const raw: any = (payload as any)?.data ?? payload;

        // chuẩn hoá lấy sessionId/cif/fullname ở các vị trí hay gặp
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

        // ⛳ LƯU VÀO sessionStorage (không localStorage)
        setSession({
          sessionId,
          cif: cif ?? null,
          fullname: fullname ?? null,
          raw,
        });

        // xoá loginToken khỏi URL để không verify lại ở lần render sau
        navigate(stripLoginToken(location), { replace: true });
      } catch (e) {
        if (isAbortError(e)) return;
        clearSession();
        if (!isResultPage) {
          navigate("/require-login", {
            replace: true,
            state: {
              message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
            },
          });
        }
      } finally {
        runningRef.current = false;
      }
    })();

    // không abort trong cleanup để tránh StrictMode hủy request đầu
    return () => { };
  }, [location, navigate]);

  return null;
};

export default GlobalTokenCatcher;
