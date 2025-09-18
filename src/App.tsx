// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import { bootstrapLoginTokenAndVerifyFE } from "./utils/url-auth";
import { useAuthStore } from "./store/auth";

import IntroductionBlock from "./components/IntroductionBlock";
import PricingBlock from "./components/PricingBlock";
import UsageGuideBlock from "./components/UsageGuideBlock";
import PaymentSuccess from "./components/PaymentSuccess";
import ResultPage from "./pages/ResultPage";

/** Lắng nghe thay đổi URL do history API + custom 'urlchange' */
function useUrlVersion() {
  const [ver, setVer] = useState(0);
  useEffect(() => {
    const handler = () => setVer((v) => v + 1);
    window.addEventListener("popstate", handler);
    window.addEventListener("urlchange", handler); // <- thêm custom event
    return () => {
      window.removeEventListener("popstate", handler);
      window.removeEventListener("urlchange", handler);
    };
  }, []);
  return ver;
}

export default function App() {
  const urlVersion = useUrlVersion();
  const { verified } = useAuthStore();

  const urlState = useMemo(() => {
    const url = new URL(window.location.href);
    const query = url.searchParams;
    const hashRaw = url.hash || "";
    const hash = hashRaw.toLowerCase();
    const pathname = url.pathname;

    const token = query.get("loginToken") || "";
    const hasToken = !!token;
    const hasHash = !!hashRaw;

    const view = (query.get("view") || "").toLowerCase();
    const showSuccess = view === "success" || hash.includes("payment-success");

    const successParams = {
      orderId: query.get("orderId") || undefined,
      packageName: query.get("packageName") || undefined,
      amount: query.get("amount") || undefined,
      currency: query.get("currency") || undefined,
      paidAt: query.get("paidAt") || undefined,
    };

    const isResultPath = pathname === "/mbapp/result";

    return { hasToken, hasHash, showSuccess, successParams, isResultPath };
  }, [urlVersion]);

  // Chỉ verify khi CÓ token
  useEffect(() => {
    if (urlState.hasToken) {
      void (async () => {
        await bootstrapLoginTokenAndVerifyFE();
      })();
    }
  }, [urlState.hasToken]);

  // ===== Thứ tự nhánh render (QUAN TRỌNG) =====

  // 1) Nếu path là /mbapp/result -> luôn hiện trang Result trước (không bị rơi về Home)
  if (urlState.isResultPath) {
    return <ResultPage />; // hiện "ok" như yêu cầu MB
  }

  // 2) Không token & không hash => render Home
  if (!urlState.hasToken && !urlState.hasHash) {
    return (
      <div className="App">
        <IntroductionBlock />
        <PricingBlock />
        <UsageGuideBlock />
      </div>
    );
  }

  // 3) Có hash nhưng không token => báo lỗi
  if (!urlState.hasToken && urlState.hasHash) {
    return (
      <div className="App" style={{ padding: 16 }}>
        <h3>Thiếu thông tin đăng nhập</h3>
        <p>
          Không tìm thấy <code>loginToken</code>. Vui lòng mở lại mini app từ
          ứng dụng MB Bank để đăng nhập và tiếp tục.
        </p>
      </div>
    );
  }

  // 4) Có token và có view=success (hoặc #payment-success) => trang thành công chi tiết
  if (urlState.showSuccess) {
    return <PaymentSuccess {...urlState.successParams} />;
  }

  // 5) Mặc định: Home (tuỳ chọn chặn khi chưa verified)
  // if (!verified) return null;
  return (
    <div className="App">
      <IntroductionBlock />
      <PricingBlock />
      <UsageGuideBlock />
    </div>
  );
}
