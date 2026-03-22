'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreditCard, Banknote, CheckCircle, Calendar, Users, Hotel, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { API_URL } from '@/lib/api';
import { getRoomImageUrl, getRoomLocalFallback } from '@/lib/imageUtils';

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
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [availability, setAvailability] = useState<any>(null);
  
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

  const getAccessToken = () => {
    return localStorage.getItem('access_token') || localStorage.getItem('token');
  };

  // Load query parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
  }, []);

  // Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`${API_URL}/api/rooms/${roomId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setRoomNotFound(true);
          }
          return;
        }

        const data = await res.json();
        setRoom(data);
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
      if (!formData.checkIn || !formData.checkOut || !roomId || !room || roomNotFound) return;

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
  }, [formData.checkIn, formData.checkOut, roomId, room, roomNotFound]);

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
        localStorage.setItem('access_token', data.access_token);
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

    // Kiểm tra token trước khi gửi request
    const token = getAccessToken();
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
            card_name: formData.cardName,
            customer_email: formData.email,
            customer_name: formData.name,
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
            <p className="text-gray-600 text-lg mb-2">Không tìm thấy phòng</p>
            {roomNotFound && (
              <p className="text-sm text-gray-500 mb-4">Phòng #{roomId} không tồn tại trong dữ liệu hiện tại.</p>
            )}
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

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <strong>Mã đặt phòng:</strong>
                <span className="text-blue-600 font-semibold">#BK{bookingId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <strong>Khách hàng:</strong>
                <span className="truncate ml-2">{formData.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <strong>Loại phòng:</strong>
                <span className="truncate ml-2">{room.room_type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <strong>Nhận phòng:</strong>
                <span>{new Date(formData.checkIn).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <strong>Trả phòng:</strong>
                <span>{new Date(formData.checkOut).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <strong>Số đêm:</strong>
                <span className="font-semibold">{calculateNights()} đêm</span>
              </div>
              <div className="flex justify-between text-sm">
                <strong>Phương thức:</strong>
                <span className="text-xs">{formData.paymentMethod === 'credit_card' ? 'Thẻ tín dụng' : 'Tiền mặt'}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <strong>Tổng tiền:</strong>
                <span className="text-blue-600 font-bold">{calculateTotal().toLocaleString('vi-VN')}đ</span>
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
    <div className="min-h-screen bg-slate-50">
      <Navbar variant="dark" />

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-[#0f4a73] via-[#155785] to-[#1e6b9d] p-6 text-white md:p-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center rounded-full border border-white/35 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </button>
            <div className="hidden items-center gap-2 text-xs font-medium md:flex">
              <span className="rounded-full bg-white/20 px-3 py-1">1. Dien thong tin</span>
              <span className="rounded-full bg-white/20 px-3 py-1">2. Xac nhan lich</span>
              <span className="rounded-full bg-white/20 px-3 py-1">3. Thanh toan</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold md:text-4xl">Hoan tat dat phong</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/85 md:text-base">
            Kiem tra thong tin khach hang, lich luu tru va phuong thuc thanh toan de xac nhan phong trong vai phut.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:p-7">
              <div className="mb-7 flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center">
                <img
                  src={getRoomImageUrl(room.images?.[0] || '')}
                  alt={room.name}
                  className="h-24 w-full rounded-xl object-cover shadow-sm sm:w-40"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getRoomLocalFallback(room.id);
                  }}
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phong da chon</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{room.name}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Hotel className="h-4 w-4" />
                      {room.room_type}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Toi da {room.max_guests} khach
                    </span>
                  </div>
                </div>
              </div>

              <section className="mb-7">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Thong tin khach hang</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Ho va ten" className="rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
                  <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
                  <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="So dien thoai" className="rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
                  <select name="guests" value={formData.guests} onChange={handleInputChange} className="rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100">
                    {Array.from({ length: room.max_guests }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>{num} nguoi</option>
                    ))}
                  </select>
                </div>
              </section>

              <section className="mb-7">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Lich luu tru</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 px-4 py-3">
                    <label className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <Calendar className="h-4 w-4" /> Ngay nhan phong
                    </label>
                    <input name="checkIn" type="date" value={formData.checkIn} onChange={handleInputChange} className="w-full border-0 p-0 text-slate-800 outline-none" />
                  </div>
                  <div className="rounded-xl border border-slate-200 px-4 py-3">
                    <label className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <Calendar className="h-4 w-4" /> Ngay tra phong
                    </label>
                    <input name="checkOut" type="date" value={formData.checkOut} onChange={handleInputChange} className="w-full border-0 p-0 text-slate-800 outline-none" />
                  </div>
                </div>
              </section>

              <section className="mb-7">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Yeu cau dac biet</h3>
                <textarea
                  name="specialRequests"
                  rows={4}
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  placeholder="Vi du: nhan phong som, phong tang cao, khong hut thuoc..."
                />
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Phuong thuc thanh toan</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'credit_card' })}
                    className={`rounded-xl border p-4 text-left transition ${
                      formData.paymentMethod === 'credit_card'
                        ? 'border-sky-300 bg-sky-50 ring-2 ring-sky-100'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <CreditCard className="h-4 w-4" /> The tin dung
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Thanh toan ngay de giu phong</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                    className={`rounded-xl border p-4 text-left transition ${
                      formData.paymentMethod === 'cash'
                        ? 'border-sky-300 bg-sky-50 ring-2 ring-sky-100'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Banknote className="h-4 w-4" /> Thanh toan tai quay
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Thanh toan khi nhan phong</p>
                  </button>
                </div>

                {formData.paymentMethod === 'credit_card' && (
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} placeholder="So the" className="rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
                    <input name="cardName" value={formData.cardName} onChange={handleInputChange} placeholder="Ten tren the" className="rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
                    <input name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} placeholder="MM/YY" className="rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
                    <input name="cvv" value={formData.cvv} onChange={handleInputChange} placeholder="CVV" className="rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Right: Summary Card */}
          <aside className="lg:col-span-5">
            <div className="sticky top-28 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Booking Summary</h4>

                <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Hang phong</span>
                    <span className="font-medium text-slate-900">{room.room_type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">So dem</span>
                    <span className="font-medium text-slate-900">{calculateNights()} dem</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Gia moi dem</span>
                    <span className="font-medium text-slate-900">{room.base_price.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {availability && availability.discount_rate > 0 && (
                    <div className="flex items-center justify-between text-sm text-emerald-600">
                      <span>Uu dai</span>
                      <span>-{((availability.total_price_before_discount || 0) - (availability.total_price || 0)).toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t border-slate-200 pt-4">
                  <div className="flex items-end justify-between">
                    <span className="text-slate-600">Tong thanh toan</span>
                    <span className="text-3xl font-bold text-orange-600">{calculateTotal().toLocaleString('vi-VN')}đ</span>
                  </div>
                  {availability && (
                    <p className={`mt-2 text-sm font-medium ${availability.available ? 'text-emerald-600' : 'text-red-600'}`}>
                      {availability.available ? 'Phong dang kha dung' : 'Phong khong kha dung'}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || (availability && !availability.available)}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Dang xu ly...' : formData.paymentMethod === 'credit_card' ? 'Thanh toan ngay' : 'Xac nhan dat phong'}
                </button>

                <button
                  onClick={() => router.push(`/rooms/${roomId}`)}
                  className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Xem chi tiet phong
                </button>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4 text-sm text-sky-900">
                <p className="font-semibold">Luu y ve dat phong</p>
                <ul className="mt-2 space-y-1 text-sky-800/90">
                  <li>Check-in sau 14:00, check-out truoc 12:00.</li>
                  <li>Gia da bao gom thue va phi dich vu co ban.</li>
                  <li>Thong tin thanh toan duoc ma hoa va bao mat.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
