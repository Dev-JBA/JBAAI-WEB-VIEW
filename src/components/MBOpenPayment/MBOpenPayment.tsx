import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildInitRequest } from "./buildInitRequest";
import api_create_mb_transaction from "../../data/api/api_create_mb_transaction";
import { openMBPaymentScreen, MBPaymentData } from "./mbPayment";
import "./MBOpenPayment.css";

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

  // Lấy input từ màn trước (để người dùng soát lại)
  const { pkgId, initDesc, phone, email } = useMemo(() => {
    const st = (location?.state ?? {}) as any;
    const qs = new URLSearchParams(location?.search ?? "");
    const id = (st.packageId ?? qs.get("packageId") ?? "") as string;
    const desc = (
      id ? `Thanh toán gói dịch vụ ${id}` : "Thanh toán gói dịch vụ"
    ).slice(0, 200);
    return {
      pkgId: id,
      initDesc: desc,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // -------- UI --------
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

        {/* TỔNG QUAN NGƯỜI DÙNG CẦN THẤY */}
        {beRes && (
          <section className="mbp-section">
            {(beRes?.packageInfo?.name || beRes?.packageInfo?.id) && (
              <div className="mbp-kv full">
                <span className="k">Gói</span>
                <span className="v">
                  {beRes?.packageInfo?.name || "-"}
                  {beRes?.packageInfo?.price != null
                    ? ` · ${beRes.packageInfo.price}`
                    : ""}
                </span>
              </div>
            )}

            <div className="mbp-grid">
              <div className="mbp-kv full">
                <span className="k">Đơn vị thu</span>
                <span className="v">{beRes?.merchant?.name || "-"}</span>
              </div>
              <div className="mbp-kv full">
                <span className="k">Nội dung</span>
                <span className="v">{beRes.description || "-"}</span>
              </div>
              <div className="mbp-kv">
                <span className="k">Loại giao dịch</span>
                <span className="v">{beRes?.type?.name || "-"}</span>
              </div>
              <div className="mbp-kv">
                <span className="k">Thời điểm tạo</span>
                <span className="v">{fmtDT(beRes.createdTime)}</span>
              </div>
              <div className="mbp-kv">
                <span className="k">Transaction ID</span>
                <span className="v mbp-mono">{beRes.transactionId || "-"}</span>
              </div>
              <div className="amount-card">
                <div className="amount-label">Số tiền</div>
                <div className="amount-value">
                  {fmtAmount(beRes.amount)} VND
                </div>
              </div>
              {/* Hiển thị tên gói nếu có; nếu BE chỉ có id thì vẫn show để KH tham chiếu */}
            </div>
          </section>
        )}

        {/* THÔNG TIN TỪ BƯỚC TRƯỚC (để người dùng soát) */}
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

        {/* TRẠNG THÁI + CTA */}
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

        {/* ACTION BAR */}
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

        {/* KHỐI ẨN DÀNH CHO DEV (khi cần debug) */}
        {beRes && (
          <details
            className="mbp-tech"
            open={showTech}
            onToggle={(e) => setShowTech((e.target as HTMLDetailsElement).open)}
          >
            <summary>Chi tiết kỹ thuật (dành cho dev)</summary>
            <div className="mbp-grid">
              <div className="mbp-kv">
                <span className="k">CIF</span>
                <span className="v mbp-mono">{beRes.cif || "-"}</span>
              </div>
              <div className="mbp-kv">
                <span className="k">Merchant code</span>
                <span className="v mbp-mono">
                  {beRes?.merchant?.code || "-"}
                </span>
              </div>
              <div className="mbp-kv">
                <span className="k">Type code</span>
                <span className="v mbp-mono">{beRes?.type?.code || "-"}</span>
              </div>
              <div className="mbp-kv">
                <span className="k">Package ID</span>
                <span className="v mbp-mono">
                  {beRes?.packageInfo?.id || "-"}
                </span>
              </div>
              <div className="mbp-kv">
                <span className="k">User ID</span>
                <span className="v mbp-mono">{beRes?.userId || "-"}</span>
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
