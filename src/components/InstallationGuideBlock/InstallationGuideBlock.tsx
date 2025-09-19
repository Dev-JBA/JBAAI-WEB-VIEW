import React from 'react';
import './InstallationGuideBlock.css';

const InstallationGuideBlock = () => {
  return (
    <section id="installation" className="tutorial-install-app">
      <h1 className='head-title'>HUỚNG DẪN CÀI ĐẶT ỨNG DỤNG</h1>
      <div className="tutorial-install-video-wrapper">
        <div className="tutorial-install-video">
          <iframe
            className="tutorial-install-iframe"
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/swg5kUCIKpI"
            title="JBAAI App Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <div className="tutorial-install-quote">
        <i><p>Hướng dẫn cài đặt ứng dụng JBAAI trên điện thoại di động của bạn. Tải xuống ứng dụng và bắt đầu hành trình chăm sóc sức khỏe thông minh của bạn ngay hôm nay! </p></i>
      </div>
    </section>
  );
};

export default InstallationGuideBlock;