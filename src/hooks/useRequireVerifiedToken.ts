// src/hooks/useRequireVerifiedToken.ts
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getVerifiedToken } from "../data/authStorage";

type Opts = { graceMs?: number }; // thời gian đợi catcher verify nếu URL có loginToken

export function useRequireVerifiedToken(opts: Opts = {}) {
  const { graceMs = 600 } = opts;
  const location = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = React.useState<string | null>(null);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    const hasIncomingToken = /loginToken=/.test(
      location.search + location.hash
    );

    const done = (t: string | null) => {
      if (cancelled) return;
      setToken(t);
      setChecking(false);
    };

    // 1) đã có token trong storage -> pass
    const t = getVerifiedToken();
    if (t) return done(t);

    // 2) chưa có token nhưng URL đang mang loginToken -> đợi catcher verify
    if (hasIncomingToken) {
      const id = window.setTimeout(() => {
        const t2 = getVerifiedToken();
        done(t2); // nếu catcher đã verify xong, t2 sẽ có; nếu chưa, page cứ render, catcher sẽ điều hướng nếu fail
      }, graceMs);
      return () => {
        cancelled = true;
        clearTimeout(id);
      };
    }

    // 3) không có token & không có loginToken đến -> redirect
    navigate("/require-login", {
      replace: true,
      state: { message: "Bạn cần đăng nhập để tiếp tục." },
    });
    done(null);

    return () => {
      cancelled = true;
    };
  }, [location.search, location.hash, navigate, graceMs]);

  return { token, checking };
}
