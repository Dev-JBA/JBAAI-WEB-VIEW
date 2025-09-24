import React, { useRef, useState, useEffect, useMemo } from "react";
import "./IntroductionBlock.css";
// import heathyCareImg from "../assets/img/heathy-care.png";
import UsageGuideBlock from "../UsageGuideBlock/UsageGuideBlock";
import InstallationGuideBlock from "../InstallationGuideBlock/InstallationGuideBlock";
import "../../styles/HomePage.css";

const IntroductionBlock: React.FC = () => {
  return (
    <div className="container-introduction">
      <img src="/logo512.png" alt="JBAAI Logo" className="logo" />
      <DetailApp />
      <div className="container-detail">
        <h1 className="head-title">Giới Thiệu</h1>
        <p>
          <b>JBAAI</b> là ứng dụng chăm sóc sức khỏe thông minh, ứng dụng trí
          tuệ nhân tạo (AI) để hỗ trợ bạn theo dõi, quản lý và cải thiện sức
          khỏe một cách toàn diện. Chúng tôi tin rằng mỗi người đều xứng đáng có
          một “trợ lý sức khỏe” riêng, giúp đưa ra những quyết định đúng đắn,
          kịp thời và mang tính cá nhân hóa. Với JBAAI, bạn không chỉ dễ dàng
          theo dõi các chỉ số sức khỏe của mình, mà còn nhận được những gợi ý
          phù hợp về chế độ ăn uống, luyện tập và tư vấn y tế, nhằm hướng tới
          một lối sống lành mạnh và cân bằng hơn.
        </p>
      </div>
      <AboutUs />
      {/* Nếu cần, có thể hiển thị các block khác */}
      {/* <InstallationGuideBlock /> */}
      {/* <UsageGuideBlock /> */}
    </div>
  );
};

const AboutUs: React.FC = () => {
  return (
    <div className="container-about">
      <img
        src="https://jbabrands.ai/wp-content/uploads/2025/08/s3.png"
        alt="Consulting Team"
        className="aboutus-image"
      />
      <div className="aboutus-right">
        <div className="aboutus-label">Giới Thiệu Ứng Dụng</div>
        <div className="aboutus-title">Ứng Dụng JBAAI</div>
        <div className="aboutus-content">
          Công nghệ phần mềm của JBAAI sử dụng Al tiên tiến và các thuật toán
          học sâu để trích xuất các phép đo sức khỏe quan trọng bằng phương pháp
          quang trắc thể tích (PPG) trong vòng 20-60 giây . Bằng cách kết hợp
          các kỹ thuật thị giác máy tính, xử lý tín hiệu và học máy, JBAAI phân
          tích tín hiệu PPG để cung cấp các phép đo dấu hiệu sinh tồn và dấu ấn
          sinh học với độ chính xác cao.
        </div>
        <div className="aboutus-content">
          Được cung cấp dưới dạng Ứng dụng Phần mềm dưới dạng Thiết bị Y tế
          (SaMD) (ng dụng JBAAI), công nghệ này hỗ trợ: • Kiếm tra tại chỗ rPPG
          không tiếp xúc thông qua các thiết bị có camera như điện thoại thông
          minh và máy tính bảng ® Theo dõi liên tục thông qua cảm biến PPG tiếp
          xúc để theo dõi sức khỏe theo thời gian thực
        </div>
      </div>
    </div>
  );
};

type CardInforProps = {
  img: string;
  title: string;
  desc: string;
  color: string;
};

const CardInfor: React.FC<CardInforProps> = ({ img, title, desc, color }) => {
  return (
    <div
      className="card-infor"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <article className="hero-card">
        <div className="hero-media">
          <img src={img} alt={title} loading="lazy" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <h3 className="hero-title">{title}</h3>
            <p className="hero-desc">{desc}</p>
          </div>
        </div>
      </article>
    </div>
  );
};

