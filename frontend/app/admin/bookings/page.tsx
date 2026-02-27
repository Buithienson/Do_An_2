'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Trash2, Search, RefreshCw, CheckCircle, Clock } from 'lucide-react';

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
  pending: 'bg-orange-100 text-orange-700',
  refunded: 'bg-purple-100 text-purple-700',
};

type FilterTab = 'all' | 'pending' | 'paid' | 'cancelled';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  // Filter logic
  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      (b.user_email?.toLowerCase().includes(q) ?? false) ||
      (b.hotel_name?.toLowerCase().includes(q) ?? false) ||
      String(b.id).includes(q);

    const matchTab =
      activeTab === 'all' ? true :
      activeTab === 'pending' ? (b.payment_status === 'pending' && b.status !== 'cancelled') :
      activeTab === 'paid' ? b.payment_status === 'paid' :
      activeTab === 'cancelled' ? b.status === 'cancelled' : true;

    return matchSearch && matchTab;
  });

  const pendingCount = bookings.filter(b => b.payment_status === 'pending' && b.status !== 'cancelled').length;

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
    if (!confirm(`Xác nhận đã nhận thanh toán cho booking #${bookingId}?\nEmail thông báo sẽ gửi tới: ${userEmail || 'khách hàng'}`)) return;
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
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, payment_status: 'paid', status: 'confirmed' } : b
        )
      );
      alert(`✅ Đã xác nhận thanh toán booking #${bookingId}\nEmail đã được gửi tới khách hàng.`);
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

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all', label: 'Tất cả', count: bookings.length },
    { key: 'pending', label: '⏳ Chờ thanh toán', count: pendingCount },
    { key: 'paid', label: '✅ Đã thanh toán', count: bookings.filter(b => b.payment_status === 'paid').length },
    { key: 'cancelled', label: '❌ Đã hủy', count: bookings.filter(b => b.status === 'cancelled').length },
  ];

  return (
    <AdminLayout title="Quản lý Booking">
      <div className="space-y-5">
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

        {/* Pending Alert Banner */}
        {pendingCount > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-semibold text-orange-800">
                  Có {pendingCount} đơn đang chờ xác nhận thanh toán!
                </p>
                <p className="text-xs text-orange-600 mt-0.5">
                  Nhấn tab "Chờ thanh toán" để xem và xử lý.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('pending')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
            >
              Xử lý ngay
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
              {count !== undefined && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === key ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
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
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
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
                      {activeTab === 'pending' ? '🎉 Không có đơn nào chờ thanh toán!' : 'Không tìm thấy booking nào'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr
                      key={b.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        b.payment_status === 'pending' && b.status !== 'cancelled' ? 'bg-orange-50/40' : ''
                      }`}
                    >
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
                        <div className="flex items-center gap-2">
                          {/* Nút xác nhận thanh toán */}
                          {b.payment_status === 'pending' && b.status !== 'cancelled' && (
                            <button
                              onClick={() => handleConfirmPayment(b.id, b.user_email)}
                              disabled={confirmingId === b.id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                              title="Xác nhận đã nhận được tiền từ khách"
                            >
                              {confirmingId === b.id ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle size={13} />
                              )}
                              {confirmingId === b.id ? 'Đang xử lý...' : 'Xác nhận TT'}
                            </button>
                          )}
                          {/* Nút xóa */}
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
