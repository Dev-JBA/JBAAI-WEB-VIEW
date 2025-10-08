/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_MB_TOKEN_FIELD?: string;
  readonly VITE_LOGIN_URL?: string;
  readonly VITE_GOOGLE_MAP_API_KEY?: string;
  readonly VITE_SOME_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
