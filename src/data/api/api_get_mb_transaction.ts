import ApiHelper from "./apiHelper";

export interface GetMBTrxResp {
  success: boolean;
  data?: any;
  message?: string;
}

/**
 * Lấy thông tin chi tiết giao dịch MB theo transactionId
 * @param transactionId ID giao dịch MB (ví dụ: AW00R800009L)
 */
export default async function api_get_mb_transaction(transactionId: string) {
  if (!transactionId) {
    throw new Error("Thiếu transactionId để truy vấn giao dịch.");
  }

  const res = await ApiHelper<GetMBTrxResp>(
    `/api/v1/mb/transactions/${encodeURIComponent(transactionId)}`,
    undefined,
    {
      method: "GET",
      contentType: "application/json",
      debug: true,
      logLabel: "get-mb-transaction",
    }
  );

  const raw = res as any;
  let data: any = null;

  if (raw?.data && typeof raw.data === "object") {
    data = raw.data;
  } else if (raw && typeof raw === "object" && "id" in raw) {
    data = raw;
  }

  if (!data) {
    throw new Error(raw?.message || "Không lấy được thông tin giao dịch.");
  }

  return data;
}
