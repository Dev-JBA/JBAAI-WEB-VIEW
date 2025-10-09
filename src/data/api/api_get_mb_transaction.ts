import ApiHelper from "./apiHelper";

export type GetMBTrxResp = {
  success: boolean;
  data?: any;
  message?: string;
};

export default function api_get_mb_transaction(transactionId: string) {
  return ApiHelper<GetMBTrxResp>(
    `/api/v1/mb/transactions/${transactionId}`,
    undefined,
    {
      method: "GET",
      contentType: "application/json",
      debug: true,
      logLabel: "get-mb-transaction",
    }
  );
}