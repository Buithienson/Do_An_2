// File: frontend/app/page.tsx
'use client'; // Bắt buộc dòng này để dùng được useEffect (React)

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
  if (text.includes('twin')) {
    bed = 'King Bed hay Twin beds';
  } else if (text.includes('double')) {
    bed = 'Double Bed';
  }

  let area = '45 m2';
  if (text.includes('suite')) {
    area = '80 m2';
  } else if (text.includes('villa')) {
    area = '130 m2';
  } else if (text.includes('deluxe')) {
    area = '51 m2';
  } else if (text.includes('superior')) {
    area = '40 m2';
  }

  let view = 'Huong vuon';
  if (text.includes('ocean') || text.includes('sea') || text.includes('beach')) {
    view = 'Huong bien';
  } else if (text.includes('city')) {
    view = 'Huong pho';
  }

  return { bed, area, view };
}

const ROOM_LAYOUT_CLASSES = [
  'md:col-span-3 md:row-span-2',
  'md:col-span-5 md:row-span-4',
  'md:col-span-2 md:row-span-2',
  'md:col-span-2 md:row-span-2',
  'md:col-span-2 md:row-span-2',
  'md:col-span-2 md:row-span-2',
];

function getRoomLayoutClass(index: number): string {
  return ROOM_LAYOUT_CLASSES[index % ROOM_LAYOUT_CLASSES.length] || 'md:col-span-3 md:row-span-2';
}

