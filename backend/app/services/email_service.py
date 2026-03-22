from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("SMTP_USER", ""),
    MAIL_PASSWORD=os.getenv("SMTP_PASSWORD", ""),
    MAIL_FROM=os.getenv("SMTP_FROM", "noreply@bookingai.com"),
    MAIL_PORT=int(os.getenv("SMTP_PORT", 587)),
    MAIL_SERVER=os.getenv("SMTP_HOST", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)

fm = FastMail(conf)


async def send_booking_confirmation_email(to_email: EmailStr, booking_data: dict):
    """
    Gửi email xác nhận đặt phòng

    booking_data should contain:
    - booking_id, customer_name, hotel_name, room_type
    - check_in_date, check_out_date, total_price
    - payment_method, payment_status
    """

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .booking-info {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }}
            .info-row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }}
            .label {{ font-weight: bold; color: #666; }}
            .value {{ color: #333; }}
            .total {{ font-size: 24px; font-weight: bold; color: #667eea; text-align: right; margin-top: 20px; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Đặt phòng thành công!</h1>
                <p>Cảm ơn bạn đã chọn BookingAI</p>
            </div>
            <div class="content">
                <p>Xin chào <strong>{booking_data.get('customer_name')}</strong>,</p>
                <p>Chúng tôi đã nhận được đơn đặt phòng của bạn. Dưới đây là thông tin chi tiết:</p>
                
                <div class="booking-info">
                    <h3>Thông tin đặt phòng</h3>
                    <div class="info-row">
                        <span class="label">Mã đặt phòng:</span>
                        <span class="value">#{booking_data.get('booking_id')}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Khách sạn:</span>
                        <span class="value">{booking_data.get('hotel_name')}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Loại phòng:</span>
                        <span class="value">{booking_data.get('room_type')}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Nhận phòng:</span>
                        <span class="value">{booking_data.get('check_in_date')}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Trả phòng:</span>
                        <span class="value">{booking_data.get('check_out_date')}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Hình thức thanh toán:</span>
                        <span class="value">{booking_data.get('payment_method')}</span>
                    </div>
                    <div class="total">
                        Tổng tiền: {booking_data.get('total_price'):,} VNĐ
                    </div>
                </div>
                
                <p><strong>Lưu ý quan trọng:</strong></p>
                <ul>
                    <li>Vui lòng mang theo CMND/CCCD khi nhận phòng</li>
                    <li>Check-in: Từ 14:00 | Check-out: Trước 12:00</li>
                    <li>Xuất trình mã đặt phòng tại quầy lễ tân</li>
                </ul>
                
                <center>
                    <a href="{FRONTEND_URL}/booking/history" class="button">Xem chi tiết đặt phòng</a>
                </center>
                
                <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ:</p>
                <p>📞 Hotline: 1900-xxxx<br>
                📧 Email: support@bookingai.com</p>
            </div>
            <div class="footer">
                <p>© 2026 BookingAI. All rights reserved.</p>
                <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
        </div>
    </body>
    </html>
    """

    message = MessageSchema(
        subject=f" Xác nhận đặt phòng #{booking_data.get('booking_id')} - BookingAI",
        recipients=[to_email],
        body=html_body,
        subtype=MessageType.html,
    )

    try:
        await fm.send_message(message)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


async def send_cancellation_email(to_email: EmailStr, cancellation_data: dict):
    """
    Gửi email thông báo hủy phòng

    cancellation_data should contain:
    - booking_id, customer_name, hotel_name
    - refund_amount, cancellation_date
    """

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .info-box {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c; }}
            .refund-info {{ background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Xác nhận hủy đặt phòng</h1>
            </div>
            <div class="content">
                <p>Xin chào <strong>{cancellation_data.get('customer_name')}</strong>,</p>
                <p>Đơn đặt phòng của bạn đã được hủy thành công.</p>
                
                <div class="info-box">
                    <h3>Thông tin hủy phòng</h3>
                    <p><strong>Mã đặt phòng:</strong> #{cancellation_data.get('booking_id')}</p>
                    <p><strong>Khách sạn:</strong> {cancellation_data.get('hotel_name')}</p>
                    <p><strong>Ngày hủy:</strong> {cancellation_data.get('cancellation_date')}</p>
                </div>
                
                <div class="refund-info">
                    <h3>💰 Thông tin hoàn tiền</h3>
                    <p><strong>Số tiền hoàn lại:</strong> {cancellation_data.get('refund_amount'):,} VNĐ</p>
                    <p>Tiền sẽ được hoàn lại vào tài khoản của bạn trong vòng 5-7 ngày làm việc.</p>
                </div>
                
                <p>Chúng tôi rất tiếc vì sự bất tiện này. Hy vọng sẽ được phục vụ bạn trong tương lai!</p>
                
                <p>Nếu có thắc mắc, vui lòng liên hệ:<br>
                📞 Hotline: 1900-xxxx<br>
                📧 Email: support@bookingai.com</p>
            </div>
            <div class="footer">
                <p>© 2026 BookingAI. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    message = MessageSchema(
        subject=f"Xác nhận hủy đặt phòng #{cancellation_data.get('booking_id')} - BookingAI",
        recipients=[to_email],
        body=html_body,
        subtype=MessageType.html,
    )

    try:
        await fm.send_message(message)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
