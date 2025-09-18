import React, { useEffect, useRef, useState, useCallback } from "react";
import "../styles/PricingStyles.css";

import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import api_get_package from "../services/api/api_get_package";
import { navigateToResult } from "../utils/navigation";
import { useAuthStore } from "../store/auth";

type TabType = "standard" | "premium";

type PackageItem = {
  _id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
};

const PricingBlock = () => {
  // Lấy trạng thái xác thực từ store
  const { loginToken, verified } = useAuthStore();
  const canPay = Boolean(loginToken) && Boolean(verified);

  const [activeTab, setActiveTab] = useState<TabType>("standard");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    "s180"
  );
  const [dataPackage, setDataPackage] = useState<PackageItem[]>([]);
  const swiperRef = useRef<SwiperType | null>(null);

  const guardPayment = () => {
    alert("Vui lòng mở mini app từ ứng dụng MB Bank để đăng nhập rồi thử lại.");
  };

  const handlePayment = (pkg: PackageItem) => {
    // chỉ gọi được nếu canPay === true
    const orderId = "ORDER-" + Math.floor(Math.random() * 100000);
    navigateToResult({
      orderId,
      packageName: pkg.name,
      amount: pkg.price,
      currency: "VND",
      paidAt: new Date().toISOString(),
    });
  };

  /** Tải danh sách gói theo tab */
  const callAPIListPackage = useCallback(async () => {
    try {
      // Nếu api_get_package chưa có kiểu, ép về PackageItem[]
      const response = (await api_get_package({
        type: activeTab,
      })) as PackageItem[];
      setDataPackage(Array.isArray(response) ? response : []);

      if (Array.isArray(response) && response.length > 0) {
        const defaultIndex = response.length > 1 ? 1 : 0;
        const defaultId = response[defaultIndex]?._id ?? null;
        setSelectedPackageId(defaultId);

        if (swiperRef.current && defaultIndex > 0) {
          swiperRef.current.slideTo(defaultIndex, 300);
        }
      } else {
        setSelectedPackageId(null);
      }
    } catch (error: any) {
      console.log("Error fetching packages:", error?.message || error);
      setDataPackage([]);
      setSelectedPackageId(null);
    }
  }, [activeTab]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await callAPIListPackage();
      if (!mounted) return;
    })();
    return () => {
      mounted = false;
    };
  }, [callAPIListPackage]);

  return (
    <div className="pricing-container">
      <header className="pricing-header">
        <h1 className="head-title">Gói Dịch Vụ</h1>

        {/* Nhắc nhở nếu chưa thể thanh toán do thiếu loginToken/verified */}
        {!canPay && (
          <div
            style={{
              marginTop: 8,
              padding: "8px 10px",
              borderRadius: 8,
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#9a3412",
              fontSize: 14,
            }}
          >
            Bạn chưa đăng nhập qua MB Bank. Vui lòng mở mini app từ ứng dụng MB
            Bank để tiếp tục thanh toán.
          </div>
        )}

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
        centeredSlides
        onSwiper={(swiper: SwiperType) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper: SwiperType) => {
          const idx = swiper?.realIndex ?? 0;
          const item = dataPackage[idx] ?? dataPackage[0];
          if (item?._id) setSelectedPackageId(item._id);
        }}
      >
        {dataPackage.map((data) => (
          <SwiperSlide key={data._id} className="package-slide">
            <div
              className={`package-card ${
                selectedPackageId === data._id ? "active" : ""
              }`}
              onClick={() => setSelectedPackageId(data._id)}
            >
              {/* Header */}
              <div className="card-header">
                <h1 className="package-name">{data.name}</h1>
                <div className="package-row">
                  <p className="package-price">{data.price}₫</p>
                  <p className="package-unit">{data.duration} Ngày</p>
                </div>
              </div>
              <div className="line-divider"></div>

              {/* Body */}
              <div className="card-body-scrollable">
                <p className="package-description">{data.description}</p>
              </div>

              {/* Footer */}
              <div className="card-payment-button">
                <button
                  disabled={!canPay}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!canPay) return guardPayment();
                    handlePayment(data);
                  }}
                  style={{
                    opacity: canPay ? 1 : 0.6,
                    cursor: canPay ? "pointer" : "not-allowed",
                  }}
                  title={
                    canPay
                      ? "Thanh toán gói dịch vụ"
                      : "Bạn cần đăng nhập qua MB Bank để thanh toán"
                  }
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
