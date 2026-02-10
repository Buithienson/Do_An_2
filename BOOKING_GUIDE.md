# Hướng Dẫn Sử Dụng Tính Năng Đặt Phòng

## 📋 Tổng Quan
Hệ thống đặt phòng khách sạn với giao diện hiện đại, tích hợp thanh toán và kiểm tra tình trạng phòng theo thời gian thực.

## 🚀 Tính Năng Chính

### 1. Xem Chi Tiết Phòng
- Đường dẫn: `/rooms/[id]`
- Hiển thị thông tin phòng đầy đủ: hình ảnh, tiện nghi, giá, mô tả
- Form đặt phòng nhanh với chọn ngày và số khách

### 2. Trang Đặt Phòng & Thanh Toán
- Đường dẫn: `/booking/[roomId]`
- **Thông tin khách hàng**: Tên, email, số điện thoại
- **Chi tiết booking**: Ngày nhận/trả phòng, số khách, yêu cầu đặc biệt
- **Kiểm tra tình trạng phòng**: Tự động kiểm tra phòng có trống không
- **Giảm giá tự động**:
  - 5% cho đặt từ 3 đêm
  - 10% cho đặt từ 7 đêm
- **Phương thức thanh toán**:
  - Thẻ tín dụng (Visa, Mastercard, JCB)
  - Tiền mặt tại khách sạn

### 3. Xác Nhận Đặt Phòng
- Hiển thị mã đặt phòng
- Chi tiết booking đầy đủ
- Email xác nhận (sắp có)

## 🔧 API Endpoints

### Kiểm Tra Tình Trạng Phòng
```
GET /api/bookings/availability?room_id={id}&check_in_date={date}&check_out_date={date}
```

Response:
```json
{
  "room_id": 1,
  "available": true,
  "base_price": 1200000,
  "nights": 3,
  "total_price_before_discount": 3600000,
  "discount_rate": 0.05,
  "total_price": 3420000,
  "price_per_night_after_discount": 1140000
}
```

### Tạo Booking
```
POST /api/bookings/
Authorization: Bearer {token}
```

Request Body:
```json
{
  "hotel_id": 1,
  "room_id": 1,
  "check_in_date": "2026-02-01T00:00:00Z",
  "check_out_date": "2026-02-05T00:00:00Z",
  "guests": 2,
  "special_requests": "Late check-in"
}
```

### Tạo Payment
```
POST /api/bookings/payment
Authorization: Bearer {token}
```

Request Body:
```json
{
  "booking_id": 1,
  "amount": 3420000,
  "currency": "VND",
  "payment_method": "credit_card",
  "payment_metadata": {
    "card_last_4": "1234",
    "card_name": "NGUYEN VAN A"
  }
}
```

## 🎯 Luồng Sử Dụng

### Cho Khách Chưa Đăng Nhập:
1. Vào trang chi tiết phòng `/rooms/[id]`
2. Chọn ngày và số khách
3. Click "Đặt ngay"
4. Điền thông tin cá nhân tại trang booking
5. Chọn phương thức thanh toán
6. Xác nhận đặt phòng

### Cho Khách Đã Đăng Nhập:
1. Vào trang chi tiết phòng `/rooms/[id]`
2. Chọn ngày và số khách
3. Click "Đặt ngay"
4. Thông tin cá nhân được điền sẵn
5. Chọn phương thức thanh toán
6. Xác nhận đặt phòng
7. Payment được xử lý tự động (nếu chọn thẻ)

## 🔐 Authentication

### Không Bắt Buộc Đăng Nhập
- Khách vãng lai có thể đặt phòng bằng cách điền thông tin thủ công
- Booking sẽ được tạo nhưng không liên kết với user account

### Có Đăng Nhập (Khuyến Nghị)
- Lưu lịch sử booking
- Quản lý booking dễ dàng
- Nhận ưu đãi thành viên
- Xử lý payment tự động

## 💳 Phương Thức Thanh Toán

### 1. Thẻ Tín Dụng
- Thanh toán ngay lập tức
- Xác nhận tự động
- Bảo mật với mã hóa

### 2. Tiền Mặt
- Thanh toán tại khách sạn khi nhận phòng
- Cần mang CMND/CCCD
- Đặt trước để giữ phòng

## 📊 Trạng Thái Booking

- `pending`: Chờ thanh toán
- `confirmed`: Đã xác nhận
- `cancelled`: Đã hủy
- `completed`: Hoàn thành

## 🧪 Testing

### Test Data:
```javascript
// Room ID: 1, 2, 3, etc. (xem trong database)
// Dates: Chọn ngày trong tương lai
// Guests: 1-4 (tùy max_guests của phòng)
```

### Test Accounts:
```
Admin:
- Email: admin@aibooking.com
- Password: admin123

User:
- Email: user@example.com
- Password: user123
```

## 🐛 Troubleshooting

### Lỗi "Room not available"
- Kiểm tra phòng đã được đặt trong thời gian đó chưa
- Chọn ngày khác hoặc phòng khác

### Lỗi "Failed to fetch"
- Đảm bảo backend đang chạy: `uvicorn main:app --reload`
- Kiểm tra CORS settings

### Lỗi Authentication
- Đăng nhập lại
- Kiểm tra token trong localStorage
- Token có thể hết hạn (refresh needed)

## 🎨 Tùy Chỉnh

### Thay Đổi Giá & Discount
File: `backend/app/routers/bookings.py`
```python
# Adjust discount thresholds
if nights >= 7:
    discount_multiplier = 0.9  # 10%
elif nights >= 3:
    discount_multiplier = 0.95  # 5%
```

### Thay Đổi Giao Diện
File: `frontend/app/booking/[roomId]/page.tsx`
- Tùy chỉnh màu sắc, layout
- Thêm/bớt trường thông tin
- Thay đổi validation rules

## 📝 Notes

- Booking ID được tạo tự động
- Transaction ID cho payment được generate ngẫu nhiên
- Cache availability trong 5 phút để tối ưu performance
- Sử dụng database lock để tránh double booking

## 🚧 Tính Năng Sắp Có

- [ ] Email xác nhận tự động
- [ ] SMS notification
- [ ] Tích hợp payment gateway thật (VNPay, Stripe)
- [ ] Lịch sử booking cho user
- [ ] Hủy/Đổi booking
- [ ] Review sau khi hoàn thành
