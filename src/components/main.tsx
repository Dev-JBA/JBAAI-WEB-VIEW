import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Các block/trang sẵn có của bạn:
import IntroductionBlock from "./IntroductionBlock/IntroductionBlock";
import Navbar from "./Navbar/Navbar";
import PricingBlock from "./PricingBlock/PricingBlock";
import UsageGuideBlock from "./UsageGuideBlock/UsageGuideBlock";
import ResultPage from "../Pages/resultPage/result";
import WorkPage from "../Pages/work";
import ContactPage from "../Pages/contact";
import RequireLogin from "../Pages/requirePage/requireLogin";

// ✅ BẮT & VERIFY TOKEN TOÀN CỤC (ở mọi trang)
import GlobalTokenCatcher from "./GlobalTokenCatcher";

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

// ❌ ĐÃ BỎ HomeGuard để tránh redirect sai
// (Nếu còn đoạn khai báo HomeGuard ở dưới, bạn có thể xóa/ghi chú lại)

const Main: React.FC = () => {
  return (
    <Router>
      {/* Luôn lắng nghe ?loginToken=... / #loginToken=... để verify */}
      <GlobalTokenCatcher />

      <Routes>
        {/* Trang chủ: render thẳng MainContent */}
        <Route path="/" element={<MainContent />} />

        <Route path="/mbapp/result" element={<ResultPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Trang báo lỗi đăng nhập */}
        <Route path="/require-login" element={<RequireLogin />} />
      </Routes>
    </Router>
  );
};

export default Main;
