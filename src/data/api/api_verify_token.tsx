// src/data/api/api_verify_token.tsx
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
    debug: true, // in ra payload & response giống Postman
    logLabel: "[verify-token]",
  });

  // In raw để bạn thấy chính xác BE trả cái gì
  console.log("[verify-token] raw response =", res, "typeof:", typeof res);

  // Chấp nhận các trường hợp BE hay trả:
  // 1) JSON string: "aa"  -> axios parse thành string 'aa'
  // 2) text/plain:      "aa" (kèm dấu ") -> ta bỏ cặp dấu "
  // 3) object:          { token: "aa" }
  if (typeof res === "string") {
    // nếu BE trả text/plain: "aa" -> bỏ dấu "
    const unquoted = res.replace(/^"(.*)"$/, "$1");
    return unquoted;
  }
  if (res && typeof res.token === "string") {
    return res.token;
  }

  throw new ApiError("Unexpected response format", 500, res);
}
