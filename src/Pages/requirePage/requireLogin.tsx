import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";

const COUNTDOWN_SECS = 4; // thời gian đếm ngược

const RequireLogin: React.FC = () => {
  const location = useLocation() as { state?: { message?: string } };
  const message =
    location.state?.message ||
    "Vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ.";

  const loginUrl = useMemo(() => {
    const envUrl = (import.meta.env.VITE_LOGIN_URL as string) || "#";
    return envUrl;
  }, []);

  const [seconds, setSeconds] = useState(COUNTDOWN_SECS);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(t);
          doRedirect();
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doRedirect = () => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    if (loginUrl && loginUrl !== "#") {
      window.location.assign(loginUrl);
    }
  };

  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* lớp nền hiệu ứng */}
      <div style={styles.noise} aria-hidden="true" />

      <div role="status" aria-live="polite" style={styles.card}>
        <div style={styles.logoWrap}>
          <div className="pulse-dot" />
          <div className="spinner" aria-hidden="true" />
        </div>

        <h1 className="title">Đang chuẩn bị đăng nhập…</h1>
        <p className="subtitle">{message}</p>

        <div className="progress-wrap" aria-hidden="true">
          <div className="progress-track">
            <div className="progress-fill" />
          </div>
        </div>

        <div className="actions-row">
          <button
            type="button"
            onClick={doRedirect}
            className="primary-btn"
            disabled={isRedirecting}
          >
            {isRedirecting ? "Đang chuyển…" : "Chuyển ngay"}
          </button>

          <Link to="/" className="ghost-btn" aria-label="Về trang chủ">
            Về trang chủ
          </Link>
        </div>

        <p className="helper-text">
          Tự động chuyển trong <strong>{Math.max(seconds, 0)}s</strong>
        </p>
      </div>
    </div>
  );
};

export default RequireLogin;

/* ===================== Base inline styles ===================== */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100svh",
    width: "100%",
    background:
      "linear-gradient(180deg, rgba(6,78,94,1) 0%, rgba(13,71,85,1) 40%, rgba(15,23,42,1) 100%)",
    color: "rgba(255,255,255,0.96)",
    display: "grid",
    placeItems: "center",
    position: "relative",
    overflow: "hidden",
    padding:
      "max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))",
  },
  noise: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(1200px 600px at 20% -10%, rgba(255,255,255,0.08), transparent 60%), radial-gradient(1000px 500px at 120% 110%, rgba(0,255,200,0.08), transparent 60%)",
    pointerEvents: "none",
    filter: "blur(0.5px)",
  },
  card: {
    width: "min(640px, 92vw)",
    borderRadius: 16,
    padding: "24px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.06))",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.15)",
    position: "relative",
  },
  logoWrap: {
    position: "relative",
    width: 82,
    height: 82,
    margin: "0 auto 12px",
  },
};

/* ===================== Responsive / Motion-aware CSS ===================== */
const css = `
:root {
  --fg: rgba(255,255,255,0.96);
  --fg-dim: rgba(255,255,255,0.82);
  --fg-muted: rgba(255,255,255,0.72);
  --card-w-max: 640px;
}

/* Fluid type scale */
.title {
  margin: 2px 0 6px;
  font-weight: 800;
  letter-spacing: .2px;
  text-align: center;
  font-size: clamp(18px, 2.6vw, 26px);
}
.subtitle {
  margin: 0;
  color: var(--fg-dim);
  text-align: center;
  font-size: clamp(13px, 1.6vw, 15px);
  line-height: 1.55;
}

/* Layout helpers */
.progress-wrap { margin: 16px 0 8px; }
.actions-row {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 6px;
  flex-wrap: wrap;
}
.helper-text {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  color: var(--fg-muted);
}

/* Spinner */
.spinner {
  --size: clamp(64px, 12vw, 96px);
  width: var(--size);
  height: var(--size);
  border-radius: 999px;
  border: 3px solid rgba(255,255,255,0.16);
  border-top-color: rgba(255,255,255,0.92);
  animation: spin 1s linear infinite;
  box-shadow: inset 0 0 22px rgba(0,0,0,0.25), 0 0 0 3px rgba(255,255,255,0.04);
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Pulse */
.pulse-dot {
  position: absolute;
  inset: 0;
  margin: auto;
  width: clamp(14px, 2.2vw, 18px);
  height: clamp(14px, 2.2vw, 18px);
  border-radius: 999px;
  background: rgba(255,255,255,0.95);
  box-shadow: 0 0 24px rgba(255,255,255,0.7), 0 0 64px rgba(0,255,200,0.6);
  animation: pulse 1.6s ease-in-out infinite;
}
@keyframes pulse {
  0% { transform: scale(0.85); opacity: 0.9; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.85); opacity: 0.9; }
}

/* Progress */
.progress-track {
  width: 100%;
  height: clamp(8px, 1.4vw, 10px);
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.14);
}
.progress-fill {
  width: 40%;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255,255,255,0.0), rgba(255,255,255,0.95), rgba(255,255,255,0.0));
  animation: slide 1.35s ease-in-out infinite;
  filter: drop-shadow(0 0 14px rgba(255,255,255,0.45));
}
@keyframes slide {
  0% { transform: translateX(-60%); }
  50% { transform: translateX(20%); }
  100% { transform: translateX(120%); }
}

/* Buttons */
.primary-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 700;
  color: #0f172a;
  background: white;
  box-shadow: 0 8px 22px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.8);
  transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease;
  font-size: clamp(13px, 1.6vw, 14px);
}
.primary-btn:hover { transform: translateY(-1px); }
.primary-btn:active { transform: translateY(0); box-shadow: 0 4px 14px rgba(0,0,0,0.25); }
.primary-btn:disabled { opacity: .7; cursor: not-allowed; }

.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.28);
  color: rgba(255,255,255,0.96);
  text-decoration: none;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(6px);
  transition: background .2s ease, transform .15s ease;
  font-size: clamp(13px, 1.6vw, 14px);
}
.ghost-btn:hover { background: rgba(255,255,255,0.12); transform: translateY(-1px); }

/* ===================== Responsive tweaks ===================== */

/* Mobile ≤ 360px: co giãn chữ & padding */
@media (max-width: 360px) {
  .subtitle { font-size: 12.5px; }
  .primary-btn, .ghost-btn { padding: 9px 12px; }
}

/* Tablet ≥ 768px: tăng độ thoáng */
@media (min-width: 768px) {
  .title { letter-spacing: .3px; }
  .subtitle { line-height: 1.6; }
  .actions-row { gap: 12px; }
}

/* Desktop ≥ 1280px: nới card & bóng */
@media (min-width: 1280px) {
  .title { font-size: 26px; }
}

/* Ultra-wide ≥ 1920px: giữ tỷ lệ trung tâm, không nở quá */
@media (min-width: 1920px) {
  .helper-text { font-size: 13px; }
}

/* Landscape phone: đôi khi chiều cao ngắn, đảm bảo spacing */
@media (max-height: 420px) and (orientation: landscape) {
  .subtitle { display: none; } /* tối giản để không vỡ bố cục */
  .helper-text { margin-top: 6px; }
}

/* prefers-reduced-motion: tắt animation nếu người dùng không muốn */
@media (prefers-reduced-motion: reduce) {
  .spinner, .pulse-dot, .progress-fill { animation: none !important; }
  .primary-btn, .ghost-btn { transition: none !important; }
}
`;
