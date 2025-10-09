import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import "./result.css";
import api_get_mb_transaction from "../../data/api/api_get_mb_transaction";
import images from "../../assets";

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
  const [beStatus, setBeStatus] = useState<"unknown" | "success" | "failed" | "pending">("unknown");
  const [beMessage, setBeMessage] = useState<string>("");

  const [dataTransaction, setDataTransaction] = useState<any>(null);

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


  useEffect(() => {
    console.log(JSON.stringify({ page: "result", ...data }));

    // Nếu có transactionId thì gọi BE kiểm tra trạng thái
    if (data.transactionId) {
      api_get_mb_transaction(data.transactionId)
        .then((resp) => {
          console.log("api_get_mb_transaction resp:", resp);
          setDataTransaction(resp);
          if (resp?.success && resp?.data) {
            // Xác định trạng thái từ BE
            const status = String(resp.data.status || "").toLowerCase();
            if (status === "success" || status === "paid" || status === "completed") {
              setBeStatus("success");
              setBeMessage(resp.data.message || "Giao dịch thành công");
            } else if (status === "failed" || status === "error" || status === "cancelled") {
              setBeStatus("failed");
              setBeMessage(resp.data.message || "Giao dịch thất bại");
            } else if (status === "pending") {
              setBeStatus("pending");
              setBeMessage(resp.data.message || "Giao dịch đang chờ xử lý");
            } else {
              setBeStatus("unknown");
              setBeMessage(resp.data.message || "Không xác định trạng thái giao dịch");
            }
          } else {
            setBeStatus("unknown");
            setBeMessage(resp?.message || "Không lấy được trạng thái giao dịch");
          }
        })
        .catch((err) => {
          setBeStatus("unknown");
          setBeMessage("Lỗi khi kiểm tra trạng thái giao dịch");
        });
    }
  }, [data]);

  const handleButton = () => {
    console.log("dataTransaction of butotn:", dataTransaction);
  }

  // Ưu tiên trạng thái BE nếu có
  const finalSuccess = beStatus === "success" ? true : beStatus === "failed" ? false : data.success;
  const finalMessage = beMessage || data.message;

  return (
    <div className="container">
      <div className="resultContainer">
        <img src={finalSuccess ? images.icon.payment_success : images.icon.payment_failed} alt="Logo" className="logo" />
        <div style={{ fontWeight: 700, fontSize: 18 }}>
          {finalSuccess
            ? "Thanh toán thành công"
            : "Thanh toán thất bại"}
        </div>
        {finalMessage ? (
          <p style={{ opacity: 0.8 }}>{finalMessage}</p>
        ) : <p>{dataTransaction?.type.name || "-"} thành công. Cảm ơn quí khách đã lựa chọn sản phẩm</p>}
        
      </div>
      <div className="detailContainer">
        <div className="row">
          <h3>Thông tin giao dịch</h3>
          <p>{dataTransaction?.id || "-"}</p>
        </div>
        <hr />
        <div className="row">
          <h3>Ngày tạo giao dịch</h3>
          <p>{dataTransaction?.createdTime || "-"}</p>
        </div>
        <hr />
        <div className="row">
          <h3>Đối tác</h3>
          <p>{dataTransaction?.merchant.code || "-"}</p>
        </div>
        <hr style={{ margin: "8px 0" }} />
        <div className="row">
          <h3>Thông tin giao dịch</h3>
          <p>{dataTransaction?.merchant.name || "-"}</p>
        </div>
        <hr />
        <div className="row">
          <h3>Tổng tiền</h3>
          <p>{dataTransaction?.amount.toLocaleString() || "-"}</p>
        </div>
        <hr />
        <div className="row">
          <h3>Trạng thái</h3>
          <p>{dataTransaction?.status || "-"}</p>
        </div>
      </div>
      <button className="button-bottom" onClick={() => {}}><Link to="/" style={{ color: "black", textDecoration: "none" }}>Về trang chủ</Link></button>
    </div>
  );
};

export default ResultPage;
