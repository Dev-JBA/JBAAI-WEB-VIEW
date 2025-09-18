import axios from "axios";
import axiosRetry from "axios-retry";
import { API_URL } from "./constants";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

axiosRetry(api, { retries: 2, retryDelay: axiosRetry.exponentialDelay });

// Nếu BE yêu cầu header riêng thì set tại đây
api.interceptors.request.use((config) => {
  // ví dụ: đính thêm X-Client-Id nếu cần
  return config;
});

export default api;
