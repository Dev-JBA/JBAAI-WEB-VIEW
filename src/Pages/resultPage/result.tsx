import React, { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";

type ResultData = {
  success: boolean; // suy luận từ các tham số phổ biến
  code?: string | null; // ví dụ "00"
  status?: string | null; // ví dụ "success" | "paid" | "FAILED"
  message?: string | null;

  orderId?: string | null;
  transactionId?: string | null;
  merchantId?: string | null;
  method?: string | null;

  amount?: number | null; // auto parse number nếu có
  currency?: string | null;

  paidAt?: string | null; // ISO string nếu parse được
  rawPaidAt?: string | null; // bản gốc từ query

  // Toàn bộ query + hash để debug
  allParams: Record<string, string>;
  hash: string; // không có dấu '#'
  rawSearch: string; // "?a=1&b=2"
  rawHash: string; // "#HASH"
  collectedAt: string; // timestamp
};

const toNumber = (s?: string | null): number | null => {
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const toIsoDate = (
  s?: string | null
): { iso: string | null; raw: string | null } => {
  if (!s) return { iso: null, raw: null };
  // thử parse epoch ms/s hoặc chuỗi date
  const trimmed = s.trim();
  let d: Date | null = null;

  if (/^\d+$/.test(trimmed)) {
    const num = Number(trimmed);
    // nếu quá nhỏ coi như giây, nhân 1000
    const ms = num < 10_000_000_000 ? num * 1000 : num;
    d = new Date(ms);
  } else {
    const t = Date.parse(trimmed);
    if (!Number.isNaN(t)) d = new Date(t);
  }

  return d
    ? { iso: d.toISOString(), raw: trimmed }
    : { iso: null, raw: trimmed };
};

const deriveSuccess = (params: URLSearchParams): boolean => {
  const code = (
    params.get("code") ||
    params.get("respCode") ||
    ""
  ).toLowerCase();
  const status = (
    params.get("status") ||
    params.get("paymentStatus") ||
    ""
  ).toLowerCase();
  const okFlag = (params.get("success") || "").toLowerCase();

  // Các điều kiện “thành công” thường gặp
  if (code === "00" || code === "0") return true;
  if (
    status === "success" ||
    status === "succeeded" ||
    status === "paid" ||
    status === "completed"
  )
    return true;
  if (okFlag === "true" || okFlag === "1" || okFlag === "yes") return true;

  return false;
};

const ResultPage: React.FC = () => {
  const { search, hash } = useLocation();

  const data: ResultData = useMemo(() => {
    const params = new URLSearchParams(search);
    const allParams: Record<string, string> = {};
    params.forEach((v, k) => (allParams[k] = v));

    const amount = toNumber(
      params.get("amount") || params.get("total") || params.get("price")
    );
    const { iso: paidAt, raw: rawPaidAt } = toIsoDate(
      params.get("paidAt") ||
        params.get("time") ||
        params.get("txnTime") ||
        params.get("timestamp")
    );

    const success = deriveSuccess(params);

    return {
      success,
      code: params.get("code") || params.get("respCode"),
      status: params.get("status") || params.get("paymentStatus"),
      message: params.get("message") || params.get("msg") || params.get("desc"),

      orderId:
        params.get("orderId") || params.get("order_no") || params.get("billId"),
      transactionId:
        params.get("transactionId") ||
        params.get("txnId") ||
        params.get("trans_id"),
      merchantId: params.get("merchantId") || params.get("mid"),
      method: params.get("method") || params.get("channel"),

      amount,
      currency: params.get("currency") || params.get("cur"),

      paidAt,
      rawPaidAt,

      allParams,
      hash: hash && hash.length > 1 ? hash.slice(1) : "",
      rawSearch: search,
      rawHash: hash,
      collectedAt: new Date().toISOString(),
    };
  }, [search, hash]);

  // Log toàn bộ payload JSON 1 lần khi vào trang
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ page: "result", ...data }));
  }, [data]);

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "16px" }}>
      {/* Header trạng thái */}
      <div
        style={{
          padding: "16px",
          borderRadius: 12,
          background: data.success ? "#DCFCE7" : "#FEE2E2",
          border: `1px solid ${data.success ? "#16A34A" : "#DC2626"}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 24 }}>{data.success ? "✅" : "❌"}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            {data.success
              ? "Thanh toán thành công"
              : "Thanh toán thất bại / không xác định"}
          </div>
          {data.message ? (
            <div style={{ opacity: 0.8 }}>{data.message}</div>
          ) : null}
        </div>
      </div>

      {/* Thông tin chi tiết */}
      <div
        style={{
          marginTop: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          backgroundColor: "#ffff",
          padding: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Thông tin giao dịch</h3>
        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "180px 1fr",
            rowGap: 8,
          }}
        >
          <dt>Mã đơn hàng</dt>
          <dd>{data.orderId || "-"}</dd>
          <dt>Mã giao dịch</dt>
          <dd>{data.transactionId || "-"}</dd>
          <dt>Đơn vị chấp nhận</dt>
          <dd>{data.merchantId || "-"}</dd>
          <dt>Phương thức</dt>
          <dd>{data.method || "-"}</dd>
          <dt>Số tiền</dt>
          <dd>
            {data.amount != null ? data.amount.toLocaleString() : "-"}{" "}
            {data.currency || ""}
          </dd>
          <dt>Thời gian thanh toán</dt>
          <dd>{data.paidAt || data.rawPaidAt || "-"}</dd>
          <dt>Trạng thái</dt>
          <dd>{data.status || (data.success ? "success" : "-")}</dd>
          <dt>Mã phản hồi</dt>
          <dd>{data.code || "-"}</dd>
          <dt>Hash (fragment)</dt>
          <dd>{data.hash || "-"}</dd>
        </dl>
      </div>

      {/* Về trang chủ */}
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Link to="/">Về trang chủ</Link>
      </div>

      {/* Gợi ý test */}
      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.75 }}>
        <div>
          <b>Ví dụ test:</b>
        </div>
        <div>
          /result?code=00&status=success&orderId=ORD123&transactionId=TXN999&amount=150000&currency=VND&paidAt=2025-09-19T10:00:00Z#ABCEDF
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
