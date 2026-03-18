'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { API_URL } from '@/lib/api';
import { getRoomImageUrl, getRoomLocalFallback } from '@/lib/imageUtils';

interface Room {
  id: number;
  hotel_id: number; // Thêm trường này
  name: string;
  description: string;
  price_per_night: number;
  location: string;
  image_url: string;
  images: string[];
  amenities: string[];
  room_type: string;
  max_guests: number;
  size: number;
  hotel?: {
    name: string;
    address: string;
    city: string;
    star_rating: number;
  }
}

export default function RoomDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Booking State
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchRoom = async () => {
      try {
                const res = await fetch(`${API_URL}/api/rooms/${id}`);
        if (!res.ok) throw new Error('Failed to fetch room');
        
        const data = await res.json();
        
        // Map data
        const mappedRoom: Room = {
           id: data.id,
           hotel_id: data.hotel_id, // Lấy hotel_id từ API
           name: data.name,
           description: data.description || "Mô tả đang cập nhật...",
           price_per_night: data.base_price,
           location: data.hotel ? `${data.hotel.city}, ${data.hotel.country}` : "Vietnam",
           image_url: getRoomImageUrl(data.images?.[0]),
           images: data.images || [],
           amenities: data.amenities || [],
           room_type: data.room_type,
           max_guests: data.max_guests,
           size: data.size || 0,
           hotel: data.hotel
        };

        setRoom(mappedRoom);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
        alert("Vui lòng chọn ngày nhận phòng và trả phòng");
        return;
    }
    
    // Chuyển hướng đến trang booking/payment với query params
    const params = new URLSearchParams({
        checkIn,
        checkOut,
        guests: guests.toString()
    });
    
    router.push(`/booking/${id}?${params.toString()}`);
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!room) return <div className="flex h-screen items-center justify-center">Room not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="dark" />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Breadcrumb nhẹ */}
        <div className="mb-6 text-sm text-gray-500">
            Trang chủ &gt; Phòng &gt; <span className="text-gray-900 font-medium">{room.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            
            {/* Cột trái: Hình ảnh & Thông tin chi tiết */}
            <div className="lg:col-span-2 space-y-8">
                {/* Ảnh chính */}
                <div className="overflow-hidden rounded-2xl bg-gray-200">
                    <img 
                                                src={getRoomImageUrl(room.image_url)} 
                        alt={room.name} 
                        className="h-[400px] w-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = getRoomLocalFallback(room.id);
                                                }}
                    />
                </div>
                
                {/* Thông tin phòng */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">{room.name}</h1>
                    <div className="mb-4 flex items-center text-blue-600 font-medium">
                        <svg className="mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {room.hotel?.name}, {room.location}
                    </div>
                    
                    <div className="mb-6 flex gap-4 text-sm text-gray-500">
                       <span className="flex items-center gap-1">
                           👥 {room.max_guests} Khách
                       </span>
                       <span className="flex items-center gap-1">
                           📐 {room.size} m²
                       </span>
                       <span className="flex items-center gap-1">
                           🛏️ {room.room_type}
                       </span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-800 mb-3">Mô tả</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        {room.description}
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mb-3">Tiện nghi</h2>
                    <div className="flex flex-wrap gap-2">
                        {room.amenities.map((item, idx) => (
                            <span key={idx} className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 font-medium">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cột phải: Form đặt phòng */}
            <div className="lg:col-span-1">
                <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
                    <div className="mb-6 flex items-baseline justify-between border-b border-gray-100 pb-4">
                        <span className="text-3xl font-bold text-gray-900">
                            {room.price_per_night.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="text-gray-500 font-medium">/ đêm</span>
                    </div>

                    <form onSubmit={handleBook} className="space-y-5">
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Ngày nhận phòng</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    className="w-full rounded-xl border border-gray-300 p-3 pl-4 pr-10 text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    required
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                                    {/* Icon Lịch */}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Ngày trả phòng</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    className="w-full rounded-xl border border-gray-300 p-3 pl-4 pr-10 text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">Số khách</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    min="1" 
                                    max={room.max_guests}
                                    className="w-full rounded-xl border border-gray-300 p-3 pl-4 text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    value={guests}
                                    onChange={(e) => setGuests(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isBooking}
                            className="w-full rounded-full bg-orange-600 py-3.5 font-bold text-white transition hover:bg-orange-700 disabled:opacity-50 shadow-lg shadow-orange-200 mt-2 text-lg"
                        >
                            {isBooking ? 'Đang xử lý...' : 'Đặt ngay'}
                        </button>

                        <p className="text-xs text-center text-gray-400 mt-2">
                            Bạn sẽ không bị trừ tiền ngay lập tức
                        </p>
                    </form>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}
