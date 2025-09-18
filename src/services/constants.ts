// src/services/constants.ts

// ====== Đối tác (merchant) backend của bạn ======
export const API_URL = "https://jbaai-y7mb.onrender.com";

export const url_get_package_by_type = () =>
  `${API_URL}/api/v1/package/get-by-type`;

export const url_verify_user = () => `${API_URL}/api/v1/mb/verify-token`;

// ====== MB Payment Hub ======
// Base domain chính thức MB cung cấp
export const MB_DOMAIN = "https://api.mbbank.com.vn/apis/v1";

// Nếu MB yêu cầu API Key/Secret trong header thì bạn điền vào đây
export const API_KEY_MB = process.env.REACT_APP_MB_API_KEY || "";
export const SECRET_KEY_MB = process.env.REACT_APP_MB_SECRET_KEY || "";

// Endpoint verify loginToken từ MB App (ví dụ, điền path thật nếu khác)
export const MB_VERIFY_LOGIN_TOKEN_PATH = "/auth/verify-login-token";

// ====== Common ======
export const MESSAGE_NETWORK_ERROR = "Network Error";
export const CODE_TIMEOUT_ERROR = "ECONNABORTED";
