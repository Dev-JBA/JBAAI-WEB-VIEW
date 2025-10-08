// src/components/GlobalTokenCatcher.tsx
import React, { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { verifyToken } from "../data/api/api_verify_token"; // giữ nguyên theo dự án của bạn
import { clearSession, isVerified, setSession } from "../data/authStorage";

/**
 * Khóa chống gọi lặp do StrictMode / remount
 * và đánh dấu token đã dùng (token one-time).
 */
const LOCK_KEY = "MB_VERIFY_LOCK";
const USED_PREFIX = "MB_TOKEN_USED:";

/* Lock helpers */
function setLock(on: boolean) {
  try {
    if (on) sessionStorage.setItem(LOCK_KEY, "1");
    else sessionStorage.removeItem(LOCK_KEY);
  } catch {}
}
function hasLock() {
  try {
    return sessionStorage.getItem(LOCK_KEY) === "1";
  } catch {
    return false;
  }
}

/* Token-used helpers */
function markTokenUsed(token: string) {
  try {
    sessionStorage.setItem(USED_PREFIX + token, String(Date.now()));
  } catch {}
}
function isTokenUsed(token: string) {
  try {
    return !!sessionStorage.getItem(USED_PREFIX + token);
  } catch {
    return false;
  }
}

const GlobalTokenCatcher: React.FC = () => {
  const { search, hash } = useLocation();

  // BẮT BUỘC hash theo yêu cầu của bạn
  const REQUIRE_HASH = true;

  const { loginToken, hasToken, cleanHash, hasHash } = useMemo(() => {
    const params = new URLSearchParams(search || "");
    const token = (
      params.get("loginToken") ||
      params.get("token") ||
      ""
    ).trim();
    const tokenExists = token.length > 0;

    const hasHashFlag = !!hash && hash.length > 1; // "#MBAPP" -> true
    const normalizedHash = hasHashFlag ? hash.slice(1) : "";

    return {
      loginToken: token,
      hasToken: tokenExists,
      cleanHash: normalizedHash,
      hasHash: hasHashFlag,
    };
  }, [search, hash]);

  // Controller/Key theo token|hash: chỉ abort khi token đổi (không abort trong cleanup)
  const ctrlRef = useRef<AbortController | null>(null);
  const keyRef = useRef<string>("");

  useEffect(() => {
    // Chỉ coi là "có token đến" khi đạt rule: bắt buộc có hash
    const hasIncomingToken = hasToken && (!REQUIRE_HASH || hasHash);

    // 1) Nếu KHÔNG có token đến -> KHÔNG làm gì (đặc biệt: KHÔNG clear session)
    if (!hasIncomingToken) return;

    // 2) Đã verified rồi, hoặc token đã dùng, hoặc đang có lock -> bỏ qua
    if (isVerified() || isTokenUsed(loginToken) || hasLock()) return;

    // 3) Chuẩn bị verify
    const key = `${loginToken}|${cleanHash}`;

    // Nếu đang có request cũ và token thay đổi -> abort request cũ
    if (ctrlRef.current && keyRef.current && keyRef.current !== key) {
      try {
        ctrlRef.current.abort();
      } catch {}
      ctrlRef.current = null;
    }

    setLock(true);
    markTokenUsed(loginToken);

    const controller = new AbortController();
    ctrlRef.current = controller;
    keyRef.current = key;

    (async () => {
      try {
        console.log("[Catcher] extracted =", loginToken);
        const s = await verifyToken(loginToken, controller.signal, cleanHash);

        // Lưu session vào storage/app state của bạn
        setSession(s); // (setSession nên phát 'mb:verified' nếu bạn đã cài)

        // Chuẩn hoá dữ liệu verify để lấy sessionId/cif
        // BE có thể trả { data: {...} } hoặc trả object phẳng
        const raw: any = (s as any)?.data ?? s;

        // Tìm sessionId & cif ở các vị trí thường gặp
        const sessionId: string =
          raw?.sessionId ?? raw?.user?.sessionId ?? raw?.accessToken ?? "";

        const cif: string = raw?.cif ?? raw?.user?.cif ?? "";

        // Log & lưu localStorage cho /payment dùng
        console.log("[verify-token] raw =", raw, "typeof:", typeof raw);
        if (sessionId || cif) {
          localStorage.setItem(
            "mb_verify_profile",
            JSON.stringify({ sessionId, cif })
          );
        }

        console.log("[Catcher] verify OK:", s);
      } catch (e: any) {
        if (e?.code === "ERR_CANCELED") {
          console.warn("[Catcher] request canceled (token changed)");
        } else {
          console.error("[Catcher] verify failed:", e);
          // Chỉ clear khi verify THẤT BẠI thực sự
          clearSession();
        }
      } finally {
        setLock(false);
      }
    })();

    // ❗ KHÔNG abort trong cleanup để tránh StrictMode cancel lần mount đầu
    return () => {};
  }, [hasToken, hasHash, loginToken, cleanHash]);

  return null;
};

export default GlobalTokenCatcher;
