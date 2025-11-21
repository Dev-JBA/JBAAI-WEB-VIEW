// src/data/api/api_verify_token.ts
import axios from "axios";

export type SessionInfo = {
  sessionId: string;
  cif: string;
  fullname: string;
  fullnameVn?: string | null;
  idCardType?: string | null;
  [k: string]: any;
};

function buildEndpoint(path: string) {
  const raw =
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "";
  const base = raw.replace(/\/+$/, "");
  return base ? `${base}${path}` : path;
}

function tryParseJSON<T = any>(x: unknown): T | null {
  if (typeof x !== "string") return null;
  try {
    return JSON.parse(x) as T;
  } catch {
    return null;
  }
}

// Helper pick field với nhiều biến thể tên
function pickSessionId(obj: any): string | null {
  const v =
    obj?.sessionId ??
    obj?.sessionID ??
    obj?.session_id ??
    obj?.accessToken ??
    obj?.token;
  return v ? String(v) : null;
}

function pickCif(obj: any): string | null {
  const v =
    obj?.cif ??
    obj?.cifNo ??
    obj?.cifno ??
    obj?.customerId ??
    obj?.customerID ??
    obj?.custId;
  return v ? String(v) : null;
}

function pickFullname(obj: any): string | null {
  const v =
    obj?.fullname ??
    obj?.fullName ??
    obj?.full_name ??
    obj?.custName ??
    obj?.customerName;
  return v ? String(v) : null;
}

// Chuẩn hoá mọi biến thể payload có thể gặp
function normalizeSession(rawInput: any): SessionInfo | null {
  if (!rawInput) return null;

  let raw = rawInput;
  const maybeObj = tryParseJSON(rawInput);
  if (maybeObj) raw = maybeObj;

  const candidates = [raw, raw?.data, raw?.profile];

  for (const c of candidates) {
    if (!c || typeof c !== "object") continue;

    const sessionId = pickSessionId(c);
    const cif = pickCif(c);
    const fullname = pickFullname(c);

    if (sessionId && cif && fullname) {
      return {
        sessionId,
        cif,
        fullname,
        fullnameVn: c.fullnameVn ?? c.fullNameVn ?? null,
        idCardType: c.idCardType ?? c.idcardType ?? null,
        ...c,
      };
    }
  }

  // Fallback: chấp nhận có sessionId, còn cif/fullname để BE return sau
  const sessionId = pickSessionId(raw) || pickSessionId(raw?.data);
  if (sessionId) {
    return {
      sessionId,
      cif: pickCif(raw) || pickCif(raw?.data) || "",
      fullname: pickFullname(raw) || pickFullname(raw?.data) || "",
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

  /**
   * Gửi token lên BE:
   *  - Nếu có cấu hình VITE_MB_TOKEN_FIELD thì dùng field đó
   *  - Đồng thời gửi luôn cả "loginToken" và "token" để BE linh hoạt
   */
  const fd = new FormData();

  const fieldEnv = (
    import.meta.env.VITE_MB_TOKEN_FIELD as string | undefined
  )?.trim();

  if (fieldEnv) {
    fd.append(fieldEnv, loginToken);
  }

  // luôn gửi thêm 2 field phổ biến
  fd.append("loginToken", loginToken);
  fd.append("token", loginToken);

  const url = buildEndpoint("/api/v1/mb/verify-token");
  const res = await axios.post(url, fd, {
    signal,
    timeout: 20000,
    headers: { Accept: "application/json" },
  });

  const data = res.data;

  // nếu BE dùng format { success, message, data }
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
