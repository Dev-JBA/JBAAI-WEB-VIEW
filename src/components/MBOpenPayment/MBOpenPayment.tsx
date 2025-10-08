// src/components/MBOpenPayment/MBOpenPayment.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildInitRequest } from "./buildInitRequest";
import api_create_mb_transaction from "../../data/api/api_create_mb_transaction";
import { openMBPaymentScreen, MBPaymentData } from "./mbPayment";

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

  // status:
  //  - "calling": đang khởi tạo với BE
  //  - "ready": đã có dữ liệu từ BE, chờ người dùng bấm để mở MB App
  //  - "sending": đang gửi payload sang MB App
  //  - "error": lỗi khởi tạo
  const [status, setStatus] = useState<
    "calling" | "ready" | "sending" | "error"
  >("calling");
  const [err, setErr] = useState("");

  const [beRes, setBeRes] = useState<any>(null); // JSON trả về từ BE
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
        // B1: gom dữ liệu đầu vào để KHỞI TẠO giao dịch với BE
        const req = buildInitRequest({
          state: location.state,
          search: location.search,
        });

        // B2: gọi BE
        setStatus("calling");
        const rs = await api_create_mb_transaction(req);

        // B3: nhận dữ liệu trả về
        const d = normalizeBeData(rs);
        if (!d || typeof d !== "object") {
          setErr((rs as any)?.message || "Khởi tạo giao dịch thất bại.");
          setStatus("error");
          return;
        }
        setBeRes(d);

        // B4: chuẩn bị payload GỬI SANG MB từ CHÍNH dữ liệu BE
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

        // KHÔNG gửi ngay — chờ người dùng bấm nút
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
    openMBPaymentScreen(payload); // chỉ gửi khi người dùng bấm
    // không đổi UI sau đó; MB App sẽ takeover (hoặc ở DEV thì chỉ log)
  };

  const resendInit = () => {
    setErr("");
    setStatus("calling");
    once.current = false;
    window.location.reload();
  };

  // ---- UI trắng, tối giản ----
  const Card = ({ children }: { children: React.ReactNode }) => (
    <div
      style={{
        maxWidth: 900,
        margin: "28px auto",
        padding: "16px",
        background: "#fff",
        border: "1px solid #e6e9ef",
        borderRadius: 12,
        boxShadow: "0 6px 18px rgba(0,0,0,.06)",
        color: "#0f172a",
      }}
    >
      {children}
    </div>
  );
  const Row = ({
    label,
    value,
  }: {
    label: React.ReactNode;
    value: React.ReactNode;
  }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        gap: 12,
        marginBottom: 8,
      }}
    >
      <div style={{ fontWeight: 700 }}>{label}</div>
      <div>{value}</div>
    </div>
  );

  return (
    <Card>
      <h3 style={{ marginTop: 0 }}>Khởi tạo thanh toán</h3>

      {/* Thông tin đầu vào từ trang trước */}
      <div style={{ marginBottom: 16 }}>
        <Row label="Gói" value={pkgId || "-"} />
        <Row label="Mô tả gửi BE" value={initDesc} />
        {(phone || email) && (
          <Row label="User" value={`${phone || "-"} / ${email || "-"}`} />
        )}
      </div>

      {/* Trạng thái khởi tạo */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Trạng thái</div>
        {status === "calling" && <div>Đang khởi tạo giao dịch với BE…</div>}
        {status === "ready" && (
          <div>
            Đã khởi tạo giao dịch. Vui lòng kiểm tra thông tin bên dưới, sau đó
            bấm “Thanh toán trên MB App”.
          </div>
        )}
        {status === "sending" && <div>Đang gửi thông tin sang MB App…</div>}
        {status === "error" && (
          <div style={{ color: "#b00020" }}>Lỗi: {err}</div>
        )}
      </div>

      {/* Thông tin giao dịch BE trả (hiện trước khi mở MB) */}
      {beRes && (
        <>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Thông tin giao dịch
          </div>
          <div>
            <Row label="Transaction ID" value={beRes.transactionId || "-"} />
            <Row label="Trạng thái" value={beRes.status || "-"} />
            <Row label="Số tiền" value={`${fmtAmount(beRes.amount)} (VND)`} />
            <Row label="CIF" value={beRes.cif || "-"} />
            <Row label="Mô tả" value={beRes.description || "-"} />
            <Row label="Thời điểm tạo" value={fmtDT(beRes.createdTime)} />
            <Row
              label="Merchant"
              value={`${beRes?.merchant?.code || "-"} — ${
                beRes?.merchant?.name || "-"
              }`}
            />
            <Row
              label="Loại giao dịch"
              value={`${beRes?.type?.code || "-"} — ${
                beRes?.type?.name || "-"
              } · allowCard: ${String(!!beRes?.type?.allowCard)}`}
            />
            <Row
              label="Gói"
              value={`${beRes?.packageInfo?.id || "-"} — ${
                beRes?.packageInfo?.name || "-"
              }${
                beRes?.packageInfo?.price != null
                  ? ` (${beRes.packageInfo.price})`
                  : ""
              }`}
            />
            <Row label="User ID" value={beRes.userId || "-"} />
          </div>
        </>
      )}

      {/* Nút hành động */}
      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button
          onClick={onProceed}
          disabled={!payload || status !== "ready"}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #16a34a",
            background: status === "ready" ? "#22c55e" : "#a7f3d0",
            color: "#064e3b",
            cursor: status === "ready" ? "pointer" : "not-allowed",
            fontWeight: 700,
          }}
        >
          Thanh toán trên MB App
        </button>

        <button
          onClick={() => navigate("/", { replace: true })}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #d8dbe2",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Về trang chủ
        </button>

        {status === "error" && (
          <button
            onClick={resendInit}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #d8dbe2",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Thử lại khởi tạo
          </button>
        )}
      </div>
    </Card>
  );
}
