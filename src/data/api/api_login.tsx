import axios from "axios";
import * as Constant from "../Constants";
import ApiHelper from "../apiHelper";

export const BODY_LOGIN = ({ email, password, clientId, fcm }: { email: string; password: string, clientId: string, fcm: string }) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);
  formData.append("clientId", clientId);
  //truyen FCM token
  formData.append("fcm", fcm);
  return formData;
};

export default (data: any) =>
  new Promise((resolve, reject) => {    
    ApiHelper(Constant.url_api_login(), BODY_LOGIN(data))
      .then((response: any) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