export default function Home() {
  // 2. Khai báo các biến trạng thái (State)
  const [currentDestinationSlide, setCurrentDestinationSlide] = useState(0);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  // Fetch rooms cho hang phong section
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${API_URL}/api/rooms/?limit=12`);
        if (!res.ok) throw new Error('Failed to fetch rooms');
        const data = await res.json();
        setRooms(data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      
      {/* --- PHẦN 1: HERO SECTION (Trải nghiệm điện ảnh) --- */}
      <div className="relative h-screen w-full overflow-hidden">
        
        {/* Background Video/Image */}
        <div className="absolute inset-0">
            <div 
                className="absolute inset-0 bg-cover bg-center animate-kenburns" // Thêm animation zoom nhẹ nếu muốn
                style={{ 
                    backgroundImage: "url('https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop')",
                }}
            />
            {/* Lớp phủ Gradient tối điện ảnh */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60"></div>
        </div>

        <Navbar />

        {/* Nội dung chính giữa màn hình */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
            <h1 className="mb-6 text-5xl md:text-7xl font-serif font-bold text-white leading-tight drop-shadow-2xl">
              Đánh Thức <br /> <span className="text-orange-400 italic">Hành Trình</span> Trong Mơ
            </h1>
            <p className="mb-10 text-lg md:text-xl text-gray-200 max-w-2xl drop-shadow-lg font-light">
              Mở khóa những điểm đến tuyệt vời nhất với hơn 1 triệu lựa chọn nghỉ dưỡng được cá nhân hóa bởi AI.
            </p>
            
            {/* Search Component with dynamic cities */}
            <SearchBar />
            
        </div>
      </div>

      {/* --- PHẦN 2: TRENDING DESTINATIONS --- */}
      <section className="mx-auto max-w-7xl px-8 py-24">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="mb-2 block text-sm font-bold uppercase tracking-wider text-orange-500">Khám phá</span>
            <h2 className="text-4xl font-serif font-bold text-gray-900">Điểm Đến Hot Hè 2026</h2>
            <p className="mt-3 text-gray-600">
              Từ biển đảo, cao nguyên đến phố cổ, những điểm đến được tìm kiếm nhiều nhất mùa hè này đã sẵn sàng cho chuyến đi tiếp theo của bạn.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700">Mùa đẹp nhất: Tháng 5 - 8</span>
            <span className="rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700">Ưu đãi đến 25%</span>
            <Link href="/search" className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-900 hover:text-gray-900">
              Xem toàn bộ điểm đến
            </Link>
          </div>
        </div>

        <div className="relative">
          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              {/* Slide visibility controlled by currentDestinationSlide */}
              <div className={`md:col-span-6 md:row-span-2 md:h-[460px] ${currentDestinationSlide === 0 ? 'block' : 'hidden'}`}>
                <Link href="/search?location=Hạ%20Long" className="group relative overflow-hidden rounded-3xl shadow-lg h-full block">
                  <img
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Ha Long"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute left-6 top-6 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900">Top 1 tuần này</div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-3xl font-bold">Hạ Long Bay</h3>
                    <p className="mt-1 text-gray-200">Du thuyền hoàng hôn, nghỉ dưỡng sang trọng và trải nghiệm vịnh di sản.</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                      <span className="rounded-full bg-white/20 px-3 py-1">Vịnh biển</span>
                      <span className="rounded-full bg-white/20 px-3 py-1">Gia đình</span>
                      <span className="rounded-full bg-white/20 px-3 py-1">Couple</span>
                    </div>
                  </div>
                </Link>
              </div>

              <div className={`md:col-span-3 md:h-[220px] ${currentDestinationSlide === 0 ? 'block' : 'hidden'}`}>
                <Link href="/search?location=Sapa" className="group relative overflow-hidden rounded-3xl shadow-lg h-full block">
                  <img
                    src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2128&auto=format&fit=crop"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Sapa"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-5 left-5 text-white">
                    <h3 className="text-xl font-bold">Sapa</h3>
                    <p className="text-gray-300">Săn mây - ruộng bậc thang</p>
                  </div>
                </Link>
              </div>

              <div className={`md:col-span-3 md:h-[220px] ${currentDestinationSlide === 0 ? 'block' : 'hidden'}`}>
                <Link href="/search?location=Phú%20Quốc" className="group relative overflow-hidden rounded-3xl shadow-lg h-full block">
                  <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Phu Quoc"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-5 left-5 text-white">
                    <h3 className="text-xl font-bold">Phú Quốc</h3>
                    <p className="text-gray-300">Đảo ngọc nghỉ dưỡng</p>
                  </div>
                </Link>
              </div>

              <div className={`md:col-span-3 md:h-[220px] ${currentDestinationSlide === 0 ? 'block' : 'hidden'}`}>
                <Link href="/search?location=Đà%20Nẵng" className="group relative overflow-hidden rounded-3xl shadow-lg h-full block">
                  <img
                    src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2070&auto=format&fit=crop"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Da Nang"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-5 left-5 text-white">
                    <h3 className="text-xl font-bold">Đà Nẵng</h3>
                    <p className="text-gray-300">Biển xanh - thành phố trẻ</p>
                  </div>
                </Link>
              </div>

              <div className={`rounded-3xl border border-gray-100 bg-gradient-to-br from-orange-50 via-white to-sky-50 p-6 shadow-sm md:col-span-3 md:h-[220px] ${currentDestinationSlide === 0 ? 'block' : 'hidden'}`}>
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Gợi ý nhanh</p>
                <h3 className="mt-2 text-xl font-bold text-gray-900">Chọn theo phong cách du lịch</h3>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-white px-3 py-1 text-gray-700">Nghỉ dưỡng</span>
                  <span className="rounded-full bg-white px-3 py-1 text-gray-700">Phiêu lưu</span>
                  <span className="rounded-full bg-white px-3 py-1 text-gray-700">Ẩm thực</span>
                  <span className="rounded-full bg-white px-3 py-1 text-gray-700">Check-in</span>
                </div>
                <p className="mt-4 text-sm text-gray-600">Mỗi điểm đến đều có danh sách khách sạn phù hợp cho cặp đôi, gia đình và nhóm bạn.</p>
                <Link href="/search" className="mt-4 inline-block text-sm font-bold text-orange-600 hover:text-orange-700">Khám phá ngay →</Link>
              </div>
            </div>
          </div>

          {/* Dot Navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {[0].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentDestinationSlide(index)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  currentDestinationSlide === index 
                    ? 'bg-gray-900 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* --- PHẦN 3: ROOM GALLERY (HANG PHONG) --- */}
      <section className="relative mx-auto max-w-7xl my-16 px-4 md:px-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#0f4a73]">ROOM COLLECTION</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[0.15em] text-gray-900 md:text-4xl">HẠNG PHÒNG</h2>
        </div>

        {roomsLoading ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f4a73] mx-auto"></div>
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {rooms.slice(0,8).map((room) => {
              const meta = getRoomMeta(room);
              return (
                <Link
                  key={room.id}
                  href={`/rooms/${room.id}`}
                  className="group flex flex-col bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden border border-gray-100"
                >
                  <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                    <img
                      src={getRoomImageUrl(room.images?.[0] || '')}
                      alt={room.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getRoomLocalFallback(room.id);
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-white/80 text-[#0f4a73] text-xs font-bold rounded px-2 py-1 shadow">
                      {room.base_price?.toLocaleString('vi-VN')}₫/đêm
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{room.name}</h3>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><span aria-hidden="true">🛏️</span>{meta.bed}</span>
                      <span className="flex items-center gap-1"><span aria-hidden="true">🗖</span>{meta.area}</span>
                      <span className="flex items-center gap-1"><span aria-hidden="true">👁️</span>{meta.view}</span>
                    </div>
                    <Link href={`/rooms/${room.id}`} className="mt-auto inline-block text-sm font-semibold text-white bg-[#0f4a73] rounded px-4 py-2 hover:bg-[#1766a6] transition">Xem chi tiết</Link>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-12 text-center text-gray-500 shadow">
            Không có phòng nào.
          </div>
        )}
        <div className="flex justify-center mt-8">
          <Link href="/search" className="inline-block text-sm font-bold text-[#0f4a73] border border-[#0f4a73] rounded-full px-6 py-2 hover:bg-[#0f4a73] hover:text-white transition">Xem tất cả phòng</Link>
        </div>
      </section>


      {/* --- PHẦN 4: WHY CHOOSE US --- */}
      <section className="py-24 px-8 bg-white">
         <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                 <div className="p-6">
                     <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🏷️</div>
                     <h3 className="text-xl font-bold mb-3">Giá Tốt Nhất</h3>
                     <p className="text-gray-500 leading-relaxed">Cam kết giá cạnh tranh nhất thị trường. Chúng tôi sẽ khớp giá nếu bạn tìm thấy nơi nào rẻ hơn.</p>
                 </div>
                 <div className="p-6">
                     <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🤖</div>
                     <h3 className="text-xl font-bold mb-3">AI Gợi Ý Thông Minh</h3>
                     <p className="text-gray-500 leading-relaxed">Công nghệ AI phân tích sở thích để tìm ra căn phòng "chân ái" dành riêng cho bạn chỉ trong tích tắc.</p>
                 </div>
                 <div className="p-6">
                     <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🛡️</div>
                     <h3 className="text-xl font-bold mb-3">Đặt Phòng An Toàn</h3>
                     <p className="text-gray-500 leading-relaxed">Bảo mật thông tin tuyệt đối. Hỗ trợ hoàn hủy linh hoạt giúp bạn yên tâm lên kế hoạch.</p>
                 </div>
            </div>
         </div>
      </section>
      
      {/* Footer Simple */}
      <footer className="bg-gray-900 text-white py-12 px-8 border-t border-gray-800">
         <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center">
             <div className="mb-4 md:mb-0">
                 <span className="text-2xl font-bold">Booking<span className="text-orange-500">AI</span></span>
                 <p className="text-gray-500 text-sm mt-2">© 2026 All rights reserved.</p>
             </div>
             <div className="flex gap-8 text-gray-400 text-sm">
                 <a href="#" className="hover:text-white">Privacy Policy</a>
                 <a href="#" className="hover:text-white">Terms of Service</a>
                 <a href="#" className="hover:text-white">Cookie Settings</a>
             </div>
         </div>
      </footer>

    </main>
  );
}
