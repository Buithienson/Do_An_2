'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Trash2, Search, RefreshCw } from 'lucide-react';

interface AdminBooking {
  id: number;
  user_id: number;
  user_email: string | null;
  user_name: string | null;
  hotel_id: number;
  hotel_name: string | null;
  room_id: number;
  room_name: string | null;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-blue-100 text-blue-700',
};

const PAYMENT_STYLES: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  refunded: 'bg-purple-100 text-purple-700',
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [filtered, setFiltered] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/admin/bookings?limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Không thể tải danh sách booking');
      const data = await res.json();
      setBookings(data);
      setFiltered(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      bookings.filter(
        (b) =>
          (b.user_email?.toLowerCase().includes(q) ?? false) ||
          (b.hotel_name?.toLowerCase().includes(q) ?? false) ||
          String(b.id).includes(q)
      )
    );
  }, [search, bookings]);

  const handleDelete = async (bookingId: number) => {
    if (!confirm(`Xóa booking #${bookingId}? Hành động này không thể hoàn tác.`)) return;
    setDeletingId(bookingId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Xóa thất bại');
      }
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfirmPayment = async (bookingId: number, userEmail: string | null) => {
    if (!confirm(`Xác nhận đã nhận thanh toán cho booking #${bookingId}?\n\nEmail thông báo sẽ được gửi tới: ${userEmail || 'khách hàng'}`)) return;
    setConfirmingId(bookingId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/admin/bookings/${bookingId}/confirm-payment`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Xác nhận thất bại');
      }
      // Cập nhật UI ngay lập tức
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, payment_status: 'paid', status: 'confirmed' } : b
        )
      );
      alert(`Đã xác nhận thanh toán cho booking #${bookingId}\nEmail thông báo đang được gửi tới khách hàng.`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setConfirmingId(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatMoney = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <AdminLayout title="Quản lý Booking">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Danh sách Booking</h2>
            <p className="text-gray-500 text-sm mt-1">{bookings.length} đơn đặt phòng trong hệ thống</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo email, khách sạn, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-72"
              />
            </div>
            <button
              onClick={fetchBookings}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
              title="Tải lại"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách sạn / Phòng</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-out</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thanh toán</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(9)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-gray-400">
                      Không tìm thấy booking nào
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-gray-400 font-mono text-xs">#{b.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800 leading-tight">{b.user_name || '—'}</p>
                        <p className="text-gray-400 text-xs">{b.user_email || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800 leading-tight max-w-[180px] truncate">{b.hotel_name || '—'}</p>
                        <p className="text-gray-400 text-xs truncate max-w-[180px]">{b.room_name || '—'}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{formatDate(b.check_in_date)}</td>
                      <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{formatDate(b.check_out_date)}</td>
                      <td className="px-5 py-4 font-semibold text-gray-800 whitespace-nowrap">{formatMoney(b.total_price)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[b.status] || 'bg-gray-100 text-gray-600'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${PAYMENT_STYLES[b.payment_status] || 'bg-gray-100 text-gray-600'}`}>
                          {b.payment_status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {/* Nút Xác nhận thanh toán - chỉ hiện khi payment đang pending */}
                          {b.payment_status === 'pending' && b.status !== 'cancelled' && (
                            <button
                              onClick={() => handleConfirmPayment(b.id, b.user_email)}
                              disabled={confirmingId === b.id}
                              className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                              title="Xác nhận đã nhận thanh toán"
                            >
                              {confirmingId === b.id ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                '✓'
                              )}
                              <span>{confirmingId === b.id ? 'Đang xử lý...' : 'Xác nhận TT'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(b.id)}
                            disabled={deletingId === b.id}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Xóa booking"
                          >
                            {deletingId === b.id ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
