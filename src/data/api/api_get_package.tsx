import * as Constant from "../Constants";
import { ApiHelper } from "../apiHelper";

export const BODY_GET_PACKAGE_BY_TYPE = ({ type }: { type: string }) => {
    const formData = new FormData();
    formData.append("type", type);
    return formData;
};

const api_get_package = (data: any) =>
    new Promise((resolve, reject) => {
        ApiHelper(Constant.url_get_package_by_type(), BODY_GET_PACKAGE_BY_TYPE(data))
            .then((response: any) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
    });

export default api_get_package;