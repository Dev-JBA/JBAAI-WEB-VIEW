import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import api_get_mb_transaction from "../../data/api/api_get_mb_transaction";
import images from "../../assets";
import ResultPayment from "../../components/ResultPayment/ResultPayment";

type ResultData = {
  loginToken: string,
};

const ResultPage: React.FC = () => {
  const { search, hash } = useLocation();
  const [beStatus, setBeStatus] = useState<"unknown" | "success" | "failed" | "pending">("unknown");
  const [beMessage, setBeMessage] = useState<string>("");
  const [dataTransaction, setDataTransaction] = useState<any>(null);

  const data: ResultData = useMemo(() => {
    const params = new URLSearchParams(search);
    const loginToken = params.get("loginToken") || "";

    return {
      loginToken
    };
  }, [search, hash]);

  if (!data.loginToken) return null;


  useEffect(() => {
    console.log(JSON.stringify({ page: "result", ...data }));

    // Nếu có transactionId thì gọi BE kiểm tra trạng thái
    // if (data.transactionId) {
    //   api_get_mb_transaction(data.transactionId)
    //     .then((resp) => {
    //       console.log("api_get_mb_transaction resp:", resp);
    //       setDataTransaction(resp);
    //       if (resp?.success && resp?.data) {
    //         // Xác định trạng thái từ BE
    //         const status = String(resp.data.status || "").toLowerCase();
    //         if (status === "success" || status === "paid" || status === "completed") {
    //           setBeStatus("success");
    //           setBeMessage(resp.data.message || "Giao dịch thành công");
    //         } else if (status === "failed" || status === "error" || status === "cancelled") {
    //           setBeStatus("failed");
    //           setBeMessage(resp.data.message || "Giao dịch thất bại");
    //         } else if (status === "pending") {
    //           setBeStatus("pending");
    //           setBeMessage(resp.data.message || "Giao dịch đang chờ xử lý");
    //         } else {
    //           setBeStatus("unknown");
    //           setBeMessage(resp.data.message || "Không xác định trạng thái giao dịch");
    //         }
    //       } else {
    //         setBeStatus("unknown");
    //         setBeMessage(resp?.message || "Không lấy được trạng thái giao dịch");
    //       }
    //     })
    //     .catch((err) => {
    //       setBeStatus("unknown");
    //       setBeMessage("Lỗi khi kiểm tra trạng thái giao dịch");
    //     });
    // }
  }, [data]);


  // Ưu tiên trạng thái BE nếu có
  // const finalSuccess = beStatus === "success" ? true : beStatus === "failed" ? false : data.success;
  // const finalMessage = beMessage || data.message;
  const finalMessage = 'success';

  return (
    <ResultPayment dataTransaction={dataTransaction} finalMessage={finalMessage} />
  );
};

export default ResultPage;
