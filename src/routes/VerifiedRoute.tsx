import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getSession, isVerified } from "../data/authStorage";

const REQUIRE_HASH = true; // bạn yêu cầu bắt buộc hash

export default function VerifiedRoute() {
  const loc = useLocation();
  const nav = useNavigate();

  // nghe sự kiện để re-render khi catcher set session
  const [, force] = useState(0);
  useEffect(() => {
    const rerender = () => force((x) => x + 1);
    window.addEventListener("mb:verified", rerender);
    window.addEventListener("mb:logout", rerender);
    return () => {
      window.removeEventListener("mb:verified", rerender);
      window.removeEventListener("mb:logout", rerender);
    };
  }, []);

  // đọc trạng thái hiện tại
  const ok = isVerified() && !!getSession()?.sessionId;

  // nếu chưa ok → gửi sang /require-login, nhớ “điểm đến”
  if (!ok) {
    return (
      <Navigate
        to="/require-login"
        replace
        state={{ next: loc.pathname + loc.search + loc.hash }}
      />
    );
  }

  // đã ok → render các route con
  return <Outlet />;
}
