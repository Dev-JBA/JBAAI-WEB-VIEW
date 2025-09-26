import React, { useEffect, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

// Các block/trang sẵn có của bạn:
import IntroductionBlock from "./IntroductionBlock/IntroductionBlock";
import Navbar from "./Navbar/Navbar";
import PricingBlock from "./PricingBlock/PricingBlock";
import UsageGuideBlock from "./UsageGuideBlock/UsageGuideBlock";
import ResultPage from "../Pages/resultPage/result";
import WorkPage from "../Pages/work";
import ContactPage from "../Pages/contact";
import RequireLogin from "../Pages/requirePage/requireLogin";

const MainContent: React.FC = () => {
  return (
    <div>
      <Navbar />
      <IntroductionBlock />
      <PricingBlock />
      <UsageGuideBlock />
    </div>
  );
};

const HomeGuard: React.FC = () => {
  const { search, hash } = useLocation();

  const { loginToken, hasToken, hasHash, cleanHash } = useMemo(() => {
    const params = new URLSearchParams(search);
    const token = (params.get("loginToken") || "").trim();
    const tokenExists = token.length > 0;

    // location.hash trả về dạng "#ABC" hoặc ""
    const hasHashFlag = !!hash && hash.length > 1;
    const normalizedHash = hasHashFlag ? hash.slice(1) : ""; // bỏ dấu '#'

    return {
      loginToken: token,
      hasToken: tokenExists,
      hasHash: hasHashFlag,
      cleanHash: normalizedHash,
    };
  }, [search, hash]);

  // Khi có token -> log JSON ra console
  useEffect(() => {
    if (hasToken) {
      console.log(JSON.stringify({ loginToken, hash: cleanHash }));
    }
  }, [hasToken, loginToken, cleanHash]);

  // Điều kiện:
  // 1) Có token và có hash -> Main
  // 2) Không token và không hash -> Main
  // 3) Chỉ có hash (không token) -> RequireLogin
  // 4) Có token nhưng không hash -> RequireLogin
  const goMain = (hasToken && hasHash) || (!hasToken && !hasHash);

  if (goMain) {
    return <MainContent />;
  }

  return <Navigate to="/require-login" replace />;
};

const Main: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/mbapp/result" element={<ResultPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Trang báo lỗi đăng nhập */}
        <Route path="/require-login" element={<RequireLogin />} />

        {/* Trang chủ với guard */}
        <Route path="/" element={<HomeGuard />} />
      </Routes>
    </Router>
  );
};

export default Main;
