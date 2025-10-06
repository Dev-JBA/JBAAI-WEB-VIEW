/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_LOGIN_URL?: string;
  // thêm biến khác nếu có...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
