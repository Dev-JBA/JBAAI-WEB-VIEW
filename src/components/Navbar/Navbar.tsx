import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [bgStyle, setBgStyle] = useState<React.CSSProperties>({});
  const ticking = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const maxBlur = 8; // px
    const maxShadow = 0.1; // opacity
    const maxOpacity = 0.3; // nền đen trong suốt tối đa
    const ramp = 220; // scroll (px) để đạt tối đa

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const t = Math.min(y / ramp, 1); // 0 -> 1
        const opacity = t * maxOpacity;
        const blur = t * maxBlur;
        const shadow = t * maxShadow;

        setBgStyle({
          backgroundColor: `rgba(0,0,0,${opacity})`,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          boxShadow: `0 8px 20px rgba(0,0,0,${shadow})`,
        });

        ticking.current = false;
      });
    };

    onScroll(); // set ngay lần đầu
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToPricing = () => {
    const el = document.getElementById("pricing");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goPricing = () => {
    if (location.pathname === "/") {
      // đang ở Home: cuộn ngay
      scrollToPricing();
    } else {
      // không ở Home: điều hướng về Home và gửi state báo cần cuộn
      navigate("/", { state: { anchor: "pricing" } });
      // không cần setTimeout ở đây; cuộn sẽ được thực hiện ở Home
    }
  };

  return (
    <div className="navbar" style={bgStyle}>
      <div className="navbar-logo">
        <img src="/logo512.png" alt="JBAAI Logo" className="logo" />
        JBAAI
      </div>
      <div className="navbar-links" onClick={goPricing}>
        Gói dịch vụ
      </div>
    </div>
  );
};

export default Navbar;
