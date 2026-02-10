// File: frontend/app/page.tsx
'use client'; // Bắt buộc dòng này để dùng được useEffect (React)

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import RoomCard from '@/components/RoomCard';
import Link from 'next/link';

// 1. Định nghĩa kiểu dữ liệu (Phải khớp với Backend trả về)
interface Room {
  id: number;
  name: string;
  price_per_night: number;
  location: string;
  image_url: string;
  amenities: string[];
}

export default function Home() {
  const router = useRouter(); // Hook điều hướng
  // 2. Khai báo các biến trạng thái (State)
  const [searchTerm, setSearchTerm] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]); // Chứa danh sách phòng
  const [loading, setLoading] = useState(true);   // Trạng thái đang tải

  // 3. Hàm gọi API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/rooms/?limit=8'); // Lấy 6-8 phòng nổi bật
        if (!res.ok) throw new Error('Không gọi được API');
        
        const data = await res.json();
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedData = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price_per_night: item.base_price,
            location: item.hotel ? `${item.hotel.city}, ${item.hotel.country}` : "Vietnam",
            image_url: item.images?.[0] || "", 
            amenities: item.amenities || []
        }));

        setRooms(mappedData);
      } catch (error) {
        console.error("Lỗi gọi API:", error);
      } finally {
        setLoading(false);
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
        <div className="flex items-end justify-between mb-12">
            <div>
                <span className="text-orange-500 font-bold tracking-wider uppercase text-sm mb-2 block">Khám phá</span>
                <h2 className="text-4xl font-serif font-bold text-gray-900">Điểm Đến Hot Hè 2026</h2>
            </div>
            <div className="hidden md:flex gap-2">
                 {/* Fake Navigation Buttons */}
                 <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition">&larr;</button>
                 <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition">&rarr;</button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[400px]">
             {/* Card 1 - Big */}
             <div className="md:col-span-2 relative rounded-3xl overflow-hidden group cursor-pointer shadow-lg">
                <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Yosemite" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-bold">Hạ Long Bay</h3>
                    <p className="text-gray-300">Kỳ quan thiên nhiên</p>
                </div>
             </div>

             {/* Card 2 */}
             <div className="relative rounded-3xl overflow-hidden group cursor-pointer shadow-lg">
                <img src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2128&auto=format&fit=crop" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Sapa" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-xl font-bold">Sapa</h3>
                    <p className="text-gray-300">Thành phố mây</p>
                </div>
             </div>

             {/* Card 3 */}
             <div className="relative rounded-3xl overflow-hidden group cursor-pointer shadow-lg">
                <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Phu Quoc" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-xl font-bold">Phú Quốc</h3>
                    <p className="text-gray-300">Đảo ngọc</p>
                </div>
             </div>
        </div>
      </section>
      
      {/* --- PHẦN 3: HOTEL LISTING (Database) --- */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-8">
            <div className="text-center mb-16">
                 <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Lựa Chọn Nghỉ Dưỡng Hoàn Hảo</h2>
                 <p className="text-gray-500 max-w-2xl mx-auto">Được đề xuất dựa trên dữ liệu thật từ hệ thống và sở thích của bạn.</p>
            </div>

            {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {rooms.map((room) => (
                        <div key={room.id} className="h-[400px]">
                            <RoomCard room={room} />
                        </div>
                    ))}
                </div>
            )}
            
            <div className="text-center mt-12">
                 <Link href="/search" className="inline-block rounded-full border border-gray-300 bg-white px-8 py-3 font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white hover:border-gray-900">
                    Xem tất cả phòng
                 </Link>
            </div>
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
