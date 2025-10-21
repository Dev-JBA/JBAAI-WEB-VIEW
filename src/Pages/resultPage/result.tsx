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

  // if (!data.loginToken) return null;

  useEffect(() => {
    console.log(JSON.stringify({ page: "result", ...data }));
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
