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
  const once = useRef(false);

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

  return (
    <div className="mbp-shell">
      <div className="mbp-card">
        <header className="mbp-header">
          <div>
            <h1>Xác nhận thông tin thanh toán</h1>
            <p className="mbp-subtitle">
              Vui lòng kiểm tra thông tin trước khi chuyển sang thanh toán
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

        {/* Input từ màn trước */}
        <section className="mbp-section">
          <h3>Thông tin người dùng</h3>
          <div className="mbp-grid">
            <div className="mbp-kv">
              <span className="k">Gói</span>
              <span className="v mbp-mono">{pkgId || "-"}</span>
            </div>
            <div className="mbp-kv full">
              <span className="k">Mô tả </span>
              <span className="v">{initDesc}</span>
            </div>
            {(phone || email) && (
              <div className="mbp-kv full">
                <span className="k">SĐT/Email</span>
                <span className="v">
                  {phone || "-"} / {email || "-"}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Trạng thái + CTA */}
        <section className="mbp-section">
          <h3>Trạng thái</h3>
          {status === "calling" && (
            <p className="mbp-muted">Đang khởi tạo giao dịch với máy chủ…</p>
          )}
          {status === "ready" && (
            <p className="mbp-ok">
              Đã khởi tạo giao dịch. Nhấn <strong>“xác nhận”</strong> để tiếp
              tục.
            </p>
          )}
          {status === "sending" && (
            <p className="mbp-info">Đang gửi thông tin sang MB App…</p>
          )}
          {status === "error" && <p className="mbp-error">Lỗi: {err}</p>}
        </section>

        {/* Tóm tắt giao dịch từ BE */}
        {beRes && (
          <section className="mbp-section">
            <h3>Thông tin giao dịch</h3>
            <div className="mbp-grid">
              <div className="mbp-kv">
                <span className="k">Transaction ID</span>
                <span className="v mbp-mono">{beRes.transactionId || "-"}</span>
              </div>
              <div className="mbp-kv">
                <span className="k">Trạng thái</span>
                <span className="v">{beRes.status || "-"}</span>
              </div>
              <div className="mbp-kv">
                <span className="k">Số tiền</span>
                <span className="v">{fmtAmount(beRes.amount)} VND</span>
              </div>
              <div className="mbp-kv">
                <span className="k">CIF</span>
                <span className="v mbp-mono">{beRes.cif || "-"}</span>
              </div>
              <div className="mbp-kv full">
                <span className="k">Mô tả</span>
                <span className="v">{beRes.description || "-"}</span>
              </div>
              <div className="mbp-kv">
                <span className="k">Tạo lúc</span>
                <span className="v">{fmtDT(beRes.createdTime)}</span>
              </div>
              <div className="mbp-kv">
                <span className="k">Merchant</span>
                <span className="v">
                  {beRes?.merchant?.code || "-"} —{" "}
                  {beRes?.merchant?.name || "-"}
                </span>
              </div>
              <div className="mbp-kv full">
                <span className="k">Loại giao dịch</span>
                <span className="v">
                  {beRes?.type?.code || "-"} — {beRes?.type?.name || "-"}
                  {" · "}allowCard: {String(!!beRes?.type?.allowCard)}
                </span>
              </div>
              <div className="mbp-kv full">
                <span className="k">Gói</span>
                <span className="v">
                  <span className="mbp-mono">
                    {beRes?.packageInfo?.id || "-"}
                  </span>
                  {" — "}
                  {beRes?.packageInfo?.name || "-"}
                  {beRes?.packageInfo?.price != null
                    ? ` (${beRes.packageInfo.price})`
                    : ""}
                </span>
              </div>
              <div className="mbp-kv">
                <span className="k">User ID</span>
                <span className="v mbp-mono">{beRes.userId || "-"}</span>
              </div>
            </div>
          </section>
        )}

        {/* Action bar */}
        <footer className="mbp-actions">
          <button
            className="btn btn-primary"
            onClick={onProceed}
            disabled={!payload || status !== "ready"}
          >
            Thanh toán
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
              Thử lại khởi tạo
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
