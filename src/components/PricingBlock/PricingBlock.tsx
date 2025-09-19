import React, { useEffect, useRef, useState } from "react";
import "./PricingBlock.css";

import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import api_get_package from "../../data/api/api_get_package";

type TabType = "standard" | "premium";

const PricingBlock = () => {
  const [activeTab, setActiveTab] = useState<TabType>("standard");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    "s180"
  );
  const [dataPackage, setDataPackage] = useState<any>([]);
  const swiperRef = useRef<SwiperType | null>(null);

  const handlePayment = (packageId: string) => {
    alert(`Bắt đầu quá trình thanh toán cho gói: ${packageId}`);
  };

  /*Call API List Package*/
  const callAPIListPackage = async () => {
    try {
      const response: any = await api_get_package({
        type: activeTab,
      });
      setDataPackage(response);
      if (Array.isArray(response) && response.length > 0) {
        setTimeout(() => {
          if (swiperRef.current) {
            swiperRef.current.slideTo(1, 300);
          }
        }, 100);
        setSelectedPackageId(response[1]._id);
      } else {
        setSelectedPackageId(null);
      }
    } catch (error: any) {
      console.log("Error fetching packages:", error.message);
    }
  };

  useEffect(() => {
    callAPIListPackage();
  }, [activeTab]);

  return (
    <div className="pricing-container">
      <header className="pricing-header">
        <h1 className="head-title">Gói Dịch Vụ</h1>
        <div className="tab-navigator">
          <button
            className={`tab-button ${activeTab === "standard" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("standard");
              setSelectedPackageId("s180");
            }}
          >
            Standard
          </button>
          <button
            className={`tab-button ${activeTab === "premium" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("premium");
              setSelectedPackageId("p180");
            }}
          >
            Premium
          </button>
        </div>
      </header>
      <Swiper
        className="package-swiper"
        loop={false}
        slidesPerView={"auto"}
        spaceBetween={15}
        centeredSlides={true}
        onSwiper={(swiper: any) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper: SwiperType) => {
          const activeSlideId = dataPackage[swiper.realIndex]._id;
          setSelectedPackageId(
            activeSlideId ? activeSlideId : dataPackage[0]._id
          );
        }}
      >
        {dataPackage.map((data: any) => (
          <SwiperSlide key={data._id} className="package-slide">
            <div
              className={`package-card ${
                selectedPackageId === data._id ? "active" : ""
              }`}
              onClick={() => setSelectedPackageId(data._id)}
            >
              {/* Phần 1: Header - cố định ở trên cùng */}
              <div className="card-header">
                <h1 className="package-name">{data.name}</h1>
                <div className="package-row">
                  <p className="package-price">{data.price}$/</p>
                  <p className="package-unit">{data.duration} Ngày</p>
                </div>
              </div>
              <div className="line-divider"></div>

              {/* Phần 2: Body - khu vực sẽ cuộn */}
              <div className="card-body-scrollable">
                <p className="package-description">{data.description}</p>
              </div>

              {/* Phần 3: Nút bấm - cố định ở dưới cùng */}
              <div className="card-payment-button">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePayment(data._id);
                  }}
                >
                  Thanh toán
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
export default PricingBlock;