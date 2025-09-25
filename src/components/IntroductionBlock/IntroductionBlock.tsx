import React, { useRef, useState, useEffect, useMemo } from "react";
import "./IntroductionBlock.css";

/** ========= TypewriterText =========
 * Gõ chữ từng ký tự + caret nháy, tôn trọng reduced motion
 */
const TypewriterText: React.FC<{
  text: string;
  speed?: number;
  startDelay?: number;
  cursor?: boolean;
  loop?: boolean;
  className?: string;
  onDone?: () => void;
}> = ({
  text,
  speed = 24,
  startDelay = 120,
  cursor = true,
  loop = false,
  className,
  onDone,
}) => {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let i = 0;
    setOut("");
    setDone(false);

    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    if (reduce) {
      setOut(text);
      setDone(true);
      onDone?.();
      return;
    }

    const startTimer = setTimeout(function tick() {
      if (cancelled) return;
      setOut((prev) => prev + text.charAt(i));
      i++;
      if (i < text.length) {
        setTimeout(tick, speed);
      } else {
        setDone(true);
        onDone?.();
        if (loop) {
          setTimeout(() => {
            if (cancelled) return;
            setOut("");
            setDone(false);
            i = 0;
            setTimeout(tick, speed);
          }, 900);
        }
      }
    }, startDelay);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
    };
  }, [text, speed, startDelay, loop, onDone]);

  return (
    <span
      className={`typew ${done ? "typew-done" : ""} ${className || ""}`}
      aria-live="polite"
    >
      {out}
      {cursor && <span className="typew-caret" aria-hidden="true" />}
    </span>
  );
};

/** ========= RevealWords =========
 * Hiện chữ dần theo TỪ, giữ nguyên thẻ inline (b/i/a…)
 */
const RevealWords: React.FC<{
  children: React.ReactNode;
  baseDelay?: number;
  interval?: number;
  maxDuration?: number;
  className?: string;
}> = ({
  children,
  baseDelay = 80,
  interval = 22,
  maxDuration = 2000,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    if (reduce) {
      root.classList.add("rw-visible");
      return;
    }

    const wrapTextNodes = (node: Node) => {
      if (node.nodeType === 1) {
        const el = node as HTMLElement;
        if (["SCRIPT", "STYLE"].includes(el.tagName)) return;
        Array.from(node.childNodes).forEach(wrapTextNodes);
        return;
      }
      if (node.nodeType === 3) {
        const text = (node as Text).nodeValue;
        if (!text || !text.trim()) return;
        const parent = node.parentNode as HTMLElement;
        const frag = document.createDocumentFragment();
        const parts = text.split(/(\s+)/);
        parts.forEach((part) => {
          if (/\s+/.test(part)) frag.appendChild(document.createTextNode(part));
          else {
            const span = document.createElement("span");
            span.className = "reveal-word";
            span.textContent = part;
            frag.appendChild(span);
          }
        });
        parent.replaceChild(frag, node);
      }
    };

    const targets = root.querySelectorAll<HTMLElement>("[data-rw]");
    targets.forEach((el) => wrapTextNodes(el));

    targets.forEach((el) => {
      const words = el.querySelectorAll<HTMLElement>(".reveal-word");
      const n = words.length;
      if (!n) return;
      const total = Math.min(baseDelay + interval * n, maxDuration);
      const effInterval = Math.max(8, Math.floor((total - baseDelay) / n));
      words.forEach((w, i) =>
        w.style.setProperty("--rw-delay", `${baseDelay + effInterval * i}ms`)
      );

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              el.classList.add("rw-visible");
              io.unobserve(el);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
      );
      io.observe(el);
    });
  }, [baseDelay, interval, maxDuration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

/** ========= ScrollReveal (fade-up/fade-in cho khối) ========= */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** ========= Slogan dưới logo ========= */
const Slogan: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="slogan-wrap" data-reveal="fade-in">
      <span className="slogan">{text}</span>
    </div>
  );
};

