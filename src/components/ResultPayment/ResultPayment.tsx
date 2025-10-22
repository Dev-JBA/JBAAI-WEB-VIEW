import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import images from "../../assets";
import "./ResultPayment.css";

import api_get_mb_transaction from "../../data/api/api_get_mb_transaction";
import { readTxn, clearTxn, msLeft /*, saveTxn*/ } from "../../data/txnStorage";

/* ===== Flags từ URL (chỉ giữ autorefresh) ===== */
function useAutoRefreshFlag() {
  const { search } = useLocation();
  const qs = new URLSearchParams(search);
  return qs.get("autorefresh") === "1";
}

/* ===== Helpers ===== */
const fmtAmount = (n: any) =>
  new Intl.NumberFormat("vi-VN").format(Number(n ?? 0));
const fmtDT = (s?: string) => {
  if (!s) return "-";
  const d = new Date(s);
  return isNaN(+d) ? s : d.toLocaleString("vi-VN");
};
const statusLabel = (s?: string) => (s ? s.toUpperCase() : "-");
const statusClass = (s?: string) => {
  const v = (s || "").toUpperCase();
  if (v === "SUCCESS") return "badge success";
  if (v === "FAILED" || v === "CANCELLED") return "badge danger";
  if (v === "PENDING" || v === "PROCESSING") return "badge warn";
  return "badge";
};

const ResultPayment: React.FC = () => {
  const autoRefresh = useAutoRefreshFlag();

  const [txnId, setTxnId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  /* 1) Load từ localStorage lần đầu */
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
        setDetail(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  /* 2) Xoá transactionId khi rời trang / reload */
  useEffect(() => {
    const handleUnload = () => clearTxn();
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      handleUnload();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  /* 3) Xoá khi TTL hết hạn dù vẫn ở trang */
  useEffect(() => {
    const left = msLeft();
    if (!left) return;
    const to = setTimeout(() => clearTxn(), left + 50);
    return () => clearTimeout(to);
  }, [txnId]);

  /* 4) Polling tự refresh trạng thái (tuỳ chọn qua ?autorefresh=1) */
  useEffect(() => {
    if (!autoRefresh || !txnId) return;

    let alive = true;
    let tries = 0;
    const MAX_TRIES = 24; // 24*5s ~ 2 phút
    let timer: number | undefined;

    const tick = async () => {
      try {
        if (!alive) return;
        tries++;
        const rs = await api_get_mb_transaction(txnId);
        if (!alive) return;
        setDetail(rs);
        const st = (rs?.status || "").toUpperCase();
        if (
          st === "SUCCESS" ||
          st === "FAILED" ||
          st === "CANCELLED" ||
          tries >= MAX_TRIES
        ) {
          return; // dừng polling
        }
        timer = window.setTimeout(tick, 5000);
      } catch {
        if (!alive || tries >= MAX_TRIES) return;
        timer = window.setTimeout(tick, 5000);
      }
    };

    timer = window.setTimeout(tick, 5000);
    return () => {
      alive = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [autoRefresh, txnId]);

  const d = useMemo(() => detail || {}, [detail]);

  /* ====== DEBUG PANEL (ĐÃ KHÓA) ======
  // import { saveTxn } từ txnStorage nếu cần mở lại
  // const [manualId, setManualId] = useState("");
  // const fetchById = async (id: string) => { ... };
  // const saveToLocalAndShow = async () => { ... };
  // JSX:
  // <div className="rp-debug"> ... </div>
  ===================================== */

  /* ===== UI ===== */
  return (
    <div className="rp-page">
      {/* Header success card */}
      <div className="rp-hero">
        <img
          src={images.icon.payment_success}
          alt="Success"
          className="rp-hero-icon"
        />
        <h1 className="rp-hero-title">Thanh toán thành công</h1>
        <p className="rp-hero-sub">
          Giao dịch thành công. Cảm ơn quý khách đã lựa chọn sản phẩm.
        </p>
      </div>

      {/* Detail card */}
      <div className="rp-card">
        {loading ? (
          <div className="rp-loading">Đang tải chi tiết đơn hàng…</div>
        ) : err ? (
          <div className="rp-error">Lỗi: {err}</div>
        ) : (
          <div className="rp-grid">
            <div className="rp-row">
              <div className="rp-k">Mã giao dịch</div>
              <div className="rp-v mono">{d?.id || txnId || "-"}</div>
            </div>

            <div className="rp-row">
              <div className="rp-k">Đối tác</div>
              <div className="rp-v">
                {d?.merchant?.name || "-"}
                {d?.merchant?.code ? ` (${d.merchant.code})` : ""}
              </div>
            </div>

            <div className="rp-row">
              <div className="rp-k">Mô tả</div>
              <div className="rp-v">{d?.description || "-"}</div>
            </div>

            <div className="rp-row">
              <div className="rp-k">Số tiền</div>
              <div className="rp-v">
                {d?.amount != null ? `${fmtAmount(d.amount)} VND` : "-"}
              </div>
            </div>

            <div className="rp-row">
              <div className="rp-k">Loại giao dịch</div>
              <div className="rp-v">
                {d?.type?.name || "-"}
                {d?.type?.code ? ` (${d.type.code})` : ""}
              </div>
            </div>

            <div className="rp-row">
              <div className="rp-k">Ngày tạo</div>
              <div className="rp-v">{fmtDT(d?.createdTime)}</div>
            </div>

            <div className="rp-row">
              <div className="rp-k">Trạng thái</div>
              <div className="rp-v">
                <span className={statusClass(d?.status)}>
                  {statusLabel(d?.status)}
                </span>
              </div>
            </div>

            {d?.successMessage && (
              <div className="rp-row">
                <div className="rp-k">Thông báo</div>
                <div className="rp-v">{d.successMessage}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="rp-actions">
        <Link to="/instruction" className="btn btn-primary">
          Hướng dẫn cài đặt ứng dụng
        </Link>
        <Link to="/" className="btn btn-ghost">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default ResultPayment;
