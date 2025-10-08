// src/hooks/useRequireVerifiedToken.ts
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getSession, isVerified } from "../data/authStorage";

/**
 * Hook chỉ đọc trạng thái do GlobalTokenCatcher set.
 * KHÔNG tự verify, KHÔNG kích hoạt double-call.
 */
type Opts = { graceMs?: number };

export function useRequireVerifiedToken(opts: Opts = {}) {
  const { graceMs = 1200 } = opts; // kéo dài 1.2s cho chắc
  const location = useLocation();
  const navigate = useNavigate();

  const [checking, setChecking] = React.useState(true);
  const [ok, setOk] = React.useState(false);

  // Có loginToken đang tới qua URL?
  const hasIncomingToken = React.useMemo(() => {
    const q = location.search || "";
    const h = location.hash || "";
    return /(?:^|[?&#])loginToken=/.test(q + h);
  }, [location.search, location.hash]);

  React.useEffect(() => {
    let cancelled = false;
    let tid: number | undefined;

    const decide = () => {
      if (cancelled) return;

      const verified = isVerified();
      const session = getSession();

      // Đúng chuẩn: đã verified và có sessionId
      if (verified && session?.sessionId) {
        setOk(true);
        setChecking(false);
        return;
      }

      // Chưa verified nhưng có token đến qua URL: chờ thêm (grace)
      if (hasIncomingToken) {
        tid = window.setTimeout(() => {
          // thử đọc lại sau grace
          const v2 = isVerified();
          const s2 = getSession();
          if (v2 && s2?.sessionId) {
            setOk(true);
          } else {
            setOk(false);
          }
          setChecking(false);
        }, graceMs) as unknown as number;
        return;
      }

      // Không có token đến, chưa verified => điều hướng login
      setOk(false);
      setChecking(false);
      navigate("/require-login", {
        replace: true,
        state: { message: "Bạn cần đăng nhập để tiếp tục." },
      });
    };

    // Quyết định ngay lần đầu; nếu có incoming token thì effect ở trên sẽ chờ grace
    decide();

    return () => {
      cancelled = true;
      if (tid) clearTimeout(tid);
    };
  }, [hasIncomingToken, graceMs, navigate]);

  return { ok, checking };
}
