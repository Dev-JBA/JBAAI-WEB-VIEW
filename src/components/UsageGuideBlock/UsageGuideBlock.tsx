import React, { useState } from "react";
import "./UsageGuideBlock.css";
import "../../styles/HomePage.css";

const UsageGuideBlock = () => {
  const [play, setPlay] = useState(false);

  return (
    <section id="usage" className="usage-guide-app">
      <h1 className="head-title">HƯỚNG DẪN CÀI ĐẶT &amp; SỬ DỤNG ỨNG DỤNG</h1>

      <div className="usage-guide-video-wrapper">
        <div className="video-wrapper">
          {!play ? (
            <button
              type="button"
              className="video-poster"
              onClick={() => setPlay(true)}
              aria-label="Phát video hướng dẫn JBAAI"
            >
              <img
                src="/video.png"
                alt="JBAAI Demo Poster"
                className="poster-img"
              />
              <span className="play-btn" aria-hidden="true">
                ▶
              </span>
            </button>
          ) : (
            <iframe
              className="video-iframe"
              src="https://player.vimeo.com/video/1111607386?autoplay=1&muted=1&title=0&byline=0&portrait=0&dnt=1&app_id=58479"
              title="JBAAI"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          )}
        </div>
      </div>

      <footer
        style={{
          textAlign: "center",
          paddingTop: 50,
          paddingBottom: 40,
          color: "#888",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        © 2025 JBAAI
        <div className="wave-divider"></div>
      </footer>
    </section>
  );
};

export default UsageGuideBlock;