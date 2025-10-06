import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [bgStyle, setBgStyle] = useState<React.CSSProperties>({});
  const ticking = useRef(false);

  useEffect(() => {
    const maxBlur = 8;
    const maxShadow = 0.35;
    const maxOpacity = 0.75;
    const ramp = 220;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const t = Math.min(y / ramp, 1);
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

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="navbar" style={bgStyle}>
      {/* Bấm logo => về Home "/" */}
      <Link to="/" className="navbar-logo" aria-label="Go home">
        <img src="/logo512.png" alt="JBAAI Logo" className="logo" />
        <span>JBAAI</span>
      </Link>

      {/* Nút điều hướng sang Pricing */}
      <Link to="/pricing" className="navbar-links" role="button">
        Gói dịch vụ
      </Link>
    </div>
  );
};

export default Navbar;
