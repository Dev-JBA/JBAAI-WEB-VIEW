// src/data/txnStorage.ts
export const TXN_KEY = "MB_LAST_TXN_ID";
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 phút

type TxnPayload = {
  id: string;
  savedAt: number;
  expiresAt: number;
};

/**
 * Lưu transactionId vào localStorage (có TTL)
 */
export function saveTxn(id: string, ttlMs: number = DEFAULT_TTL_MS) {
  const now = Date.now();
  const payload: TxnPayload = {
    id,
    savedAt: now,
    expiresAt: now + Math.max(30_000, ttlMs),
  };
  try {
    localStorage.setItem(TXN_KEY, JSON.stringify(payload));
  } catch {}
}

/**
 * Đọc transactionId còn hiệu lực (chưa hết hạn)
 */
export function readTxn(): { id: string } | null {
  try {
    const raw = localStorage.getItem(TXN_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as TxnPayload;
    if (!obj?.id || !obj?.expiresAt) {
      clearTxn();
      return null;
    }
    if (Date.now() > obj.expiresAt) {
      clearTxn();
      return null;
    }
    return { id: obj.id };
  } catch {
    clearTxn();
    return null;
  }
}

/**
 * Xoá transactionId khỏi localStorage
 */
export function clearTxn() {
  try {
    localStorage.removeItem(TXN_KEY);
  } catch {}
}

/**
 * Thời gian còn lại trước khi hết hạn (ms)
 */
export function msLeft(): number {
  try {
    const raw = localStorage.getItem(TXN_KEY);
    if (!raw) return 0;
    const obj = JSON.parse(raw) as TxnPayload;
    return Math.max(0, obj.expiresAt - Date.now());
  } catch {
    return 0;
  }
}
