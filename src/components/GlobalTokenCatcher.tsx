// src/components/GlobalTokenCatcher.ts
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyToken } from "../data/api/api_verify_token";
import { setVerifiedToken } from "../data/authStorage";
import { ApiError } from "../data/apiHelper"; // <-- sửa path nếu cần

// helper nhận diện AbortError (cleanup/StrictMode)
function isAbortError(e: any) {
  return (
    e?.name === "AbortError" ||
    String(e?.message || "")
      .toLowerCase()
      .includes("abort")
  );
}

function extractLoginToken(location: ReturnType<typeof useLocation>): string {
  const qs = new URLSearchParams(location.search);
  const q = (qs.get("loginToken") || "").trim();
  if (q) return q;

  const rawHash = (location.hash || "").replace(/^#/, "");
  if (!rawHash) return "";

  if (rawHash.includes("loginToken=") && !rawHash.includes("/")) {
    const hp = new URLSearchParams(rawHash);
    const hv = (hp.get("loginToken") || "").trim();
    if (hv) return hv;
  }

  const qm = rawHash.indexOf("?");
  if (qm >= 0) {
    const afterQ = rawHash.slice(qm + 1);
    const hp2 = new URLSearchParams(afterQ);
    const hv2 = (hp2.get("loginToken") || "").trim();
    if (hv2) return hv2;
  }

  const m = rawHash.match(/(?:^|[?&#])loginToken=([^&#]+)/i);
  if (m && m[1]) {
    try {
      return decodeURIComponent(m[1]).trim();
    } catch {
      return m[1].trim();
    }
  }

  return "";
}

function stripLoginToken(location: ReturnType<typeof useLocation>) {
  const urlParams = new URLSearchParams(location.search);
  urlParams.delete("loginToken");

  let newHash = (location.hash || "").replace(/^#/, "");
  if (newHash) {
    const qm = newHash.indexOf("?");
    if (qm >= 0) {
      const before = newHash.slice(0, qm);
      const after = newHash.slice(qm + 1);
      const hashQs = new URLSearchParams(after);
      hashQs.delete("loginToken");
      const qsStr = hashQs.toString();
      newHash = qsStr ? `${before}?${qsStr}` : before;
    } else {
      const hp = new URLSearchParams(newHash);
      if (hp.has("loginToken")) {
        hp.delete("loginToken");
        newHash = hp.toString();
      }
    }
  }

  return {
    pathname: location.pathname,
    search: urlParams.toString() ? `?${urlParams.toString()}` : "",
    hash: newHash ? `#${newHash}` : "",
  };
}

const GlobalTokenCatcher: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const runningRef = React.useRef(false);

  React.useEffect(() => {
    const loginToken = extractLoginToken(location);
    console.log(
      "[Catcher] search:",
      location.search,
      "hash:",
      location.hash,
      "extracted:",
      loginToken
    );

    if (!loginToken || runningRef.current) return;

    runningRef.current = true;
    const ac = new AbortController();

    (async () => {
      try {
        const verified = await verifyToken(loginToken, ac.signal);
        setVerifiedToken(verified);

        const cleaned = stripLoginToken(location);
        navigate(cleaned, { replace: true });
      } catch (e: unknown) {
        // ⬇️⬇️ Thêm đoạn này để KHÔNG redirect khi bị abort do cleanup/StrictMode
        if (isAbortError(e)) {
          console.info("[verifyToken] aborted (ignored)");
          return;
        }
        if (e instanceof ApiError) {
          console.error(
            "[verifyToken ApiError]",
            e.status,
            e.message,
            e.details ?? ""
          );
        } else {
          console.error("[verifyToken Error]", e);
        }
        navigate("/require-login", {
          replace: true,
          state: {
            message:
              "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
          },
        });
      } finally {
        runningRef.current = false;
      }
    })();

    return () => ac.abort();
  }, [location, navigate]);

  return null;
};

export default GlobalTokenCatcher;
