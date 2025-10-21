import { Link } from "react-router-dom";
import images from "../../assets";
import './ResultPayment.css';

type ResultPaymentProps = {
    dataTransaction: any,
    finalMessage?: string,
};
const ResultPayment: React.FC<ResultPaymentProps> = ({ dataTransaction, finalMessage }) => {
    return <div>
        <div className="container">
            <div className="resultContainer">
                {/* <img src={finalSuccess ? images.icon.payment_success : images.icon.payment_failed} alt="Logo" className="logo" />
        <div style={{ fontWeight: 700, fontSize: 18 }}>
          {finalSuccess
            ? "Thanh toán thành công"
            : "Thanh toán thất bại"}
        </div>
        {finalMessage ? (
          <p style={{ opacity: 0.8 }}>{finalMessage}</p>
        ) : <p>{dataTransaction?.type.name || "-"} thành công. Cảm ơn quí khách đã lựa chọn sản phẩm</p>}
         */}
                <img src={images.icon.payment_success} alt="Logo" className="logo" />
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                    Thanh toán thành công
                </div>
                <p style={{ opacity: 0.8 }}>Giao dịch thành công. Cảm ơn quí khách đã lựa chọn sản phẩm</p>
            </div>
            {/* <div className="detailContainer">
                <div className="row">
                    <h3>Thông tin giao dịch</h3>
                    <p>{dataTransaction?.id || "-"}</p>
                </div>
                <hr />
                <div className="row">
                    <h3>Ngày tạo giao dịch</h3>
                    <p>{dataTransaction?.createdTime || "-"}</p>
                </div>
                <hr />
                <div className="row">
                    <h3>Đối tác</h3>
                    <p>{dataTransaction?.merchant.code || "-"}</p>
                </div>
                <hr style={{ margin: "8px 0" }} />
                <div className="row">
                    <h3>Tên đối tác</h3>
                    <p>{dataTransaction?.merchant.name || "-"}</p>
                </div>
                <hr />
                <div className="row">
                    <h3>Tổng tiền</h3>
                    <p>{dataTransaction?.amount.toLocaleString() || "-"}</p>
                </div>
                <hr />
                <div className="row">
                    <h3>Trạng thái</h3>
                    <p>{dataTransaction?.status || "-"}</p>
                </div>

            </div> */}
            <button className="button-bottom"><Link to="/instruction" style={{ color: "white", textDecoration: "none" }}>Hướng dẫn cài đặt ứng dụng</Link></button>
        </div>
    </div>
};

export default ResultPayment;