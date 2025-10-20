import { getUser } from "../../data/authStorage";

const isObjectId = (s: string) => /^[0-9a-fA-F]{24}$/.test(s);

export type InitRequest = {
  sessionId: string;
  cif: string | number; // BẮT BUỘC
  packageId: string;
  description: string;
  email?: string;
  phone?: string;
};

export function buildInitRequest(location: {
  state?: any;
  search?: string;
}): InitRequest {
  const st = (location?.state ?? {}) as any;
  const qs = new URLSearchParams(location?.search ?? "");

  const packageId = (st.packageId ?? qs.get("packageId") ?? "") as string;

  const verifyRaw = JSON.parse(
    localStorage.getItem("mb_verify_profile") || "null"
  ) as { sessionId?: string; cif?: string } | null;

  const user: any = (getUser?.() ?? {}) as any;

  const sessionId = user?.sessionId;
  const cif = user?.cif;
    // verifyRaw?.sessionId || user?.sessionId || user?.accessToken || "";
  // const cif = verifyRaw?.cif || user?.user?.cif || ""; // <-- ƯU TIÊN verify

  const phone = st.phone ?? qs.get("phone") ?? user?.user?.phone ?? "";
  const email = st.email ?? qs.get("email") ?? user?.user?.email ?? "";

  const description = `Thanh toán gói dịch vụ ${packageId}`.slice(0, 200);

  if (!packageId || !isObjectId(packageId))
    throw new Error("packageId không hợp lệ (cần ObjectId 24 hex).");
  if (!sessionId || !cif) throw new Error("sessionId và cif là bắt buộc");

  return { sessionId, cif, packageId, description, email, phone };
}
