import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./AccountPayment.css";
import api_login from "../../data/api/api_login";
import { getUser, setUser } from "../../data/authStorage";

const AccountPayment = () => {
    const location = useLocation();    
    const [active, setActive] = useState<"login" | "signup">((location.state as any)?.active);
    const pendingPackageId = (location.state as any)?.packageId;

    // login form state
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [seenPassword, setSeenPassword] = useState(false);

    // signup form state
    const [regphone, setRegPhone] = useState("");
    const [regEmail, setRegEmail] = useState("");

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const callAPILogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response: any = await api_login({
                email: username,
                password: password,
                clientId: "web-app-v1",
                fcm: ""
            });

            const data = response?.data ?? response;
            try {
                setUser(data);
                const user = getUser();
                alert("Đăng nhập thành công\n" + JSON.stringify(user, null, 2));

            } catch { }


            if (pendingPackageId) {
                alert("pendingPackageId: " + pendingPackageId);
                const user = getUser();
                alert("User information: " + JSON.stringify({ phone: user?.user.phone, email: user?.user.email }, null, 2));
                navigate("/payment", { state: { packageId: pendingPackageId, phone: user?.user.phone, email: user?.user.email } });
            } else {
                // nếu không có packageId thì về trang chính
                navigate("/", { replace: true });
            }
        } catch (err: any) {
            console.error("login error", err);
            setError(err?.message || "Lỗi trong quá trình đăng nhập");
        } finally {
            setIsLoading(false);
        }
    };

    const onLogin = (e: React.FormEvent) => {
        e.preventDefault();
        callAPILogin();
    };

    const onSignup = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Đăng ký thành công\n" + JSON.stringify({ regphone, regEmail, pendingPackageId }, null, 2));
        navigate("/payment", { state: { packageId: pendingPackageId, phone: regphone, email: regEmail } });
    };

    return (
        <div className="login-root">
            <div className="login-frame">
                <div className="login-tabs">
                    <button
                        className={`tab ${active === "login" ? "active" : ""}`}
                        onClick={() => setActive("login")}
                        aria-pressed={active === "login"}
                    >
                        Đăng nhập
                    </button>

                    <button
                        className={`tab ${active === "signup" ? "active" : ""}`}
                        onClick={() => setActive("signup")}
                        aria-pressed={active === "signup"}
                    >
                        Đăng ký
                    </button>
                </div>

                <div className="login-card">
                    {active === "login" ? (
                        <form className="form" onSubmit={onLogin}>
                            <label className="input-label">
                                <input
                                    className="input"
                                    placeholder="Tên đăng nhập hoặc email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </label>

                            <label className="input-label">
                                <input
                                    className="input"
                                    type={seenPassword ? "text" : "password"}
                                    placeholder="Mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    aria-label="Mật khẩu"
                                />
                            </label>

                            <div className="row-misspass">
                                <label className="remember">
                                    <input
                                        type="checkbox"
                                        checked={seenPassword}
                                        onChange={(e) => setSeenPassword(e.target.checked)}
                                    />
                                    <span>Xem mật khẩu</span>
                                </label>

                                <Link to="/forgot" className="forgot">
                                    Quên mật khẩu
                                </Link>
                            </div>

                            <button type="submit" className="primary-button">
                                Đăng nhập
                            </button>
                        </form>
                    ) : (
                        <form className="form" onSubmit={onSignup}>
                            <label className="input-label">
                                <input
                                    className="input"
                                    placeholder="Số điện thoại"
                                    value={regphone}
                                    onChange={(e) => setRegPhone(e.target.value)}
                                />
                            </label>

                            <label className="input-label">
                                <input
                                    className="input"
                                    placeholder="Email"
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                />
                            </label>

                            <button type="submit" className="primary-button">
                                Đăng ký
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountPayment;