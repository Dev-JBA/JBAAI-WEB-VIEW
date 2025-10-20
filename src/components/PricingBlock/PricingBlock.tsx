import React, { useEffect, useRef, useState, useMemo } from "react";
import "./PricingBlock.css";

import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import api_get_package from "../../data/api/api_get_package";
import { useLocation, useNavigate } from "react-router-dom";
import { getSession, isVerified } from "../../data/authStorage";

type TabType = "standard" | "premium";

function hasValidSession() {
  const s = getSession();
  return isVerified() && !!s && !!s.sessionId;
}

const PricingBlock = () => {
  const [activeTab, setActiveTab] = useState<TabType>("standard");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    "s180"
  );
  const [dataPackage, setDataPackage] = useState<any>([]);
  const swiperRef = useRef<SwiperType | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // ========= ĐIỀU KIỆN CHO PHÉP THANH TOÁN =========
  // Yêu cầu: có loginToken + hash "#MBAPP" + đã verify session
  const access = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const token = (params.get("loginToken") || "").trim();
    const hasToken = token.length > 0;

    const rawHash = location.hash ? location.hash.slice(1) : ""; // bỏ dấu #
    const isMBAppHash = rawHash.toUpperCase() === "MBAPP";

    const sessionOK = hasValidSession();

    return {
      hasToken,
      isMBAppHash,
      sessionOK,
      canPay: hasToken && isMBAppHash && sessionOK,
    };
  }, [location.search, location.hash]);

  // dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPackageId, setPendingPackageId] = useState<string | null>(null);

  const handlePayment = (packageId: string) => {
    if (!access.canPay) {
      // Trường hợp mở trên web PC (không token/hash) hoặc chưa verify -> chặn + điều hướng login
      navigate("/require-login", {
        state: {
          next: "/account-payment",
          message:
            !access.hasToken || !access.isMBAppHash
              ? "Bạn cần đăng nhập từ ứng dụng MB để tiếp tục thanh toán."
              : "Thiếu token/phiên. Vui lòng đăng nhập để tiếp tục.",
        },
        replace: false,
      });
      return;
    }
    // Đủ điều kiện -> theo luồng hiện tại
    setPendingPackageId(packageId);
    setShowConfirmDialog(true);
  };

  /* Call API List Package */
  const callAPIListPackage = async () => {
    try {
      const response: any = await api_get_package({ type: activeTab });
      setDataPackage(response);
      if (Array.isArray(response) && response.length > 0) {
        setTimeout(() => {
          if (swiperRef.current) swiperRef.current.slideTo(1, 300);
        }, 100);
        setSelectedPackageId(response[1]?._id ?? response[0]?._id ?? null);
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

  const confirmHasAccount = () => {
    setShowConfirmDialog(false);
    navigate("/account-payment", {
      state: { packageId: pendingPackageId, active: "login" },
    });
    setPendingPackageId(null);
  };

  const confirmNoAccount = () => {
    setShowConfirmDialog(false);
    navigate("/account-payment", {
      state: { packageId: pendingPackageId, active: "signup" },
    });
    setPendingPackageId(null);
  };

  const cancelConfirm = () => {
    setShowConfirmDialog(false);
    setPendingPackageId(null);
  };

  return (
    <div id="pricing" className="pricing-container">
      <header className="pricing-header">
        <h1 className="head-title">Gói Dịch Vụ</h1>

        {/* Cảnh báo khi không đủ điều kiện thanh toán */}
        {!access.canPay && (
          <div
            role="alert"
            aria-live="polite"
            className="pricing-warning"
            style={{
              marginTop: 8,
              padding: "8px 12px",
              borderRadius: 10,
              background: "rgba(255,196,0,0.12)",
              color: "#8a6d00",
              fontSize: 14,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {!access.hasToken || !access.isMBAppHash
              ? "Bạn đang truy cập từ trình duyệt. Vui lòng mở qua ứng dụng MB để thanh toán."
              : "Thiếu token/phiên. Vui lòng đăng nhập để tiếp tục."}
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
        centeredSlides={true}
        onSwiper={(swiper: any) => (swiperRef.current = swiper)}
        onSlideChange={(swiper: SwiperType) => {
          const activeSlide = dataPackage?.[swiper.realIndex];
          setSelectedPackageId(
            activeSlide?._id ?? dataPackage?.[0]?._id ?? null
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
              {/* Header */}
              <div className="card-header">
                <h1 className="package-name">{data.name}</h1>
                <div className="package-row">
                  <p className="package-price">{data.price}$/</p>
                  <p className="package-unit">{data.duration} Ngày</p>
                </div>
              </div>
              <div className="line-divider"></div>

              {/* Body scrollable */}
              <div className="card-body-scrollable">
                <p className="package-description">{data.description}</p>
              </div>

              {/* Footer button */}
              <div className="card-payment-button">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePayment(data._id);
                  }}
                  // có thể để enable để vẫn nhấn được -> đưa sang /require-login
                  // nhưng để UX rõ ràng thì disable + tooltip:
                  disabled={!access.canPay}
                  title={
                    access.canPay
                      ? "Tiếp tục thanh toán"
                      : !access.hasToken || !access.isMBAppHash
                      ? "Bạn cần mở từ ứng dụng MB"
                      : "Thiếu token/phiên - cần đăng nhập"
                  }
                  className={!access.canPay ? "btn-disabled" : ""}
                  style={{
                    opacity: access.canPay ? 1 : 0.6,
                    cursor: access.canPay ? "pointer" : "not-allowed",
                  }}
                >
                  {access.canPay ? "Thanh toán" : "Đăng nhập để thanh toán"}
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {showConfirmDialog && (
        <div
          className="confirm-overlay"
          onClick={cancelConfirm}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="confirm-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative" }}
          >
            {/* nút X */}
            <button
              aria-label="Close"
              onClick={cancelConfirm}
              style={{
                position: "absolute",
                top: -10,
                right: -10,
                width: 45,
                height: 45,
                borderRadius: "50%",
                background: "transparent",
                border: "none",
                color: "black",
                fontSize: 20,
                backgroundColor: "white",
                cursor: "pointer",
                padding: 6,
                lineHeight: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              x
            </button>

            <img src="/logo192.png" alt="Logo" className="logo" />
            <h3>Bạn đã có tài khoản JBAAI chưa?</h3>
            <p>
              {" "}
              Xác nhận để chuyển đến trang đăng nhập. Nếu chưa có tài khoản,
              chọn đăng ký.{" "}
            </p>
            <div className="confirm-actions">
              <button
                className="confirm-button primary"
                onClick={confirmHasAccount}
              >
                Đăng nhập
              </button>
              <button className="confirm-button" onClick={confirmNoAccount}>
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingBlock;
