// api_verify_token.tsx
import axios from "axios";

export type SessionInfo = {
  sessionId: string;
  cif: string;
  fullname: string;
  fullnameVn?: string | null;
  idCardType?: string | null;
  // mở rộng thêm field BE có thể trả
  [k: string]: any;
};

function buildEndpoint(path: string) {
  const raw =
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "";
  const base = raw.replace(/\/+$/, "");
  return base ? `${base}${path}` : path;
}

// thủ thuật nhỏ: thử parse nếu BE trả string JSON
function tryParseJSON<T = any>(x: unknown): T | null {
  if (typeof x !== "string") return null;
  try {
    return JSON.parse(x) as T;
  } catch {
    return null;
  }
}

// Chuẩn hoá mọi biến thể payload có thể gặp
function normalizeSession(raw: any): SessionInfo | null {
  if (!raw) return null;

  // Nếu response là string JSON -> parse rồi đi tiếp
  const maybeObj = tryParseJSON(raw);
  if (maybeObj) raw = maybeObj;

  // Case 1: BE trả thẳng
  if (raw.sessionId && raw.cif && raw.fullname) {
    return {
      sessionId: String(raw.sessionId),
      cif: String(raw.cif),
      fullname: String(raw.fullname),
      fullnameVn: raw.fullnameVn ?? null,
      idCardType: raw.idCardType ?? null,
      ...raw,
    };
  }

  // Case 2: bọc trong data
  if (raw.data && raw.data.sessionId && raw.data.cif && raw.data.fullname) {
    const d = raw.data;
    return {
      sessionId: String(d.sessionId),
      cif: String(d.cif),
      fullname: String(d.fullname),
      fullnameVn: d.fullnameVn ?? null,
      idCardType: d.idCardType ?? null,
      ...d,
    };
  }

  // (Optional) Case 3: fallback cũ nếu từng dùng token/profile
  if (raw.token && raw.profile?.cif && raw.profile?.fullname) {
    return {
      sessionId: String(raw.token),
      cif: String(raw.profile.cif),
      fullname: String(raw.profile.fullname),
      fullnameVn: raw.profile.fullnameVn ?? null,
      idCardType: raw.profile.idCardType ?? null,
      ...raw,
    };
  }

  return null;
}

export async function verifyToken(
  loginToken: string,
  signal?: AbortSignal
): Promise<SessionInfo> {
  console.log("[verifyToken] MODE=PROD");

  // Đây chỉ là tên field FE gửi lên BE (không liên quan tới token trong response)
  const field = (import.meta.env.VITE_MB_TOKEN_FIELD as string) || "token";
  const fd = new FormData();
  fd.append(field, loginToken);

  const url = buildEndpoint("/api/v1/mb/verify-token");
  const res = await axios.post(url, fd, {
    signal,
    timeout: 20000,
    headers: { Accept: "application/json" },
  });

  console.log("[verify-token] status =", res.status);
  console.log("[verify-token] raw =", res.data, "typeof:", typeof res.data);

  const data = res.data;

  // BE có thể báo lỗi chuẩn
  if (data && data.success === false) {
    throw new Error(data.message || "Verify failed");
  }

  const normalized = normalizeSession(data);
  if (!normalized) {
    const keys =
      data && typeof data === "object" ? Object.keys(data) : String(data);
    throw new Error(
      `Unexpected response format. Got keys: ${JSON.stringify(keys)}`
    );
  }

  return normalized;
}
