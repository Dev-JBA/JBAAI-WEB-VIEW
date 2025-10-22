import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import images from "../../assets";
import "./ResultPayment.css";

import api_get_mb_transaction from "../../data/api/api_get_mb_transaction";
import { readTxn, clearTxn, msLeft } from "../../data/txnStorage";

const ResultPayment: React.FC = () => {
  const [txnId, setTxnId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 1️⃣ Lấy transactionId từ localStorage (đã lưu ở MBOpenPayment)
  useEffect(() => {
    const t = readTxn();
    if (!t?.id) {
      setLoading(false);
      setErr("Không tìm thấy hoặc giao dịch đã hết hạn.");
      return;
    }
    setTxnId(t.id);

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api_get_mb_transaction(t.id);
        if (!alive) return;
        setDetail(data);
        setErr("");
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Không lấy được thông tin giao dịch.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // 2️⃣ Xoá transactionId khi rời trang (đi sang trang khác hoặc đóng tab)
  useEffect(() => {
    const handleUnload = () => clearTxn();
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      handleUnload();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  // 3️⃣ Tự động xoá sau khi TTL hết (dù user vẫn để tab mở)
  useEffect(() => {
    const left = msLeft();
    if (!left) return;
    const timeout = setTimeout(() => clearTxn(), left + 50);
    return () => clearTimeout(timeout);
  }, [txnId]);

  // ===== Format helpers =====
  const fmtAmount = (n: any) =>
    new Intl.NumberFormat("vi-VN").format(Number(n ?? 0));
  const fmtDT = (s?: string) => {
    if (!s) return "-";
    const d = new Date(s);
    return isNaN(+d) ? s : d.toLocaleString("vi-VN");
  };

  const d = useMemo(() => detail || {}, [detail]);

  // ===== UI =====
  return (
    <div>
      <div className="container">
        <div className="resultContainer">
          <img src={images.icon.payment_success} alt="Logo" className="logo" />
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            Thanh toán thành công
          </div>
          <p style={{ opacity: 0.8 }}>
            Giao dịch thành công. Cảm ơn quí khách đã lựa chọn sản phẩm
          </p>
        </div>

        {/* HIỂN THỊ CHI TIẾT GIAO DỊCH */}
        <div className="detailContainer" style={{ marginTop: 12 }}>
          {loading ? (
            <p>Đang tải chi tiết đơn hàng…</p>
          ) : err ? (
            <p style={{ color: "crimson" }}>Lỗi: {err}</p>
          ) : (
            <>
              <div className="row">
                <h3>Mã giao dịch</h3>
                <p className="mono">{d?.id || txnId || "-"}</p>
              </div>
              <hr />
              <div className="row">
                <h3>Đối tác</h3>
                <p>
                  {d?.merchant?.name || "-"} ({d?.merchant?.code || "-"})
                </p>
              </div>
              <hr />
              <div className="row">
                <h3>Mô tả</h3>
                <p>{d?.description || "-"}</p>
              </div>
              <hr />
              <div className="row">
                <h3>Số tiền</h3>
                <p>{d?.amount != null ? `${fmtAmount(d.amount)} VND` : "-"}</p>
              </div>
              <hr />
              <div className="row">
                <h3>Loại giao dịch</h3>
                <p>
                  {d?.type?.name || "-"} ({d?.type?.code || "-"})
                </p>
              </div>
              <hr />
              <div className="row">
                <h3>Ngày tạo</h3>
                <p>{fmtDT(d?.createdTime)}</p>
              </div>
              <hr />
              <div className="row">
                <h3>Trạng thái</h3>
                <p>{d?.status || "-"}</p>
              </div>
            </>
          )}
        </div>

        {/* Nút điều hướng */}
        <button className="button-bottom">
          <Link
            to="/instruction"
            style={{ color: "white", textDecoration: "none" }}
          >
            Hướng dẫn cài đặt ứng dụng
          </Link>
        </button>
      </div>
    </div>
  );
};

export default ResultPayment;
