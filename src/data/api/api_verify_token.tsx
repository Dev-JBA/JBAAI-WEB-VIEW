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

function normalizeSession(raw: any): SessionInfo | null {
  if (!raw) return null;

  const maybeObj = tryParseJSON(raw);
  if (maybeObj) raw = maybeObj;

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

  const field = (import.meta.env.VITE_MB_TOKEN_FIELD as string) || "token";
  const fd = new FormData();
  fd.append(field, loginToken);

  const url = buildEndpoint("/api/v1/mb/verify-token");
  const res = await axios.post(url, fd, {
    signal,
    timeout: 20000,
    headers: { Accept: "application/json" },
  });

  const data = res.data;

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
