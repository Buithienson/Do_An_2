'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { TrendingUp, BedDouble, Users, BarChart2, RefreshCw } from 'lucide-react';

interface MonthlyRevenue {
  month: number;
  year: number;
  revenue: number;
  bookings: number;
}

interface RevenueData {
  year: number;
  total_revenue: number;
  monthly: MonthlyRevenue[];
}

interface TopRoom {
  room_id: number;
  room_name: string;
  room_type: string;
  base_price: number;
  hotel_name: string;
  booking_count: number;
  total_revenue: number;
}

interface TopCustomer {
  user_id: number;
  full_name: string;
  email: string;
  booking_count: number;
  total_spent: number;
}

const MONTH_NAMES = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

export default function AdminReportsPage() {
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [topRooms, setTopRooms] = useState<TopRoom[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [revRes, roomsRes, custRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/reports/revenue?year=${year}`, { headers }),
        fetch(`${apiUrl}/api/admin/reports/top-rooms?limit=5`, { headers }),
        fetch(`${apiUrl}/api/admin/reports/top-customers?limit=5`, { headers }),
      ]);
      if (!revRes.ok || !roomsRes.ok || !custRes.ok) throw new Error('Không thể tải báo cáo');
      const [revData, roomsData, custData] = await Promise.all([
        revRes.json(), roomsRes.json(), custRes.json(),
      ]);
      setRevenue(revData);
      setTopRooms(roomsData);
      setTopCustomers(custData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [year]);

  const formatMoney = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  const maxRevenue = revenue ? Math.max(...revenue.monthly.map(m => m.revenue), 1) : 1;

  return (
    <AdminLayout title="Báo cáo Doanh thu">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Báo cáo & Thống kê</h2>
            <p className="text-gray-500 text-sm mt-1">Doanh thu, top phòng và khách hàng thân thiết</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={fetchAll}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
              title="Tải lại"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>
        )}

        {/* Summary cards */}
        {revenue && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                <TrendingUp size={22} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng doanh thu {year}</p>
                <p className="text-xl font-bold text-gray-800">{formatMoney(revenue.total_revenue)}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <BarChart2 size={22} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng đơn đã thanh toán</p>
                <p className="text-xl font-bold text-gray-800">{revenue.monthly.reduce((s, m) => s + m.bookings, 0)}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <TrendingUp size={22} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Doanh thu TB / tháng</p>
                <p className="text-xl font-bold text-gray-800">
                  {formatMoney(revenue.total_revenue / 12)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bar Chart - Revenue by month */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart2 size={20} className="text-orange-500" />
            Doanh thu theo tháng — {year}
          </h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-400">Đang tải...</div>
          ) : revenue ? (
            <div className="space-y-3">
              {revenue.monthly.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500 w-6 text-right">{MONTH_NAMES[m.month - 1]}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500 flex items-center px-2"
                      style={{ width: `${Math.max((m.revenue / maxRevenue) * 100, m.revenue > 0 ? 2 : 0)}%` }}
                    >
                      {m.revenue > 0 && (
                        <span className="text-white text-xs font-semibold whitespace-nowrap hidden sm:block">
                          {m.bookings} đơn
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-36 text-right whitespace-nowrap">
                    {m.revenue > 0 ? formatMoney(m.revenue) : '—'}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Rooms */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BedDouble size={20} className="text-purple-500" />
              Top 5 Phòng được đặt nhiều nhất
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : topRooms.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {topRooms.map((r, i) => (
                  <div key={r.room_id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-gray-300'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{r.room_name}</p>
                      <p className="text-xs text-gray-500 truncate">{r.hotel_name} · {r.room_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-purple-600">{r.booking_count} đặt</p>
                      <p className="text-xs text-gray-400">{formatMoney(r.total_revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={20} className="text-teal-500" />
              Top 5 Khách hàng thân thiết
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : topCustomers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {topCustomers.map((c, i) => (
                  <div key={c.user_id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-gray-300'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{c.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{c.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-teal-600">{c.booking_count} đặt</p>
                      <p className="text-xs text-gray-400">{formatMoney(c.total_spent)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
