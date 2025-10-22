import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildInitRequest } from "./buildInitRequest";
import api_create_mb_transaction from "../../data/api/api_create_mb_transaction";
import { openMBPaymentScreen, MBPaymentData } from "./mbPayment";
import "./MBOpenPayment.css";
import { saveTxn } from "../../data/txnStorage"; // 👈 thêm import

type ViewState = "calling" | "ready" | "sending" | "error";

function normalizeBeData(rs: any) {
  if (!rs) return null;
  if (typeof rs === "object" && rs !== null) {
    if ("data" in rs && rs.data && typeof rs.data === "object") return rs.data;
    return rs;
  }
  return null;
}

const fmtAmount = (n: any) =>
  new Intl.NumberFormat("vi-VN").format(Number(n ?? 0));
const fmtDT = (s?: string) => {
  if (!s) return "-";
  const d = new Date(s);
  return isNaN(+d) ? s : d.toLocaleString("vi-VN");
};

export default function MBOpenPayment() {
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [status, setStatus] = useState<ViewState>("calling");
  const [err, setErr] = useState("");
  const [beRes, setBeRes] = useState<any>(null);
  const [payload, setPayload] = useState<MBPaymentData | null>(null);
  const [showTech, setShowTech] = useState(false);

  const once = useRef(false);

  const { pkgId, phone, email } = useMemo(() => {
    const st = (location?.state ?? {}) as any;
    const qs = new URLSearchParams(location?.search ?? "");
    const id = (st.packageId ?? qs.get("packageId") ?? "") as string;
    const desc = id ? `Thanh toán gói dịch vụ ${id}` : "Thanh toán gói dịch vụ";
    return {
      pkgId: id,
      phone: st.phone ?? qs.get("phone") ?? "",
      email: st.email ?? qs.get("email") ?? "",
    };
  }, [location]);

  useEffect(() => {
    const run = async () => {
      try {
        const req = buildInitRequest({
          state: location.state,
          search: location.search,
        });
        setStatus("calling");
        const rs = await api_create_mb_transaction(req);
        const d = normalizeBeData(rs);

        if (!d || typeof d !== "object") {
          setErr((rs as any)?.message || "Khởi tạo giao dịch thất bại.");
          setStatus("error");
          return;
        }

        setBeRes(d);

        // ✅ LƯU transactionId để dùng ở ResultPayment
        if (d?.transactionId) {
          saveTxn(String(d.transactionId));
        }

        const pld: MBPaymentData = {
          merchant: {
            code: d?.merchant?.code || "UNKNOWN",
            name: d?.merchant?.name || "UNKNOWN",
          },
          type: {
            code: d?.type?.code || "UNKNOWN",
            name: d?.type?.name || "UNKNOWN",
            allowCard: !!d?.type?.allowCard,
          },
          id: String(d?.transactionId || ""),
          amount: Math.max(0, Math.round(Number(d?.amount || 0))),
          description: String(d?.description || "").slice(0, 200),
          successMessage: d?.successMessage || undefined,
        };

        setPayload(pld);
        setStatus("ready");
      } catch (e: any) {
        setErr(e?.message || "Lỗi không xác định.");
        setStatus("error");
      }
    };

    if (once.current) return;
    once.current = true;
    run();
  }, [location]);

  const onProceed = () => {
    if (!payload) return;
    setStatus("sending");
    openMBPaymentScreen(payload);
  };

  const resendInit = () => {
    setErr("");
    setStatus("calling");
    once.current = false;
    window.location.reload();
  };

  // ===== UI =====
  return (
    <div className="mbp-shell">
      <div className="mbp-card">
        <header className="mbp-header">
          <div>
            <h1>Thông tin chi tiết đơn hàng</h1>
            <p className="mbp-subtitle">
              Kiểm tra thông tin của bạn trước khi xác nhận thanh toán
            </p>
          </div>
          <span
            className={
              "mbp-badge " +
              (status === "calling"
                ? "is-warn"
                : status === "ready"
                ? "is-ok"
                : status === "sending"
                ? "is-info"
                : "is-error")
            }
          >
            {status === "calling" && "Đang khởi tạo"}
            {status === "ready" && "Sẵn sàng thanh toán"}
            {status === "sending" && "Đang gửi sang MB"}
            {status === "error" && "Lỗi"}
          </span>
        </header>

        {/* Thông tin đơn hàng */}
        {beRes && (
          <section className="mbp-section">
            <div className="mbp-kv full">
              <span className="k">Đơn vị thu</span>
              <span className="v">{beRes?.merchant?.name || "-"}</span>
            </div>
            <div className="mbp-kv full">
              <span className="k">Nội dung</span>
              <span className="v">{beRes?.description || "-"}</span>
            </div>
            <div className="mbp-kv">
              <span className="k">Transaction ID</span>
              <span className="v mbp-mono">{beRes?.transactionId || "-"}</span>
            </div>
            <div className="mbp-kv">
              <span className="k">Số tiền</span>
              <span className="v">{fmtAmount(beRes?.amount)} VND</span>
            </div>
          </section>
        )}

        {/* Thông tin khách hàng */}
        <section className="mbp-section">
          <h3>Thông tin của bạn</h3>
          <div className="mbp-grid">
            <div className="mbp-kv">
              <span className="k">Số điện thoại</span>
              <span className="v">{phone || "-"}</span>
            </div>
            <div className="mbp-kv">
              <span className="k">Email</span>
              <span className="v">{email || "-"}</span>
            </div>
          </div>
        </section>

        {/* Trạng thái thanh toán */}
        <section className="mbp-section">
          <h3>Thanh toán</h3>
          {status === "calling" && (
            <p className="mbp-muted">Đang khởi tạo giao dịch…</p>
          )}
          {status === "ready" && (
            <p className="mbp-ok">
              Thông tin đã sẵn sàng. Nhấn <strong>“Xác nhận thanh toán”</strong>{" "}
              để tiếp tục.
            </p>
          )}
          {status === "sending" && (
            <p className="mbp-info">Đang gửi thông tin sang MB App…</p>
          )}
          {status === "error" && <p className="mbp-error">Lỗi: {err}</p>}
        </section>

        {/* Nút hành động */}
        <footer className="mbp-actions">
          <button
            className="btn btn-primary"
            onClick={onProceed}
            disabled={!payload || status !== "ready"}
          >
            Xác nhận thanh toán
          </button>
          <div className="spacer" />
          <button
            className="btn"
            onClick={() => navigate("/", { replace: true })}
          >
            Về trang chủ
          </button>
          {status === "error" && (
            <button className="btn" onClick={resendInit}>
              Thử lại
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
