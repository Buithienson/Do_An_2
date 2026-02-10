// File: frontend/components/RoomCard.tsx
import React from 'react';
import Link from 'next/link';

interface RoomProps {
  id: number;
  name: string;
  price_per_night: number;
  location: string;
  image_url: string;
  amenities: string[];
}

const RoomCard: React.FC<{ 
  room: RoomProps;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  guests?: string | null;
}> = ({ room, checkInDate, checkOutDate, guests }) => {
  const queryParams = new URLSearchParams();
  if (checkInDate) queryParams.append('checkIn', checkInDate);
  if (checkOutDate) queryParams.append('checkOut', checkOutDate);
  if (guests) queryParams.append('guests', guests);

  return (
    <Link href={`/rooms/${room.id}?${queryParams.toString()}`} className="block h-full">
      <div className="group relative h-full overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl cursor-pointer">
        {/* Hình ảnh phòng */}
        <div className="h-48 w-full overflow-hidden">
          <img
            src={room.image_url || "https://placehold.co/600x400"}
            alt={room.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        
        {/* Thông tin chi tiết */}
        <div className="p-5">
          <div className="mb-2 flex items-center text-sm text-blue-500 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {room.location}
          </div>
          
          <h3 className="mb-2 text-xl font-bold text-gray-800 line-clamp-1">{room.name}</h3>
          
          <div className="mb-4 flex flex-wrap gap-2">
            {(room.amenities || []).slice(0, 3).map((item, index) => (
              <span key={index} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                {item.trim()}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <span className="text-lg font-bold text-blue-600">
                {room.price_per_night.toLocaleString('vi-VN')}đ
              </span>
              <span className="text-sm text-gray-500">/đêm</span>
            </div>
            
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              Xem ngay
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RoomCard;
