'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Hotel, BedDouble, Calendar, TrendingUp, Search, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface AdminHotel {
  id: number;
  name: string;
  city: string;
  address: string;
  star_rating: number | null;
  room_count: number;
  booking_count: number;
  total_revenue: number;
  created_at: string | null;
}

interface AdminRoom {
  id: number;
  name: string;
  room_type: string;
  base_price: number;
  max_guests: number;
  hotel_name: string;
  booking_count: number;
}

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [filtered, setFiltered] = useState<AdminHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [expandedHotel, setExpandedHotel] = useState<number | null>(null);
  const [rooms, setRooms] = useState<Record<number, AdminRoom[]>>({});
  const [loadingRooms, setLoadingRooms] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchHotels = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/admin/hotels?limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Không thể tải danh sách khách sạn');
      const data = await res.json();
      setHotels(data);
      setFiltered(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHotels(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(hotels.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      String(h.id).includes(q)
    ));
  }, [search, hotels]);

  const toggleRooms = async (hotelId: number) => {
    if (expandedHotel === hotelId) {
      setExpandedHotel(null);
      return;
    }
    setExpandedHotel(hotelId);
    if (!rooms[hotelId]) {
      setLoadingRooms(hotelId);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiUrl}/api/admin/rooms?hotel_id=${hotelId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRooms(prev => ({ ...prev, [hotelId]: data }));
        }
      } finally {
        setLoadingRooms(null);
      }
    }
  };

  const formatMoney = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('vi-VN') : '—';

  const renderStars = (n: number | null) => {
    if (!n) return <span className="text-gray-400 text-xs">N/A</span>;
    return <span className="text-yellow-400">{'★'.repeat(n)}<span className="text-gray-300">{'★'.repeat(5 - n)}</span></span>;
  };

  return (
    <AdminLayout title="Quản lý Khách sạn">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Khách sạn & Phòng</h2>
            <p className="text-gray-500 text-sm mt-1">{hotels.length} khách sạn trong hệ thống</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm khách sạn, thành phố..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
              />
            </div>
            <button
              onClick={fetchHotels}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
              title="Tải lại"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Hotel, label: 'Tổng khách sạn', value: hotels.length, color: 'bg-blue-500' },
            { icon: BedDouble, label: 'Tổng phòng', value: hotels.reduce((s, h) => s + h.room_count, 0), color: 'bg-purple-500' },
            { icon: Calendar, label: 'Tổng booking', value: hotels.reduce((s, h) => s + h.booking_count, 0), color: 'bg-green-500' },
            { icon: TrendingUp, label: 'Tổng doanh thu', value: formatMoney(hotels.reduce((s, h) => s + h.total_revenue, 0)), color: 'bg-orange-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-bold text-gray-800 text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>
        )}

        {/* Hotels Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách sạn</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sao</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Số phòng</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doanh thu</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tạo ngày</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(8)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                      Không tìm thấy khách sạn nào
                    </td>
                  </tr>
                ) : (
                  filtered.map((h) => (
                    <>
                      <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-gray-400 font-mono text-xs">#{h.id}</td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-800">{h.name}</p>
                          <p className="text-xs text-gray-400">{h.city}</p>
                        </td>
                        <td className="px-5 py-4">{renderStars(h.star_rating)}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                            <BedDouble size={11} />{h.room_count}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            <Calendar size={11} />{h.booking_count}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-gray-800 whitespace-nowrap">{formatMoney(h.total_revenue)}</td>
                        <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">{formatDate(h.created_at)}</td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => toggleRooms(h.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            {expandedHotel === h.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            Xem phòng
                          </button>
                        </td>
                      </tr>
                      {/* Expanded rooms row */}
                      {expandedHotel === h.id && (
                        <tr key={`${h.id}-rooms`}>
                          <td colSpan={8} className="px-8 py-4 bg-blue-50 border-b border-blue-100">
                            {loadingRooms === h.id ? (
                              <div className="flex items-center gap-2 text-sm text-blue-600">
                                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                Đang tải danh sách phòng...
                              </div>
                            ) : (rooms[h.id] || []).length === 0 ? (
                              <p className="text-sm text-gray-400">Chưa có phòng nào</p>
                            ) : (
                              <div>
                                <p className="text-xs font-semibold text-blue-700 mb-3">Danh sách phòng — {h.name}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {(rooms[h.id] || []).map((r) => (
                                    <div key={r.id} className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <p className="font-semibold text-gray-800 text-sm">{r.name}</p>
                                          <p className="text-xs text-gray-500">{r.room_type} · Tối đa {r.max_guests} khách</p>
                                        </div>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                          {r.booking_count} đặt
                                        </span>
                                      </div>
                                      <p className="text-orange-600 font-bold text-sm mt-2">{formatMoney(r.base_price)}<span className="text-gray-400 font-normal">/đêm</span></p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
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
