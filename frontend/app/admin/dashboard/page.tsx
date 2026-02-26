'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Users, CalendarCheck, Hotel, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface Stats {
  total_users: number;
  total_bookings: number;
  total_hotels: number;
  total_revenue: number;
  pending_bookings: number;
  confirmed_bookings: number;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  sub,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Không thể tải dữ liệu');
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatMoney = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h2>
          <p className="text-gray-500 text-sm mt-1">
            Chào mừng trở lại! Đây là tình trạng hoạt động của hệ thống.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title="Tổng số User"
                value={stats.total_users.toLocaleString()}
                icon={Users}
                color="bg-blue-500"
                sub="Tất cả tài khoản đã đăng ký"
              />
              <StatCard
                title="Tổng số Booking"
                value={stats.total_bookings.toLocaleString()}
                icon={CalendarCheck}
                color="bg-green-500"
                sub="Tổng đơn đặt phòng"
              />
              <StatCard
                title="Tổng số Khách sạn"
                value={stats.total_hotels.toLocaleString()}
                icon={Hotel}
                color="bg-purple-500"
                sub="Khách sạn trong hệ thống"
              />
              <StatCard
                title="Tổng doanh thu"
                value={formatMoney(stats.total_revenue)}
                icon={TrendingUp}
                color="bg-orange-500"
                sub="Doanh thu từ booking đã xác nhận"
              />
              <StatCard
                title="Booking chờ duyệt"
                value={stats.pending_bookings.toLocaleString()}
                icon={Clock}
                color="bg-yellow-500"
                sub="Đang ở trạng thái pending"
              />
              <StatCard
                title="Booking đã xác nhận"
                value={stats.confirmed_bookings.toLocaleString()}
                icon={CheckCircle}
                color="bg-teal-500"
                sub="Đã thanh toán & xác nhận"
              />
            </div>
          )
        )}
      </div>
    </AdminLayout>
  );
}