const IntroductionBlock: React.FC = () => {
  useReveal();

  return (
    <div className="container-introduction">
      <img src="/logo512.png" alt="JBAAI Logo" className="logo" />

      {/* SLOGAN ngay dưới logo */}
      <Slogan text="Sống khỏe chủ động — Hiểu cơ thể trong 60 giây" />

      {/* --- INTRO HERO --- */}
      <section className="intro-hero" data-reveal="fade-up">
        <div
          className="intro-badge"
          data-reveal="fade-in"
          style={{ ["--d" as any]: "20ms" }}
        >
          AI Health • SaMD
        </div>

        <h1
          className="intro-title"
          data-reveal="fade-up"
          style={{ ["--d" as any]: "60ms" }}
        >
          Giới Thiệu
        </h1>

        {/* Subtitle gõ chữ */}
        <TypewriterText
          text="  Trợ lý sức khỏe ứng dụng AI – Cá nhân hoá cho bạn"
          className="intro-subtitle"
          startDelay={180}
          speed={22}
        />

        {/* Đoạn dài: hiện dần theo TỪ */}
        <RevealWords baseDelay={120} interval={24} maxDuration={1600}>
          <p className="intro-lead" data-rw>
            <b>JBAAI</b> là ứng dụng chăm sóc sức khỏe thông minh ứng dụng{" "}
            <b>AI</b> để theo dõi, quản lý và cải thiện sức khỏe toàn diện. Ứng
            dụng hoạt động như một
            <b> “trợ lý sức khỏe”</b> cá nhân, đưa ra gợi ý dinh dưỡng – luyện
            tập – tư vấn y tế theo <b>ngữ cảnh</b> và <b>cá nhân hóa</b>, giúp
            bạn ra quyết định đúng lúc và sống cân bằng hơn.
          </p>
        </RevealWords>

        <ul className="feature-chips">
          {[
            "Phân tích rPPG 20–60s",
            "Theo dõi chỉ số thời gian thực",
            "Tư vấn bởi AI",
          ].map((t, i) => (
            <li
              key={t}
              data-reveal="fade-up"
              style={{ ["--d" as any]: `${160 + i * 60}ms` }}
            >
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* --- ABOUT --- */}
      <AboutUs />

      {/* --- CAROUSEL --- */}
      <DetailApp />
    </div>
  );
};

const AboutUs: React.FC = () => {
  return (
    <section className="container-about grid-two" data-reveal="fade-up">
      <img
        src="https://jbabrands.ai/wp-content/uploads/2025/08/s3.png"
        alt="JBAAI App Preview"
        className="aboutus-image"
        data-reveal="fade-in"
        style={{ ["--d" as any]: "40ms" }}
      />

      <div
        className="aboutus-right"
        data-reveal="fade-up"
        style={{ ["--d" as any]: "80ms" }}
      >
        <div className="aboutus-label">Giới Thiệu Ứng Dụng</div>
        <h2 className="aboutus-title">Ứng Dụng JBAAI</h2>

        <RevealWords baseDelay={60} interval={22} maxDuration={1800}>
          <p className="aboutus-content" data-rw>
            Nền tảng sử dụng AI và các thuật toán học sâu để trích xuất những
            phép đo sức khỏe quan trọng từ{" "}
            <b>tín hiệu quang trắc thể tích (PPG)</b> chỉ trong 20–60 giây. Bằng
            cách kết hợp thị giác máy tính, xử lý tín hiệu và học máy, JBAAI
            cung cấp các <b>dấu hiệu sinh tồn</b> và <b>biomarkers</b> với độ
            tin cậy cao.
          </p>
        </RevealWords>

        <RevealWords baseDelay={80} interval={22} maxDuration={1800}>
          <p className="aboutus-content" data-rw>
            Được triển khai dưới dạng <b>SaMD</b>, JBAAI hỗ trợ kiểm tra{" "}
            <b>rPPG không tiếp xúc</b> qua camera của điện thoại/máy tính bảng,
            đồng thời theo dõi liên tục qua cảm biến PPG tiếp xúc để nắm bắt sức
            khỏe <b>thời gian thực</b>.
          </p>
        </RevealWords>
      </div>
    </section>
  );
};

type CardInforProps = {
  img: string;
  title: string;
  desc: string;
  color: string;
};

const CardInfor: React.FC<CardInforProps> = ({ img, title, desc }) => {
  return (
    <article className="hero-card" data-reveal="fade-up">
      <div className="hero-media">
        <img src={img} alt={title} loading="lazy" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h3 className="hero-title">{title}</h3>
          <p className="hero-desc">{desc}</p>
        </div>
      </div>
    </article>
  );
};

const DetailApp: React.FC = () => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [slideW, setSlideW] = useState(0);
  const [autoPlay] = useState(true);

  const items = useMemo(
    () => [
      {
        img: "https://jbabrands.ai/wp-content/uploads/2025/08/s1.jpg",
        title: "Theo dõi sức khỏe",
        desc: "Ghi nhận các chỉ số và phát hiện sớm bất thường để bạn chủ động kiểm soát sức khỏe.",
        color: "#679be2",
      },
      {
        img: "https://jbabrands.ai/wp-content/uploads/2025/04/b5.jpg",
        title: "Trợ lý AI",
        desc: "Đề xuất chế độ ăn – luyện tập – thói quen sống cá nhân hóa theo mục tiêu của bạn.",
        color: "#4fc3c9",
      },
      {
        img: "https://jbabrands.ai/wp-content/uploads/2025/08/s5.jpg",
        title: "Phân tích qua khuôn mặt",
        desc: "Khai thác tín hiệu sinh học từ khuôn mặt để hiểu sâu hơn tình trạng sức khỏe.",
        color: "#b48ecb",
      },
      {
        img: "https://jbabrands.ai/wp-content/uploads/2025/08/s2.jpg",
        title: "Chứng nhận SaMD",
        desc: "Công nghệ rPPG hỗ trợ theo dõi nhịp tim, hô hấp, HRV… với tiêu chuẩn y tế.",
        color: "#f7b267",
      },
    ],
    []
  );

  const slides = useMemo(
    () => [items[items.length - 1], ...items, items[0]],
    [items]
  );

  useEffect(() => {
    if (!viewportRef.current) return;
    const el = viewportRef.current;
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width);
      if (w > 0 && w !== slideW) setSlideW(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [slideW]);

  useEffect(() => {
    if (!slideW || !autoPlay) return;
    const id = setInterval(() => setIndex((p) => p + 1), 3000);
    return () => clearInterval(id);
  }, [slideW, autoPlay]);

  useEffect(() => {
    if (!slideW) return;
    if (index === slides.length - 1) {
      setAnimate(false);
      requestAnimationFrame(() => {
        setIndex(1);
        requestAnimationFrame(() => setAnimate(true));
      });
    } else if (index === 0) {
      setAnimate(false);
      requestAnimationFrame(() => {
        setIndex(items.length);
        requestAnimationFrame(() => setAnimate(true));
      });
    }
  }, [index, slideW, slides.length, items.length]);

  const activeDot =
    (((index - 1) % items.length) + items.length) % items.length;

  return (
    <div ref={viewportRef} className="carousel-viewport" data-reveal="fade-up">
      <div
        className="carousel-track"
        style={{
          transform: `translate3d(${-index * slideW}px,0,0)`,
          transition: animate ? "transform 420ms ease" : "none",
        }}
      >
        {slides.map((s, i) => (
          <div key={`${s?.title}-${i}`} className="carousel-slide">
            <CardInfor
              img={s.img}
              title={s.title}
              desc={s.desc}
              color={s.color}
            />
          </div>
        ))}
      </div>

      <div className="dots">
        {items.map((_, i) => (
          <span
            key={i}
            onClick={() => {
              setAnimate(true);
              setIndex(i + 1);
            }}
            className={`dot ${i === activeDot ? "active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
};

export default IntroductionBlock;
