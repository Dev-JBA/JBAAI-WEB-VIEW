import { useEffect, useRef, useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [bgStyle, setBgStyle] = useState<React.CSSProperties>({});
  const ticking = useRef(false);

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
          // nền đen trong suốt tăng dần
          backgroundColor: `rgba(0,0,0,${opacity})`,
          // làm mờ nền sau tăng dần
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          // bóng dưới nhẹ dần
          boxShadow: `0 8px 20px rgba(0,0,0,${shadow})`,
        });

        ticking.current = false;
      });
    };

    onScroll(); // set ngay lần đầu
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="navbar" style={bgStyle}>
      <div className="navbar-logo">
        <img src="/logo512.png" alt="JBAAI Logo" className="logo" />
        JBAAI
      </div>
      <div className="navbar-links">Gói dịch vụ</div>
    </div>
  );
};

export default Navbar;
