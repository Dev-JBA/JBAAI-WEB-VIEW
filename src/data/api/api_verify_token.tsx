import ApiHelper from "../apiHelper";

/** POST /api/v1/mb/verify-token (form-data: loginToken) */
export async function verifyToken(
  loginToken: string,
  signal?: AbortSignal
): Promise<string> {
  const fd = new FormData();
  fd.append("loginToken", loginToken);

  // debug: true -> console sẽ in Body giống Postman + Response
  return ApiHelper<string>("/api/v1/mb/verify-token", fd, {
    method: "POST",
    signal,
    debug: true,
    logLabel: "[verify-token]",
  });
}
