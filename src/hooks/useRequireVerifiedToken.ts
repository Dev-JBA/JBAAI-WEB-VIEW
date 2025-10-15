// src/hooks/useRequireVerifiedToken.ts
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getSession, isVerified } from "../data/authStorage";

/**
 * Hook chỉ đọc trạng thái do GlobalTokenCatcher set.
 * KHÔNG tự verify, KHÔNG gọi API.
 */
type Opts = { graceMs?: number };

export function useRequireVerifiedToken(opts: Opts = {}) {
  const { graceMs = 1200 } = opts;
  const location = useLocation();
  const navigate = useNavigate();

  const [checking, setChecking] = React.useState(true);
  const [ok, setOk] = React.useState(false);

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

      if (verified && session?.sessionId) {
        setOk(true);
        setChecking(false);
        return;
      }

      if (hasIncomingToken) {
        // chờ GlobalTokenCatcher verify xong
        tid = window.setTimeout(() => {
          const v2 = isVerified();
          const s2 = getSession();
          setOk(!!(v2 && s2?.sessionId));
          setChecking(false);
        }, graceMs) as unknown as number;
        return;
      }

      // không có token tới và chưa verified → yêu cầu đăng nhập
      setOk(false);
      setChecking(false);
      navigate("/require-login", {
        replace: true,
        state: { message: "Bạn cần đăng nhập để tiếp tục." },
      });
    };

    decide();

    // nghe sự kiện mb:verified để phản ứng ngay (khỏi đợi hết grace)
    const onVerified = () => {
      const s = getSession();
      if (s?.sessionId) {
        setOk(true);
        setChecking(false);
      }
    };
    window.addEventListener("mb:verified" as any, onVerified);

    return () => {
      if (tid) clearTimeout(tid);
      window.removeEventListener("mb:verified" as any, onVerified);
      cancelled = true;
    };
  }, [hasIncomingToken, graceMs, navigate]);

  return { ok, checking };
}
