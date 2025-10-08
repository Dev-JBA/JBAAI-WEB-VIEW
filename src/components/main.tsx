import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./Navbar/Navbar";
import IntroductionBlock from "./IntroductionBlock/IntroductionBlock";
import PricingBlock from "./PricingBlock/PricingBlock";
import UsageGuideBlock from "./UsageGuideBlock/UsageGuideBlock";
import ResultPage from "../Pages/resultPage/result";
import WorkPage from "../Pages/work";
import ContactPage from "../Pages/contact";
import RequireLogin from "../Pages/requirePage/requireLogin";
import MBOpenPaymentPage from "../Pages/MBOpenPaymentPage";
import AccountPayment from "./AccountPayment/AccountPayment";
import { openMBPaymentScreen } from "./MBOpenPayment/mbPayment";
import GlobalTokenCatcher from "./GlobalTokenCatcher";
import { getSession, isVerified } from "../data/authStorage";
import VerifiedRoute from "../routes/VerifiedRoute";

(window as any).openMBPaymentScreen = openMBPaymentScreen;

const Home: React.FC = () => (
  <div>
    <Navbar />
    <IntroductionBlock />
    <PricingBlock />
    <UsageGuideBlock />
  </div>
);

// /require-login: khi verify xong thì tự quay về “next” (nếu có)
const RequireLoginAuto: React.FC = () => {
  const nav = useNavigate();
  const loc = useLocation();
  React.useEffect(() => {
    const goNext = () => {
      const next = (loc.state as any)?.next || "/";
      nav(next, { replace: true });
    };
    if (isVerified() && getSession()?.sessionId) goNext();
    const onVerified = () => goNext();
    window.addEventListener("mb:verified", onVerified);
    return () => window.removeEventListener("mb:verified", onVerified);
  }, [nav, loc.state]);
  return <RequireLogin />;
};

const Main: React.FC = () => (
  <Router>
    {/* ✅ VERIFY 1 LẦN Ở ĐÂY */}
    <GlobalTokenCatcher />

    <Routes>
      {/* Các trang KHÔNG cần phiên */}
      <Route path="/require-login" element={<RequireLoginAuto />} />
      <Route path="/account-payment" element={<AccountPayment />} />
      <Route path="/payment" element={<MBOpenPaymentPage />} />

      {/* Các trang CẦN phiên MB → bọc dưới VerifiedRoute */}
      <Route element={<VerifiedRoute />}>
        <Route path="/" element={<Home />} />

        <Route path="/mbapp/result" element={<ResultPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
    </Routes>
  </Router>
);

export default Main;
