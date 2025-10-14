
const images = {
    icon: {
        x_error: new URL("./img/icon/x.png", import.meta.url).href,
        payment_success: new URL("./img/icon/payment_success.png", import.meta.url).href,
        payment_failed: new URL("./img/icon/payment_fail.png", import.meta.url).href,
    },
    instruction: {
        app_open: new URL("./img/instruction/app-open.png", import.meta.url).href,
        login: new URL("./img/instruction/login.png", import.meta.url).href,
        register_1: new URL("./img/instruction/register-1.png", import.meta.url).href,
        register_2: new URL("./img/instruction/register-2.png", import.meta.url).href,
        profile: new URL("./img/instruction/profile.png", import.meta.url).href,
        history_scan: new URL("./img/instruction/history-scan.png", import.meta.url).href,
        scan: new URL("./img/instruction/scan.png", import.meta.url).href,
        download_app: new URL("./img/instruction/download-app.png", import.meta.url).href,
        enter_otp: new URL("./img/instruction/enter-otp.png", import.meta.url).href,
        send_email: new URL("./img/instruction/send-email.png", import.meta.url).href,
    }
}

export default images;