const DetailApp: React.FC = () => {
  const viewportRef = React.useRef<HTMLDivElement>(null);

  const [index, setIndex] = React.useState(1);
  const [animate, setAnimate] = React.useState(true);
  const [slideW, setSlideW] = React.useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const items = React.useMemo(
    () => [
      {
        img: "https://jbabrands.ai/wp-content/uploads/2025/08/s1.jpg",
        title: "Theo dõi sức khỏe",
        desc: "Ghi nhận các chỉ số sức khỏe như nhịp tim, huyết áp, lượng đường, cân nặng… Ứng dụng giúp bạn kiểm soát và phát hiện sớm các dấu hiệu bất thường.",
        color: "#679be2",
      },
      {
        img: "https://jbabrands.ai/wp-content/uploads/2025/04/b5.jpg",
        title: "Trợ lý AI tư vấn sức khỏe",
        desc: "Đưa ra gợi ý chế độ ăn uống, tập luyện và thói quen sinh hoạt phù hợp với từng người. AI đồng hành cùng bạn xây dựng lối sống lành mạnh, khoa học.",
        color: "#4fc3c9",
      },
      {
        img: "https://jbabrands.ai/wp-content/uploads/2025/08/s5.jpg",
        title: "Phân tích sức khoẻ qua khuôn mặt",
        desc: "Công nghệ nhận diện khuôn mặt để đánh giá tình trạng sức khỏe của người dùng. Phân tích các chỉ số sinh học giúp bạn hiểu rõ hơn về sức khỏe bản thân.",
        color: "#b48ecb",
      },
      {
        img: "https://jbabrands.ai/wp-content/uploads/2025/08/s2.jpg",
        title: "JBAAI đạt chứng nhận FDA",
        desc: "JBAAI đã được FDA Hoa Kỳ chứng nhận là phần mềm thiết bị y tế (SaMD), ứng dụng công nghệ rPPG để theo dõi nhịp tim, hô hấp, HRV...",
        color: "#f7b267",
      },
    ],
    []
  );

  const slides = React.useMemo(
    () => [items[items.length - 1], ...items, items[0]],
    [items]
  );

  React.useEffect(() => {
    if (!viewportRef.current) return;
    const el = viewportRef.current;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.round(entry.contentRect.width);
        if (w > 0 && w !== slideW) {
          setSlideW(w);
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [slideW]);

  React.useEffect(() => {
    if (!slideW || !autoPlay) return;
    const id = setInterval(() => setIndex((prev) => prev + 1), 3000);
    return () => clearInterval(id);
  }, [slideW, autoPlay]);

  React.useEffect(() => {
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

  const goDot = (i: number) => {
    setAnimate(true);
    setIndex(i + 1);
  };

  return (
    <div
      ref={viewportRef}
      className="carousel-viewport"
      style={{
        width: "100%",
        backgroundColor: "transparent",
        margin: "0 auto",
        overflow: "hidden",
      }}
    >
      {/* Track: transform theo px dựa trên index & slideW */}
      <div
        className="carousel-track"
        style={{
          display: "flex",
          willChange: "transform",
          backgroundColor: "transparent",
          transform: `translate3d(${-index * slideW}px, 0, 0)`,
          transition: animate ? "transform 420ms ease" : "none",
        }}
      >
        {slides.map((s, i) => (
          <div
            key={`${s?.title ?? "slide"}-${i}`}
            className="carousel-slide"
            style={{ flex: "0 0 100%" }}
          >
            <CardInfor
              img={s.img}
              title={s.title}
              desc={s.desc}
              color={s.color}
            />
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 12 }}>
        {items.map((_, i) => (
          <span
            key={i}
            onClick={() => goDot(i)}
            className={`dot ${i === activeDot ? "active" : ""}`}
            style={{
              cursor: "pointer",
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              margin: "0 3px",
              opacity: "0.5",
              background: i === activeDot ? "#333333" : "#555555",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default IntroductionBlock;
