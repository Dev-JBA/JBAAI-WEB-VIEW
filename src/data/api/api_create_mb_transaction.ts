import ApiHelper from "./apiHelper";
import type { InitRequest } from "../../components/MBOpenPayment/buildInitRequest";

export type CreateMBTrxResp = {
  success: boolean;
  data?: any;
  message?: string;
};

export default function api_create_mb_transaction(p: InitRequest) {
  const form = new URLSearchParams();
  form.set("sessionId", p.sessionId);
  form.set("cif", String(p.cif)); // <-- BẮT BUỘC
  form.set("packageId", p.packageId);
  form.set("description", p.description);
  if (p.email) form.set("email", p.email);
  if (p.phone) form.set("phone", p.phone);

  return ApiHelper<CreateMBTrxResp>(
    "/api/v1/mb/transactions", // nếu baseURL đã có /api thì đổi thành "/v1/mb/transactions"
    form,
    {
      method: "POST",
      contentType: "application/x-www-form-urlencoded; charset=utf-8",
      debug: true,
      logLabel: "create-mb-transaction",
      // baseURL: "https://<BE-domain>", // dùng nếu chưa set VITE_API_BASE_URL
    }
  );
}
