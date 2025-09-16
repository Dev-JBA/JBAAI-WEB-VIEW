import axios from "axios";

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

interface ApiHelperOptions {
    contentType?: string;
    retries?: number;
    retryDelay?: number;
}

export const ApiHelper = async (
    url: string,
    data: any = null,
    options: ApiHelperOptions = {}
) => {
    const {
        contentType = 'multipart/form-data',
        retries = 3,
        retryDelay = 1000,
    } = options;

    const makeRequest = async (attempt: number = 1): Promise<any> => {
        try {
            const headers: Record<string, string> = {
                'Content-Type': contentType,
            };

            const response = await axios.post(url, data, {
                timeout: 15000,
                headers,
            });

            return response.data;

        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (
                    (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') &&
                    attempt < retries
                ) {
                    await new Promise((resolve) => setTimeout(resolve, retryDelay));
                    return makeRequest(attempt + 1);
                }

                if (error.response) {
                    const message = error.response.data?.message || "Đã xảy ra lỗi không xác định từ server.";
                    throw new ApiError(message, error.response.status);
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
};

export default ApiHelper;