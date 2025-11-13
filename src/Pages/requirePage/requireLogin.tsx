// src/Pages/requirePage/requireLogin.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";

const COUNTDOWN_SECS = 4;

const RequireLogin: React.FC = () => {
  const location = useLocation() as { state?: { message?: string } };
  const message =
    location.state?.message ||
    "Phiên đăng nhập đã hết hạn. Vui lòng mở lại Mini App từ ứng dụng MB để tiếp tục.";

  // Đọc env (có thể bỏ trống nếu không dùng redirect)
  const rawEnvUrl = (
    (import.meta.env.VITE_LOGIN_URL as string | undefined) ?? ""
  ).trim();

  // Chuẩn hoá URL: nếu trống hoặc đang để kiểu https://<login-url> thì coi như không dùng
  const loginUrl = useMemo(() => {
    if (!rawEnvUrl || rawEnvUrl.includes("<")) {
      return null;
    }
    try {
      const url = rawEnvUrl.startsWith("http")
        ? new URL(rawEnvUrl)
        : new URL(rawEnvUrl, window.location.origin);
      return url.toString();
    } catch {
      return null;
    }
  }, [rawEnvUrl]);

  const [seconds, setSeconds] = useState(COUNTDOWN_SECS);
  const [redirecting, setRedirecting] = useState(false);

  const handleRedirect = () => {
    if (redirecting || !loginUrl) return;
    setRedirecting(true);
    try {
      window.location.assign(loginUrl);
    } catch (err) {
      console.error("[RequireLogin] Redirect thất bại:", err);
      setRedirecting(false);
    }
  };

  useEffect(() => {
    if (!loginUrl) return; // không có URL thì không auto redirect

    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer);
          handleRedirect();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginUrl]);

  const canRedirect = !!loginUrl;

  return (
    <div style={styles.wrapper}>
      <style>{css}</style>

      <div style={styles.card}>
        <div className="spinner-wrap">
          <div className="spinner">
            <img
              src="/logo512.png"
              alt="Logo"
              className="spinner-logo"
              draggable={false}
            />
          </div>
        </div>

        <h1 className="title">Đang đăng nhập lại...</h1>

        <p className="desc">{message}</p>

        <div className="progress" aria-hidden="true">
          <div className="bar" />
        </div>

        <div className="actions">
          <button
            onClick={handleRedirect}
            disabled={redirecting || !canRedirect}
            className="btn-primary"
          >
            {canRedirect
              ? redirecting
                ? "Đang chuyển..."
                : "Chuyển ngay"
              : "Thiếu cấu hình login URL"}
          </button>

          <Link to="/" className="btn-secondary">
            Về trang chủ
          </Link>
        </div>

        <p className="countdown">
          {canRedirect ? (
            <>
              Tự động chuyển trong <strong>{Math.max(seconds, 0)}s</strong>
            </>
          ) : (
            <>Vui lòng cấu hình VITE_LOGIN_URL nếu muốn redirect tự động.</>
          )}
        </p>
      </div>
    </div>
  );
};

export default RequireLogin;

/* ================= Styles ================= */
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100svh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
    color: "white",
    padding:
      "max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))",
    overflow: "hidden",
  },
  card: {
    width: "min(92vw, 520px)",
    minWidth: 280,
    borderRadius: 14,
    padding: "24px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    textAlign: "center",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  },
};

const css = `
:where(html, body, #root) {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden !important;
}
*,
*::before,
*::after {
  box-sizing: border-box;
}
img, video, canvas, svg {
  max-width: 100%;
  height: auto;
}

.title {
  font-size: clamp(18px, 2.2vw, 22px);
  font-weight: 800;
  margin: 4px 0 6px;
  letter-spacing: 0.2px;
}
.desc {
  margin: 0 0 16px;
  font-size: clamp(13px, 1.6vw, 14px);
  opacity: 0.9;
  line-height: 1.55;
  overflow-wrap: anywhere;
  word-break: break-word;
  hyphens: auto;
}

.spinner-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
}
.spinner {
  width: clamp(60px, 12vw, 84px);
  height: clamp(60px, 12vw, 84px);
  border-radius: 9999px;
  border: 3px solid rgba(255,255,255,0.18);
  border-top-color: #fff;
  animation: spin 1s linear infinite;
  position: relative;
  display: grid;
  place-items: center;
}
.spinner-logo {
  width: clamp(22px, 5vw, 34px);
  height: clamp(22px, 5vw, 34px);
  object-fit: contain;
  opacity: .95;
  filter: drop-shadow(0 0 6px rgba(255,255,255,.28));
}
@keyframes spin { to { transform: rotate(360deg); } }

.progress {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  overflow: hidden;
  margin: 12px 0 16px;
  border: 1px solid rgba(255,255,255,0.14);
}
.bar {
  width: 40%;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, #fff, transparent);
  animation: slide 1.3s ease-in-out infinite;
}
@keyframes slide {
  0% { transform: translateX(-60%); }
  50% { transform: translateX(20%); }
  100% { transform: translateX(120%); }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  row-gap: 10px;
}
.btn-primary, .btn-secondary {
  max-width: 100%;
  white-space: nowrap;
}
.btn-primary {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  background: #fff;
  color: #0f172a;
  font-weight: 700;
  cursor: pointer;
  transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease;
  font-size: clamp(13px, 1.6vw, 14px);
}
.btn-primary:hover { transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.btn-secondary {
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.28);
  padding: 10px 14px;
  background: rgba(255,255,255,0.10);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  transition: background .2s ease, transform .15s ease;
  font-size: clamp(13px, 1.6vw, 14px);
}
.btn-secondary:hover { background: rgba(255,255,255,0.18); transform: translateY(-1px); }

.countdown {
  font-size: 12.5px;
  opacity: 0.8;
}

@media (max-width: 340px) {
  .btn-primary, .btn-secondary { padding: 9px 10px; font-size: 12.5px; }
  .progress { height: 7px; }
}
@media (max-height: 420px) and (orientation: landscape) {
  .desc { display: none; }
  .countdown { margin-top: 2px; }
}

@media (prefers-reduced-motion: reduce) {
  .spinner, .bar { animation: none !important; }
  .btn-primary, .btn-secondary { transition: none !important; }
}
`;
