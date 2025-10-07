const api_url = "https://jbaai-y7mb.onrender.com"

export const MB_DOMAIN = 'https://api.mbbank.com.vn/apis/v1'
export const API_KEY_MB = ''
export const SECRET_KEY_MB = ''

export const url_get_package_by_type = () =>
    `${api_url}/api/v1/package/get-by-type`;

export const url_verify_user = () =>
    `${api_url}/api/merchant/v1/session/verify`;

export const url_api_login = () =>
    `${api_url}/api/v1/auth/login`;


export const MESSAGE_NETWORK_ERROR = "Network Error";
export const CODE_TIMEOUT_ERROR = "ECONNABORTED";