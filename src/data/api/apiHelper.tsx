import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

// ... các import & class giữ nguyên
export class ApiError extends Error {
  status: number;
  details?: any;
  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}
export interface ApiHelperOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  contentType?: string;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  baseURL?: string;
  withCredentials?: boolean;
  timeout?: number;
  /** BẬT log kiểu Postman */
  debug?: boolean;
  logLabel?: string;
}

const instance = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || "",
  timeout: 20000,
});

// helper: in đậm FormData giống Postman
function printFormData(fd: FormData) {
  const rows: Array<{ Key: string; Type: string; Value: string }> = [];
  fd.forEach((v, k) => {
    rows.push({
      Key: k,
      Type: typeof v === "string" ? "Text" : "File",
      Value: typeof v === "string" ? v : (v as File).name,
    });
  });
  console.table(rows);
}

async function ApiHelper<T = any>(
  url: string,
  data: any = null,
  options: ApiHelperOptions = {}
): Promise<T> {
  const {
    method = "POST",
    contentType,
    retries = 3,
    retryDelay = 1000,
    signal,
    headers = {},
    params,
    baseURL,
    withCredentials,
    timeout,
    debug = false,
    logLabel,
  } = options;

  const makeRequest = async (attempt = 1): Promise<T> => {
    try {
      const isFormData =
        typeof FormData !== "undefined" && data instanceof FormData;

      const cfg: AxiosRequestConfig = {
        url,
        method,
        data: method === "GET" ? undefined : data,
        params:
          method === "GET" ? { ...(params || {}), ...(data || {}) } : params,
        headers: { ...headers },
        signal,
        baseURL,
        withCredentials,
        timeout,
      };

      // Không set Content-Type khi là FormData
      if (!isFormData && contentType) {
        (cfg.headers as Record<string, string>)["Content-Type"] = contentType;
      } else if (isFormData && cfg.headers) {
        delete (cfg.headers as Record<string, string>)["Content-Type"];
      }

      // ===== DEBUG: log giống Postman =====
      if (debug) {
        const fullBase = (cfg.baseURL ?? instance.defaults.baseURL) || "";
        const fullUrl = `${fullBase}${cfg.url}`;
        console.groupCollapsed(
          `➡️ [API] ${logLabel ?? ""} ${cfg.method} ${fullUrl}`
        );
        console.log("Headers:", cfg.headers || {});
        if (isFormData) {
          console.log("Body (form-data):");
          printFormData(data as FormData);
        } else if (cfg.data !== undefined) {
          console.log("Body (JSON):", cfg.data);
        }
        if (cfg.params) console.log("Query Params:", cfg.params);
      }
      const res: AxiosResponse<T> = await instance.request<T>(cfg);

      if (debug) {
        console.log("✅ Response:", res.status, res.statusText);
        console.log("Body:", res.data);
        console.groupEnd();
      }
      return res.data;
    } catch (error: any) {
      if (debug) {
        console.error("❌ API error:", error);
        console.groupEnd?.();
      }
      // ... phần xử lý lỗi giữ nguyên như bạn đang có
      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? 0;
        const isNet =
          error.code === "ERR_NETWORK" || error.code === "ECONNABORTED";
        const is5xx = status >= 500 && status < 600;

        if ((isNet || is5xx) && attempt < retries) {
          await new Promise((r) => setTimeout(r, retryDelay));
          return makeRequest(attempt + 1);
        }

        if (error.response) {
          const payload = error.response.data;
          const message =
            (typeof payload === "string" ? payload : payload?.message) ||
            error.message ||
            "Đã xảy ra lỗi không xác định từ server.";
          throw new ApiError(message, status, payload);
        }

        throw new ApiError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại internet.",
          408
        );
      }
      throw new ApiError("Đã xảy ra lỗi không mong muốn.", 500);
    }
  };

  return makeRequest();
}

export { ApiHelper };
export default ApiHelper;
