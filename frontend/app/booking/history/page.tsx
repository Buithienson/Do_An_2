"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Hotel,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Luggage,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { API_URL } from '@/lib/api';

interface Room {
  id: number;
  name: string;
  room_type: string;
  hotel_id: number;
}

interface Booking {
  id: number;
  user_id: number;
  hotel_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  total_price: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
  room?: Room;
  cancellation_date?: string;
  refund_amount?: number;
  cancellation_reason?: string;
}

export default function BookingHistoryPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      toast.error("Vui lòng đăng nhập để xem lịch sử đặt phòng");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/bookings/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Không thể tải lịch sử đặt phòng");
      }

      const data = await res.json();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
      toast.error(err.message || "Không thể tải lịch sử đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  const calculateRefundInfo = (booking: Booking) => {
    const now = new Date();
    const checkIn = new Date(booking.check_in_date);
    const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilCheckIn > 48) {
      return { percentage: 100, amount: booking.total_price };
    } else if (hoursUntilCheckIn > 24) {
      return { percentage: 50, amount: booking.total_price * 0.5 };
    } else {
      return { percentage: 0, amount: 0 };
    }
  };

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    const token = localStorage.getItem("token");
    setCancellingId(selectedBooking.id);

    try {
      const res = await fetch(`${API_URL}/api/bookings/${selectedBooking.id}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Không thể hủy đặt phòng");
      }

      toast.success("Đã hủy đặt phòng thành công");
      setShowCancelModal(false);
      fetchBookings(); // Refresh list
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi hủy phòng");
    } finally {
      setCancellingId(null);
      setSelectedBooking(null);
    }
  };

  // ... rest of helper functions (getStatusBadge, formatDate, formatPrice) remain the same

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3" />
          Đã hủy
        </span>
      );
    }

    if (paymentStatus === "paid") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          Đã thanh toán
        </span>
      );
    }

    if (status === "confirmed" && paymentStatus === "pending") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <Clock className="w-3 h-3" />
          Chờ thanh toán
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <Clock className="w-3 h-3" />
        {status === "confirmed" ? "Đã xác nhận" : "Đang chờ"}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " VND";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải lịch sử...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - same as before */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Quay lại
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600 rounded-2xl">
            <Luggage className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Lịch sử chuyến đi của bạn
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý và theo dõi các đơn đặt phòng
            </p>
          </div>
        </div>

        {/* Empty State - same as before */}
        {!loading && bookings.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Luggage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Chưa có chuyến đi nào
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa có đơn đặt phòng nào. Hãy bắt đầu khám phá!
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-lg"
            >
              Khám phá ngay
            </button>
          </div>
        )}

        {/* Bookings List with Cancel Button */}
        {bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-500">
                              Mã đặt phòng:
                            </span>
                            <span className="text-blue-600 font-mono font-bold">
                              #BK{booking.id}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Hotel className="w-5 h-5 text-blue-600" />
                            {booking.room?.name || "Thông tin phòng"}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {booking.room?.room_type || "N/A"}
                          </p>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(booking.status, booking.payment_status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Nhận: {formatDate(booking.check_in_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Trả: {formatDate(booking.check_out_date)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section with Cancel Button */}
                    <div className="flex flex-col items-end justify-between gap-4 lg:min-w-[200px]">
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(booking.total_price)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            router.push(`/booking/${booking.room_id}?view=${booking.id}`)
                          }
                          className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
                        >
                          Xem chi tiết
                        </button>
                        {booking.status !== "cancelled" && (
                          <button
                            onClick={() => handleCancelClick(booking)}
                            className="px-6 py-2 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
                          >
                            Hủy phòng
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Đặt ngày: {formatDate(booking.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Xác nhận hủy phòng</h3>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-gray-600">
                  Bạn có chắc chắn muốn hủy đặt phòng <span className="font-bold">#{selectedBooking.id}</span>?
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Chính sách hoàn tiền:</h4>
                  {(() => {
                    const refund = calculateRefundInfo(selectedBooking);
                    return (
                      <div className="text-sm text-blue-800">
                        <p>• Số tiền hoàn lại: <span className="font-bold">{formatPrice(refund.amount)}</span> ({refund.percentage}%)</p>
                        {refund.percentage === 100 && <p className="text-green-700 mt-1">✓ Miễn phí hủy ({">"} 48h trước check-in)</p>}
                        {refund.percentage === 50 && <p className="text-orange-700 mt-1">⚠ Hoàn 50% (24-48h trước check-in)</p>}
                        {refund.percentage === 0 && <p className="text-red-700 mt-1">✗ Không hoàn tiền ({"<"} 24h trước check-in)</p>}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedBooking(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  disabled={cancellingId !== null}
                >
                  Đóng
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={cancellingId !== null}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                >
                  {cancellingId ? "Đang hủy..." : "Xác nhận hủy"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
