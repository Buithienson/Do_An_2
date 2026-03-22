// File: frontend/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { getRoomImageUrl, getRoomLocalFallback } from '@/lib/imageUtils';

interface Room {
  id: number;
  name: string;
  room_type: string;
  base_price: number;
  hotel_id: number;
  images?: string[];
  amenities?: string[];
}

function getRoomMeta(room: Room): { bed: string; area: string; view: string } {
  const text = `${room.name} ${(room.amenities || []).join(' ')}`.toLowerCase();
  let bed = 'King Bed';
  if (text.includes('twin')) bed = 'Twin Beds';
  else if (text.includes('double')) bed = 'Double Bed';

  let area = '45 m²';
  if (text.includes('suite')) area = '80 m²';
  else if (text.includes('villa')) area = '130 m²';
  else if (text.includes('deluxe')) area = '51 m²';
  else if (text.includes('superior')) area = '40 m²';

  let view = 'Hướng vườn';
  if (text.includes('ocean') || text.includes('sea') || text.includes('beach')) view = 'Hướng biển';
  else if (text.includes('city')) view = 'Hướng phố';

  return { bed, area, view };
}

// ── Destinations Data ─────────────────────────────────────────────────────────
const DESTINATIONS = [
  {
    name: 'Hạ Long Bay',
    slug: 'Hạ Long',
    desc: 'Du thuyền hoàng hôn, vịnh di sản thế giới',
    tags: ['Vịnh biển', 'Gia đình', 'Couple'],
    badge: 'Top 1 tuần này',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop',
  },
  {
    name: 'Sapa',
    slug: 'Sapa',
    desc: 'Săn mây – ruộng bậc thang hùng vĩ',
    tags: ['Núi cao', 'Phiêu lưu'],
    img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2128&auto=format&fit=crop',
  },
  {
    name: 'Phú Quốc',
    slug: 'Phú Quốc',
    desc: 'Đảo ngọc – thiên đường nghỉ dưỡng',
    tags: ['Biển đảo', 'Resort'],
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
  },
  {
    name: 'Đà Nẵng',
    slug: 'Đà Nẵng',
    desc: 'Biển xanh – thành phố năng động',
    tags: ['Biển', 'Check-in'],
    img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=900&auto=format&fit=crop&crop=entropy',
  },
  {
    name: 'Hội An',
    slug: 'Hội An',
    desc: 'Phố cổ đèn lồng – di sản văn hóa',
    tags: ['Văn hóa', 'Ẩm thực'],
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop',
  },
  {
    name: 'Đà Lạt',
    slug: 'Đà Lạt',
    desc: 'Thành phố ngàn hoa – se lạnh quanh năm',
    tags: ['Cao nguyên', 'Lãng mạn'],
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop',
  },
  {
    name: 'Nha Trang',
    slug: 'Nha Trang',
    desc: 'Biển xanh cát trắng – lặn san hô',
    tags: ['Biển', 'Lặn biển'],
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop',
  },
  {
    name: 'Vũng Tàu',
    slug: 'Vũng Tàu',
    desc: 'Gần Sài Gòn – biển cuối tuần lý tưởng',
    tags: ['Biển', 'Cuối tuần'],
    img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=2070&auto=format&fit=crop',
  },
  {
    name: 'Huế',
    slug: 'Huế',
    desc: 'Kinh đô xưa – ẩm thực cung đình',
    tags: ['Lịch sử', 'Ẩm thực'],
    img: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?q=80&w=2070&auto=format&fit=crop',
  },
];

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${API_URL}/api/rooms/?limit=8`);
        if (!res.ok) throw new Error('Failed');
        setRooms(await res.json());
      } catch {
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ────────────────────────────────────────────────── */}
      <div className="relative h-screen w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />
        <Navbar />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
          <h1 className="mb-6 text-5xl md:text-7xl font-serif font-bold text-white leading-tight drop-shadow-2xl">
            Đánh Thức <br />
            <span className="text-orange-400 italic">Hành Trình</span> Trong Mơ
          </h1>
          <p className="mb-10 text-lg md:text-xl text-gray-200 max-w-2xl drop-shadow-lg font-light">
            Mở khóa những điểm đến tuyệt vời nhất với hơn 1 triệu lựa chọn nghỉ dưỡng được cá nhân hóa bởi AI.
          </p>
          <SearchBar />
        </div>
      </div>

      {/* ── DESTINATIONS ────────────────────────────────────────── */}
      <section className="w-full px-6 md:px-12 lg:px-20 py-20 bg-white">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-1 block text-sm font-bold uppercase tracking-wider text-orange-500">Khám phá</span>
            <h2 className="text-4xl font-serif font-bold text-gray-900">Điểm Đến Hot Hè 2026</h2>
            <p className="mt-2 text-gray-500 max-w-xl">
              Từ biển đảo, cao nguyên đến phố cổ – những điểm đến được tìm kiếm nhiều nhất mùa hè này.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700">
              🌤 Mùa đẹp: Tháng 5–8
            </span>
            <span className="rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700">
              🎁 Ưu đãi đến 25%
            </span>
            <Link
              href="/search"
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-900 hover:text-gray-900 transition"
            >
              Xem toàn bộ →
            </Link>
          </div>
        </div>

        {/* Featured (top row): Large card + 2 small cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {/* Big card – Hạ Long */}
          <div className="md:col-span-1 h-[420px]">
            <Link
              href={`/search?location=${encodeURIComponent(DESTINATIONS[0].slug)}`}
              className="group relative h-full w-full overflow-hidden rounded-3xl shadow-lg block"
            >
              <img
                src={DESTINATIONS[0].img}
                alt={DESTINATIONS[0].name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {DESTINATIONS[0].badge && (
                <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-900 shadow">
                  {DESTINATIONS[0].badge}
                </div>
              )}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-3xl font-bold">{DESTINATIONS[0].name}</h3>
                <p className="mt-1 text-gray-200 text-sm">{DESTINATIONS[0].desc}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                  {DESTINATIONS[0].tags.map((t) => (
                    <span key={t} className="rounded-full bg-white/20 px-3 py-1">{t}</span>
                  ))}
                </div>
              </div>
            </Link>
          </div>

          {/* 2 medium cards stacked */}
          <div className="md:col-span-1 flex flex-col gap-5 h-[420px]">
            {DESTINATIONS.slice(1, 3).map((dest) => (
              <Link
                key={dest.slug}
                href={`/search?location=${encodeURIComponent(dest.slug)}`}
                className="group relative flex-1 overflow-hidden rounded-3xl shadow-lg block"
              >
                <img
                  src={dest.img}
                  alt={dest.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-5 text-white">
                  <h3 className="text-xl font-bold">{dest.name}</h3>
                  <p className="text-gray-300 text-xs mt-0.5">{dest.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* 2 medium cards stacked */}
          <div className="md:col-span-1 flex flex-col gap-5 h-[420px]">
            {DESTINATIONS.slice(3, 5).map((dest) => (
              <Link
                key={dest.slug}
                href={`/search?location=${encodeURIComponent(dest.slug)}`}
                className="group relative flex-1 overflow-hidden rounded-3xl shadow-lg block"
              >
                <img
                  src={dest.img}
                  alt={dest.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-5 text-white">
                  <h3 className="text-xl font-bold">{dest.name}</h3>
                  <p className="text-gray-300 text-xs mt-0.5">{dest.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Second row: 4 equal small cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {DESTINATIONS.slice(5, 9).map((dest) => (
            <Link
              key={dest.slug}
              href={`/search?location=${encodeURIComponent(dest.slug)}`}
              className="group relative h-[200px] overflow-hidden rounded-2xl shadow-md block"
            >
              <img
                src={dest.img}
                alt={dest.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-bold leading-tight">{dest.name}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {dest.tags.map((t) => (
                    <span key={t} className="text-[10px] bg-white/20 rounded-full px-2 py-0.5">{t}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── ROOMS ───────────────────────────────────────────────── */}
      <section className="w-full px-6 md:px-12 lg:px-20 py-20 bg-gray-50">
        <div className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#0f4a73]">ROOM COLLECTION</p>
          <h2 className="mt-2 text-4xl font-serif font-bold text-gray-900">Hạng Phòng</h2>
          <p className="mt-2 text-gray-500">Thiết kế tinh tế – lựa chọn hoàn hảo cho mọi hành trình</p>
        </div>

        {roomsLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f4a73]" />
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {rooms.slice(0, 8).map((room) => {
              const meta = getRoomMeta(room);
              return (
                <Link
                  key={room.id}
                  href={`/rooms/${room.id}`}
                  className="group flex flex-col bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img
                      src={getRoomImageUrl(room.images?.[0] || '')}
                      alt={room.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getRoomLocalFallback(room.id);
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-white/90 text-orange-600 text-xs font-bold rounded-full px-3 py-1 shadow">
                      {room.base_price?.toLocaleString('vi-VN')}₫/đêm
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col p-4">
                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1">{room.name}</h3>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                      <span>🛏 {meta.bed}</span>
                      <span>📐 {meta.area}</span>
                      <span>👁 {meta.view}</span>
                    </div>
                    <span className="mt-auto inline-flex items-center justify-center text-sm font-semibold text-white bg-[#0f4a73] rounded-xl px-4 py-2 hover:bg-[#1766a6] transition">
                      Xem chi tiết →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-12 text-center text-gray-400 shadow">
            Không có phòng nào.
          </div>
        )}

        <div className="flex justify-center mt-10">
          <Link
            href="/search"
            className="inline-flex items-center text-sm font-bold text-[#0f4a73] border-2 border-[#0f4a73] rounded-full px-8 py-3 hover:bg-[#0f4a73] hover:text-white transition-all duration-200"
          >
            Xem tất cả phòng →
          </Link>
        </div>
      </section>

      {/* ── WHY CHOOSE US ───────────────────────────────────────── */}
      <section className="w-full px-6 md:px-12 lg:px-20 py-20 bg-white">
        <div className="text-center mb-12">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-500">Tại sao chọn chúng tôi</p>
          <h2 className="mt-2 text-4xl font-serif font-bold text-gray-900">Cam Kết Của BookingAI</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '🏷️',
              bg: 'bg-orange-50',
              title: 'Giá Tốt Nhất',
              desc: 'Cam kết giá cạnh tranh nhất thị trường. Chúng tôi sẽ khớp giá nếu bạn tìm thấy nơi nào rẻ hơn.',
            },
            {
              icon: '🤖',
              bg: 'bg-blue-50',
              title: 'AI Gợi Ý Thông Minh',
              desc: 'Công nghệ AI phân tích sở thích để tìm ra căn phòng "chân ái" dành riêng cho bạn chỉ trong tích tắc.',
            },
            {
              icon: '🛡️',
              bg: 'bg-green-50',
              title: 'Đặt Phòng An Toàn',
              desc: 'Bảo mật thông tin tuyệt đối. Hỗ trợ hoàn hủy linh hoạt giúp bạn yên tâm lên kế hoạch.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group flex flex-col items-center text-center p-8 rounded-3xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-20 h-20 ${item.bg} rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="w-full bg-gray-900 text-white py-12 px-6 md:px-12 lg:px-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-2xl font-bold">
              Booking<span className="text-orange-500">AI</span>
            </span>
            <p className="text-gray-500 text-sm mt-1">© 2026 All rights reserved.</p>
          </div>
          <div className="flex gap-8 text-gray-400 text-sm">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Cookie Settings</a>
          </div>
        </div>
      </footer>

    </main>
  );
}
