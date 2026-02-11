'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import RoomCard from '@/components/RoomCard';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

interface Hotel {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  star_rating: number;
  images: string[];
  amenities: string[];
  policies: any;
}

interface Room {
  id: number;
  hotel_id: number;
  name: string;
  price_per_night: number;
  location: string;
  image_url: string;
  images: string[];
  amenities: string[];
}

function HotelContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelId = params.id as string;
  const checkInDate = searchParams.get('checkIn');
  const checkOutDate = searchParams.get('checkOut');
  const guests = searchParams.get('guests');

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch hotel details
        const hotelRes = await fetch(`${API_URL}/api/hotels/${hotelId}`);
        if (!hotelRes.ok) throw new Error('Failed to fetch hotel');
        const hotelData = await hotelRes.json();
        setHotel(hotelData);

        // Fetch rooms for this hotel
        const roomRes = await fetch(`${API_URL}/api/rooms/?hotel_id=${hotelId}`);
        if (!roomRes.ok) throw new Error('Failed to fetch rooms');
        const roomData = await roomRes.json();
        
        const mappedRooms = roomData.map((item: any) => ({
          id: item.id,
          hotel_id: item.hotel_id,
          name: item.name,
          price_per_night: item.base_price,
          location: `${hotelData.city}, ${hotelData.country}`,
          image_url: item.images?.[0] || '',
          images: item.images || [],
          amenities: item.amenities || []
        }));

        setRooms(mappedRooms);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hotelId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="flex justify-center py-20">Đang tải...</div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="text-center py-20 text-gray-500">Không tìm thấy khách sạn</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-12">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-gray-900">Trang chủ</Link>
        <span>/</span>
        <Link href={`/search?location=${encodeURIComponent(hotel.city)}`} className="hover:text-gray-900">
          {hotel.city}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{hotel.name}</span>
      </div>

      {/* Hotel Details */}
      <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Images */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            {hotel.images && hotel.images.length > 0 && (
              <img
                src={hotel.images[0]}
                alt={hotel.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {hotel.images?.slice(1, 4).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${hotel.name} ${idx}`}
                className="w-full h-24 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* Hotel Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1">
              {[...Array(hotel.star_rating)].map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
            <span className="text-gray-600 text-sm">({hotel.star_rating} sao)</span>
          </div>
          <p className="text-gray-600 mb-4">{hotel.description}</p>
          <p className="text-gray-700 mb-2">
            <strong>Địa chỉ:</strong> {hotel.address}
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Thành phố:</strong> {hotel.city}, {hotel.country}
          </p>

          {/* Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="mb-4">
              <strong className="block text-gray-900 mb-2">Tiện nghi:</strong>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Policies */}
          {hotel.policies && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <strong className="block text-gray-900 mb-2">Chính sách:</strong>
              <ul className="text-sm text-gray-700 space-y-1">
                {typeof hotel.policies === 'string' ? (
                  <li>{hotel.policies}</li>
                ) : (
                  Object.entries(hotel.policies).map(([key, value]) => (
                    <li key={key}>
                      <strong className="capitalize">{key}:</strong> {String(value)}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Rooms Section */}
      <div>
        <h2 className="mb-8 text-2xl font-bold text-gray-900">Các phòng còn trống</h2>

        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rooms.map((room) => (
              <div key={room.id} className="h-[420px]">
                <RoomCard 
                  room={room}
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  guests={guests}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            Không có phòng nào khả dụng cho khoảng thời gian này.
          </div>
        )}
      </div>
    </div>
  );
}

export default function HotelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="dark" />
      <Suspense fallback={<div>Loading Hotel...</div>}>
        <HotelContent />
      </Suspense>
    </div>
  );
}
