import { Link } from "react-router-dom";
import images from "../../assets";
import './instruction.css';

const Instruction = () => {
    return (
        <div className="container">
            <h1>Hướng dẫn cài đặt ứng dụng JBAAI</h1>
            <div className='p1'>Ứng dụng JBAAI có thể tải được trên cả điện thoại Android và điện thoại iPhone nên thích hợp với mọi người dùng có nhu cầu theo dõi sức khỏe bản thân. Để cài đặt JBAAI về điện thoại bạn thực hiện như sau:</div>
            <div className='p1'><b>Bước 1:</b> Khách hàng truy cập vào ứng dụng JBAAI ở CH Play (nếu sử dụng điện thoại Android) hoặc ứng dụng App Store (nếu sử dụng điện thoại iPhone) để tải xuống</div>
            <div className="box-img">
                <img src={images.instruction.download_app} alt="Logo" className="img" />
            </div>
            <div className='p1'><b>Bước 2:</b> Khách hàng truy cập vào ứng dụng trên điện thoại.</div>
            <div className="box-img">
                <img src={images.instruction.app_open} alt="Logo" className="img" />
            </div>
            <div className='p1'><b>Bước 3.1:</b> Khách hàng login vào app, tại màn hình đăng nhập, đăng nhập nếu đã có tài khoản JBAAI, nếu chưa có Khách hàng nhấn đăng kí tạo tài khoản mới.</div>
            <div className="box-img">
                <img src={images.instruction.login} alt="Logo" className="img-arrow" />
                <div
                    className="arrow-annotation"
                    style={{
                        ['--arrow-before-left' as any]: '65%',
                        ['--arrow-before-top' as any]: '35%',
                        ['--arrow-after-left' as any]: '75%',
                        ['--arrow-after-top' as any]: '27%',
                        ['--arrow-label' as any]: '"Nhập email hoặc Username"',
                        ['--arrow-dot-top' as any]: '71%',
                        ['--arrow-left' as any]: '10px',
                        ['--arrow-dot-left' as any]: '95%'
                    }}
                >
                    <span className="dot"></span>
                </div>
                <div
                    className="arrow-annotation"
                    style={{
                        ['--arrow-before-left' as any]: '65%',
                        ['--arrow-before-top' as any]: '73%',
                        ['--arrow-after-left' as any]: '75%',
                        ['--arrow-after-top' as any]: '65%',
                        ['--arrow-label' as any]: '"Đăng nhập bằng mã OTP"',
                        ['--arrow-dot-top' as any]: '71%',
                        ['--arrow-left' as any]: '10px',
                        ['--arrow-dot-left' as any]: '95%'
                    }}
                >
                    <span className="dot"></span>
                </div>
                <div
                    className="arrow-annotation"
                    style={{
                        ['--arrow-before-left' as any]: '3%',
                        ['--arrow-before-top' as any]: '73%',
                        ['--arrow-after-left' as any]: '3%',
                        ['--arrow-after-top' as any]: '65%',
                        ['--arrow-label' as any]: '"Đăng nhập nếu có tài khoản JBA"',
                        ['--arrow-dot-top' as any]: '71%',
                        ['--arrow-left' as any]: '10px',
                        ['--arrow-dot-left' as any]: '3%'
                    }}
                >
                    <span className="dot"></span>
                </div>
            </div>
            <div className='p1'><b>*Bước 3.2:</b> Đối với với khách hàng đã thanh toán gói dịch vụ JBAAI trên MBBank hãy nhập email đã thanh toán và nhập mã OTP được gửi qua email để đăng nhập.</div>
            <div className="row-img">
                <img src={images.instruction.send_email} alt="Logo" className="img-arrow" />
                <img src={images.instruction.enter_otp} alt="Logo" className="img-arrow" />
            </div>
            <div className='p1'><b>Bước 3.3:</b> Đăng kí tài khoản JBAAI, Khách hàng nhập các thông tin cần thiết để đăng kí.</div>
            <div className='row-img'>
                <img src={images.instruction.register_1} alt="Logo" className="img-arrow" />
                <img src={images.instruction.register_2} alt="Logo" className="img-arrow" />
            </div>
            <div className='p1'><b>Bước 4:</b> Khách hàng đăng nhập/ đăng kí thành công - màn hình chuyển đến màn hình Scan đo chỉ số sức khoẻ trên gương mặt </div>
            <div className="box-img">
                <img src={images.instruction.scan} alt="Logo" className="img-arrow" />
            </div>
            <div className='p1'><b>Bước 4.1:</b> Màn hình lịch sử Scan lưu lịch sử các chỉ số sức khoẻ sau khi Scan của khách hàng</div>
            <div className="box-img">
                <img src={images.instruction.history_scan} alt="Logo" className="img-arrow" />
                <div
                    className="arrow-annotation"
                    style={{
                        ['--arrow-before-left' as any]: '65%',
                        ['--arrow-before-top' as any]: '73%',
                        ['--arrow-after-left' as any]: '75%',
                        ['--arrow-after-top' as any]: '65%',
                        ['--arrow-label' as any]: '"Xem lịch sử các lần Scan"',
                        ['--arrow-dot-top' as any]: '71%',
                        ['--arrow-left' as any]: '10px',
                        ['--arrow-dot-left' as any]: '95%'
                    }}
                >
                    <span className="dot"></span>
                </div>
            </div>
            <div className='p1'><b>Bước 4.2:</b> Trang Profile setting, tuỳ chỉnh thông tin tài khoản Khách hàng.</div>
            <div className='box-img'>
                <img src={images.instruction.profile} alt="Logo" className="img-arrow " />
                <div
                    className="arrow-annotation"
                    style={{
                        ['--arrow-before-left' as any]: '3%',
                        ['--arrow-before-top' as any]: '42%',
                        ['--arrow-after-left' as any]: '3%',
                        ['--arrow-after-top' as any]: '34%',
                        ['--arrow-label' as any]: '"Bật thông báo nhắc nhở"',
                        ['--arrow-left' as any]: '10px',
                        ['--arrow-dot-left' as any]: '3%'
                    }}
                >
                    <span className="dot"></span>
                </div>
                <div
                    className="arrow-annotation"
                    style={{
                        ['--arrow-before-left' as any]: '65%',
                        ['--arrow-before-top' as any]: '34%',
                        ['--arrow-after-left' as any]: '75%',
                        ['--arrow-after-top' as any]: '26%',
                        ['--arrow-label' as any]: '"Quản lý thông tin cá nhân"',
                        ['--arrow-dot-top' as any]: '71%',
                        ['--arrow-left' as any]: '10px',
                        ['--arrow-dot-left' as any]: '95%'
                    }}
                >
                    <span className="dot"></span>
                </div>
            </div>
            <button className="button-bottom" onClick={() => { }}><Link to="/" style={{ color: "white", textDecoration: "none" }}>Quay về trang chủ</Link></button>
        </div>
    );
}

export default Instruction;