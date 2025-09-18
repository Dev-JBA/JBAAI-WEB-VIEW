// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import { bootstrapLoginTokenAndVerifyFE } from "./utils/url-auth";
import { useAuthStore } from "./store/auth";

import IntroductionBlock from "./components/IntroductionBlock";
import PricingBlock from "./components/PricingBlock";
// import InstallationGuideBlock from "./components/InstallationGuideBlock";
import UsageGuideBlock from "./components/UsageGuideBlock";
import PaymentSuccess from "./components/PaymentSuccess";

/** Re-render khi URL thay đổi qua history API (popstate) */
function useUrlVersion() {
  const [ver, setVer] = useState(0);
  useEffect(() => {
    const handler = () => setVer((v) => v + 1);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);
  return ver;
}

export default function App() {
  const { verified } = useAuthStore();
  const urlVersion = useUrlVersion();

  // Phân tích URL để quyết định render gì
  const urlState = useMemo(() => {
    const url = new URL(window.location.href);
    const query = url.searchParams;
    const hash = url.hash ? url.hash.substring(1) : ""; // bỏ ký tự '#'

    const token = query.get("loginToken") || "";
    const hasToken = !!token;
    const hasHash = !!hash;

    const view = (query.get("view") || "").toLowerCase();
    const showSuccess =
      view === "success" ||
      (hash || "").toLowerCase().includes("payment-success");

    return { hasToken, hasHash, showSuccess };
  }, [urlVersion]);

  // Chỉ verify nếu CÓ token
  useEffect(() => {
    if (urlState.hasToken) {
      void (async () => {
        await bootstrapLoginTokenAndVerifyFE();
      })();
    }
  }, [urlState.hasToken]);

  // ==== Điều kiện hiển thị theo yêu cầu ====
  // 1) Không token & không hash => render Home
  if (!urlState.hasToken && !urlState.hasHash) {
    return (
      <div className="App">
        <IntroductionBlock />
        <PricingBlock />
        {/* <InstallationGuideBlock /> */}
        <UsageGuideBlock />
      </div>
    );
  }

  // 2) Có hash nhưng không có token => báo lỗi
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

  // 3) Có token: nếu view=success (hoặc #payment-success) => trang Thanh toán thành công
  if (urlState.showSuccess) {
    // Có thể yêu cầu verified trước khi hiển thị thành công; nếu cần, thêm: if (!verified) return null;
    const url = new URL(window.location.href);
    const q = url.searchParams;

    const params = {
      orderId: q.get("orderId") || undefined,
      packageName: q.get("packageName") || undefined,
      amount: q.get("amount") || undefined,
      currency: q.get("currency") || undefined,
      paidAt: q.get("paidAt") || undefined,
    };

    return <PaymentSuccess {...params} />;
  }

  // 4) Có token nhưng không vào success => (tuỳ bạn) render Home sau verify
  //    Trước đây bạn muốn ẩn hết nếu chưa verified; nếu vẫn muốn vậy, bỏ comment 2 dòng dưới:
  // if (!verified) return null;

  return (
    <div className="App">
      <IntroductionBlock />
      <PricingBlock />
      {/* <InstallationGuideBlock /> */}
      <UsageGuideBlock />
    </div>
  );
}
