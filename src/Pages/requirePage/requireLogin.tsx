import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";

const COUNTDOWN_SECS = 4;

const RequireLogin: React.FC = () => {
  const location = useLocation() as { state?: { message?: string } };
  const message =
    location.state?.message ||
    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.";

  // Lấy URL login từ ENV, chống placeholder <login-url> & validate URL
  const loginUrl = useMemo(() => {
    const raw = (import.meta.env.VITE_LOGIN_URL as string | undefined)?.trim();

    // Không redirect nếu không cấu hình / để placeholder
    if (!raw || raw === "#" || raw.includes("<login-url>")) {
      console.warn("⚠️ LOGIN_URL chưa cấu hình đúng:", raw);
      return "";
    }

    try {
      const u = new URL(raw);
      return u.toString();
    } catch {
      console.error("⚠️ LOGIN_URL không phải URL hợp lệ:", raw);
      return "";
    }
  }, []);

  const [seconds, setSeconds] = useState(COUNTDOWN_SECS);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Nếu không có loginUrl thì không tự đếm ngược redirect
    if (!loginUrl) return;

    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer);
          handleRedirect();
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginUrl]);

  const handleRedirect = () => {
    if (redirecting || !loginUrl) return;
    setRedirecting(true);
    window.location.assign(loginUrl);
  };

  return (
    <div style={styles.wrapper}>
      {/* Global-safe CSS to prevent overflow */}
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
            disabled={redirecting || !loginUrl}
            className="btn-primary"
          >
            {redirecting
              ? "Đang chuyển..."
              : loginUrl
              ? "Chuyển ngay"
              : "Liên hệ hỗ trợ"}
          </button>
          <Link to="/" className="btn-secondary">
            Về trang chủ
          </Link>
        </div>

        {loginUrl ? (
          <p className="countdown">
            Tự động chuyển trong <strong>{Math.max(seconds, 0)}s</strong>
          </p>
        ) : (
          <p className="countdown">
            Không tìm thấy địa chỉ đăng nhập. Vui lòng liên hệ hỗ trợ.
          </p>
        )}
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
/* ====== Global overflow safety ====== */
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

/* ====== Typography & layout ====== */
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
  /* chống tràn ngang khi message dài/không khoảng trắng */
  overflow-wrap: anywhere;
  word-break: break-word;
  hyphens: auto;
}

/* ====== Spinner with brand logo ====== */
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

/* ====== Progress ====== */
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

/* ====== Actions (wrap-safe) ====== */
.actions {
  display: flex;
  flex-wrap: wrap;           /* cho phép xuống dòng */
  justify-content: center;
  align-items: center;
  gap: 10px;                 /* khoảng cách đều, không đẩy tràn */
  margin-bottom: 8px;
  row-gap: 10px;
}
.btn-primary, .btn-secondary {
  max-width: 100%;           /* không vượt khung */
  white-space: nowrap;       /* nút ngắn gọn, nhưng nếu nhỏ quá sẽ vẫn wrap vì flex-wrap */
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

/* ====== Extra safety for tiny/odd viewports ====== */
@media (max-width: 340px) {
  .btn-primary, .btn-secondary { padding: 9px 10px; font-size: 12.5px; }
  .progress { height: 7px; }
}
@media (max-height: 420px) and (orientation: landscape) {
  .desc { display: none; }     /* giảm bớt chữ để không vỡ khung */
  .countdown { margin-top: 2px; }
}

/* ====== Respect reduced motion ====== */
@media (prefers-reduced-motion: reduce) {
  .spinner, .bar { animation: none !important; }
  .btn-primary, .btn-secondary { transition: none !important; }
}
`;
