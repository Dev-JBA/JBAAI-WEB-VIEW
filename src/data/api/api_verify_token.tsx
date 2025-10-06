import ApiHelper, { ApiError } from "../apiHelper";

export async function verifyToken(
  loginToken: string,
  signal?: AbortSignal
): Promise<string> {
  const fd = new FormData();
  fd.append("loginToken", loginToken);

  const res = await ApiHelper<any>("/api/v1/mb/verify-token", fd, {
    method: "POST",
    signal,
    debug: true, // giữ để nhìn payload/response trong console
    logLabel: "[verify-token]",
  });

  // BE của bạn đang trả JSON string như Postman: "aa"
  if (typeof res === "string") return res;
  // Nếu BE đổi format (ví dụ { token: "aa" })
  if (res && typeof res.token === "string") return res.token;

  throw new ApiError("Unexpected response format", 500, res);
}
