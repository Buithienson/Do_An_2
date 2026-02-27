'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreditCard, Banknote, CheckCircle, Calendar, Users, Hotel, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { API_URL } from '@/lib/api';

interface Room {
  id: number;
  name: string;
  room_type: string;
  base_price: number;
  max_guests: number;
  hotel_id: number;
  images?: string[];
  amenities?: string[];
}

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  paymentMethod: 'credit_card' | 'cash';
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  specialRequests: string;
}

export default function BookingPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [availability, setAvailability] = useState<any>(null);
  const [pendingBooking, setPendingBooking] = useState(false);
  
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    paymentMethod: 'credit_card',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    specialRequests: ''
  });

  // Auth guard + Load query parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Kiểm tra đăng nhập
      const token = localStorage.getItem('token');
      if (!token) {
        const currentUrl = window.location.pathname + window.location.search;
        router.replace(`/login?redirect=${encodeURIComponent(currentUrl)}`);
        return;
      }

      // Load query params
      const searchParams = new URLSearchParams(window.location.search);
      const checkIn = searchParams.get('checkIn');
      const checkOut = searchParams.get('checkOut');
      const guests = searchParams.get('guests');
      
      if (checkIn || checkOut || guests) {
        setFormData(prev => ({
          ...prev,
          checkIn: checkIn || prev.checkIn,
          checkOut: checkOut || prev.checkOut,
          guests: guests ? parseInt(guests) : prev.guests
        }));
      }
    }
  }, [router]);

  // Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`${API_URL}/api/rooms/${roomId}`);
        if (res.ok) {
          const data = await res.json();
          setRoom(data);
        }
      } catch (error) {
        console.error('Error fetching room:', error);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  // Check availability when dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.checkIn || !formData.checkOut || !roomId) return;

      try {
        const checkIn = new Date(formData.checkIn).toISOString();
        const checkOut = new Date(formData.checkOut).toISOString();
        
        const res = await fetch(
          `${API_URL}/api/bookings/availability?room_id=${roomId}&check_in_date=${checkIn}&check_out_date=${checkOut}`
        );
        
        if (res.ok) {
          const data = await res.json();
          setAvailability(data);
        }
      } catch (error) {
        console.error('Error checking availability:', error);
      }
    };

    checkAvailability();
  }, [formData.checkIn, formData.checkOut, roomId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const calculateTotal = () => {
    if (availability && availability.total_price) {
      return availability.total_price;
    }
    return room ? room.base_price * calculateNights() : 0;
  };

  // Hàm refresh token
  const refreshToken = async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) return null;
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token })
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
        return data.access_token;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.checkIn || !formData.checkOut) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.paymentMethod === 'credit_card') {
      if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
        alert('Vui lòng điền đầy đủ thông tin thẻ');
        return;
      }
    }

    if (availability && !availability.available) {
      alert('Phòng không còn trống trong thời gian này. Vui lòng chọn ngày khác.');
      return;
    }

    // Nếu thanh toán bằng thẻ → hiện QR code trước
    if (formData.paymentMethod === 'credit_card') {
      setShowQRModal(true);
      return;
    }

    // Thanh toán tại quầy → xử lý ngay
    await processBooking();
  };

  // Hàm xử lý đặt phòng thực sự (gọi sau khi xác nhận QR hoặc thanh toán tiền mặt)
  const processBooking = async () => {
    // Kiểm tra token
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để đặt phòng');
      window.location.href = '/login';
      return;
    }

    setSubmitting(true);
    try {
      // Create booking
      const bookingPayload = {
        hotel_id: room?.hotel_id,
        room_id: parseInt(roomId),
        check_in_date: new Date(formData.checkIn).toISOString(),
        check_out_date: new Date(formData.checkOut).toISOString(),
        guests: formData.guests,
        special_requests: formData.specialRequests || null
      };

      let accessToken = token;
      let headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      };

      let bookingRes = await fetch(`${API_URL}/api/bookings/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingPayload)
      });

      if (bookingRes.status === 401) {
        // Thử refresh token
        const newToken = await refreshToken();
        if (newToken) {
          accessToken = newToken;
          headers['Authorization'] = `Bearer ${accessToken}`;
          bookingRes = await fetch(`${API_URL}/api/bookings/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(bookingPayload)
          });
        }
        if (bookingRes.status === 401) {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          window.location.href = '/login';
          return;
        }
      }

      if (!bookingRes.ok) {
        const error = await bookingRes.json();
        throw new Error(error.detail || 'Không thể tạo đặt phòng');
      }

      const bookingData = await bookingRes.json();

      // Create payment if credit card
      if (formData.paymentMethod === 'credit_card') {
        const paymentPayload = {
          booking_id: bookingData.id,
          amount: calculateTotal(),
          currency: 'VND',
          payment_method: 'credit_card',
          payment_metadata: {
            card_last_4: formData.cardNumber.slice(-4),
            card_name: formData.cardName
          }
        };

        let paymentRes = await fetch(`${API_URL}/api/bookings/payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(paymentPayload)
        });
        if (paymentRes.status === 401) {
          // Thử refresh token
          const newToken = await refreshToken();
          if (newToken) {
            accessToken = newToken;
            paymentRes = await fetch(`${API_URL}/api/bookings/payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify(paymentPayload)
            });
          }
          if (paymentRes.status === 401) {
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            window.location.href = '/login';
            return;
          }
        }
        if (!paymentRes.ok) {
          const error = await paymentRes.json();
          throw new Error(error.detail || 'Thanh toán thất bại');
        }
      }

      setShowQRModal(false);
      setBookingId(bookingData.id.toString());
      setShowSuccess(true);

    } catch (error: any) {
      alert(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      console.error('Booking error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navbar variant="dark" />
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin phòng...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar variant="dark" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center p-8">
            <p className="text-gray-600 text-lg mb-4">Không tìm thấy phòng</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <Navbar variant="dark" />
        <div className="flex items-center justify-center min-h-[80vh] p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Đặt phòng thành công!</h2>
            <p className="text-gray-600 mb-6">
              {formData.paymentMethod === 'credit_card' 
                ? 'Thanh toán của bạn đã được xác nhận.'
                : 'Vui lòng thanh toán tại quầy lễ tân khi nhận phòng.'}
            </p>

            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 text-left space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-semibold">Mã đặt phòng:</span>
                <span className="text-blue-600 font-bold">#BK{bookingId}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-semibold">Khách hàng:</span>
                <span className="text-gray-900 font-medium truncate ml-2">{formData.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-semibold">Loại phòng:</span>
                <span className="text-gray-900 font-medium truncate ml-2">{room.room_type}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-semibold">Nhận phòng:</span>
                <span className="text-gray-900 font-medium">{new Date(formData.checkIn).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-semibold">Trả phòng:</span>
                <span className="text-gray-900 font-medium">{new Date(formData.checkOut).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-semibold">Số đêm:</span>
                <span className="text-gray-900 font-bold">{calculateNights()} đêm</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-semibold">Phương thức:</span>
                <span className="text-gray-900 font-medium">{formData.paymentMethod === 'credit_card' ? 'Thẻ tín dụng' : 'Tiền mặt'}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-3 border-t border-gray-200">
                <span className="text-gray-700 font-bold">Tổng tiền:</span>
                <span className="text-orange-600 font-bold text-base">{calculateTotal().toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Về trang chủ
              </button>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  router.push(`/rooms/${roomId}`);
                }}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Xem chi tiết phòng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navbar variant="dark" />

      {/* =====================================================
          QR CODE MODAL - Hiện khi chọn thanh toán bằng thẻ
          ===================================================== */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Thanh toán chuyển khoản</h3>
              <p className="text-sm text-gray-500 mt-1">Quét mã QR để hoàn tất thanh toán</p>
            </div>

            {/* Số tiền */}
            <div className="bg-orange-50 rounded-xl py-3 px-4 mb-4">
              <p className="text-sm text-gray-500 mb-1">Số tiền cần thanh toán</p>
              <p className="text-2xl font-bold text-orange-600">{calculateTotal().toLocaleString('vi-VN')}đ</p>
            </div>

            {/* ================================================
                QR CODE IMAGE
                ------------------------------------------------
                Để thay thế QR code của bạn:
                Cách 1 (file local): Đặt ảnh QR vào thư mục
                  frontend/public/qr-payment.png
                  rồi đổi src thành: src="/qr-payment.png"
                Cách 2 (URL online): Thay src thành đường link
                  ảnh QR của bạn, ví dụ:
                  src="https://img.vietqr.io/image/..."
                ================================================ */}
            <div className="flex justify-center mb-4">
              <div className="border-4 border-gray-200 rounded-xl p-2 bg-white shadow-inner">
                <img
                  src="/qr-payment.png"
                  alt="QR Code thanh toán"
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    /* Nếu chưa có ảnh, hiện placeholder */
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = target.nextElementSibling as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
                {/* Placeholder hiện khi chưa có ảnh QR */}
                <div className="w-48 h-48 bg-gray-100 rounded-lg hidden flex-col items-center justify-center text-center p-4">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-xs text-gray-500 font-medium">Đặt ảnh QR code vào</p>
                  <p className="text-xs text-orange-500 font-bold mt-1">public/qr-payment.png</p>
                </div>
              </div>
            </div>

            {/* Hướng dẫn */}
            <div className="bg-blue-50 rounded-lg p-3 mb-5 text-left text-xs text-blue-700 space-y-1">
              <p className="font-semibold text-blue-800 mb-1">Hướng dẫn thanh toán:</p>
              <p>1. Mở app ngân hàng và quét mã QR</p>
              <p>2. Nhập đúng số tiền <strong>{calculateTotal().toLocaleString('vi-VN')}đ</strong></p>
              <p>3. Nội dung chuyển khoản: <strong>Đặt phòng {formData.name}</strong></p>
              <p>4. Nhấn "Xác nhận đã thanh toán" sau khi chuyển xong</p>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => processBooking()}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 shadow-lg"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : 'Xác nhận đã thanh toán'}
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                disabled={submitting}
                className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition text-sm disabled:opacity-50"
              >
                Hủy, quay lại
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Xác nhận đặt phòng</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
              <div className="flex items-start gap-4 mb-6">
                {room.images && room.images[0] && (
                  <img src={room.images[0]} alt={room.name} className="w-28 h-20 object-cover rounded-lg shadow-md" />
                )}
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{room.name}</h2>
                  <p className="text-sm text-gray-600">{room.room_type} • Tối đa {room.max_guests} khách</p>
                  <p className="mt-2 text-xl font-semibold text-orange-600">{room.base_price.toLocaleString('vi-VN')}đ <span className="text-sm font-medium text-gray-500">/ đêm</span></p>
                </div>
              </div>

              <section className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Thông tin khách hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Họ và tên" className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium placeholder-gray-500 bg-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none" />
                  <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium placeholder-gray-500 bg-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none" />
                  <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Số điện thoại" className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium placeholder-gray-500 bg-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none" />
                  <select name="guests" value={formData.guests} onChange={handleInputChange} className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium bg-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none">
                    {Array.from({ length: room.max_guests }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} người</option>
                    ))}
                  </select>
                </div>
              </section>

              <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Ngày nhận</label>
                  <input name="checkIn" type="date" value={formData.checkIn} onChange={handleInputChange} className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium bg-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Ngày trả</label>
                  <input name="checkOut" type="date" value={formData.checkOut} onChange={handleInputChange} className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium bg-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none" />
                </div>
              </section>

              <section className="mb-6">
                <label className="text-sm font-semibold text-gray-700">Yêu cầu đặc biệt</label>
                <textarea name="specialRequests" rows={3} value={formData.specialRequests} onChange={handleInputChange} className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium placeholder-gray-500 bg-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none" placeholder="Ghi chú..." />
              </section>

              <section className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Phương thức thanh toán</h3>
                <div className="flex gap-3">
                  <button onClick={() => setFormData({...formData, paymentMethod: 'credit_card'})} className={`px-4 py-3 rounded-lg w-full border font-semibold text-gray-800 ${formData.paymentMethod === 'credit_card' ? 'bg-white shadow-md border-orange-400 text-orange-600' : 'bg-gray-50 border-gray-300 text-gray-700'}`}>
                    Thẻ tín dụng
                  </button>
                  <button onClick={() => setFormData({...formData, paymentMethod: 'cash'})} className={`px-4 py-3 rounded-lg w-full border font-semibold ${formData.paymentMethod === 'cash' ? 'bg-white shadow-md border-orange-400 text-orange-600' : 'bg-gray-50 border-gray-300 text-gray-700'}`}>
                    Thanh toán tại quầy
                  </button>
                </div>

                {formData.paymentMethod === 'credit_card' && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} placeholder="Số thẻ" className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium placeholder-gray-500 bg-white focus:ring-2 focus:ring-orange-400 outline-none" />
                    <input name="cardName" value={formData.cardName} onChange={handleInputChange} placeholder="Tên trên thẻ" className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium placeholder-gray-500 bg-white focus:ring-2 focus:ring-orange-400 outline-none" />
                    <input name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} placeholder="MM/YY" className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium placeholder-gray-500 bg-white focus:ring-2 focus:ring-orange-400 outline-none" />
                    <input name="cvv" value={formData.cvv} onChange={handleInputChange} placeholder="CVV" className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium placeholder-gray-500 bg-white focus:ring-2 focus:ring-orange-400 outline-none" />
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Right: Summary Card */}
          <aside className="lg:col-span-5">
            <div className="sticky top-28">
              <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/40 p-6">
                <h4 className="text-sm text-gray-500 uppercase tracking-wider">Chi tiết đặt phòng</h4>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Phòng</span>
                    <span className="text-sm font-medium text-gray-900">{room.room_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Số đêm</span>
                    <span className="text-sm font-medium text-gray-900">{calculateNights()} đêm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Giá / đêm</span>
                    <span className="text-sm font-medium text-gray-900">{room.base_price.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {availability && availability.discount_rate > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá</span>
                      <span>-{((availability.total_price_before_discount || 0) - (availability.total_price || 0)).toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tổng cộng</span>
                    <span className="text-2xl font-bold text-orange-600">{calculateTotal().toLocaleString('vi-VN')}đ</span>
                  </div>
                  {availability && (
                    <p className={`text-sm ${availability.available ? 'text-green-600' : 'text-red-600'}`}>
                      {availability.available ? 'Phòng còn trống' : 'Phòng không khả dụng'}
                    </p>
                  )}
                </div>

                <button onClick={handleSubmit} disabled={submitting || (availability && !availability.available)} className="mt-6 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:scale-[1.01] transition">
                  {submitting ? 'Đang xử lý...' : formData.paymentMethod === 'credit_card' ? 'Thanh toán ngay' : 'Xác nhận đặt phòng'}
                </button>

                <button onClick={() => router.push(`/rooms/${roomId}`)} className="mt-3 w-full border border-gray-200 py-2 rounded-lg text-sm text-gray-700">Xem chi tiết phòng</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
