'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import {
  getHotelImageUrl,
  getFirstImage,
  getHotelLocalFallback,
  getRoomImageUrl,
  getRoomLocalFallback,
} from '@/lib/imageUtils';

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

function getRoomMeta(room: Room): { bed: string; area: string; view: string } {
  const text = `${room.name} ${(room.amenities || []).join(' ')}`.toLowerCase();

  let bed = 'King Bed';
  if (text.includes('twin')) {
    bed = 'King Bed & Twin beds';
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

  const buildRoomHref = (roomId: number) => {
    const params = new URLSearchParams();
    if (checkInDate) params.set('checkIn', checkInDate);
    if (checkOutDate) params.set('checkOut', checkOutDate);
    if (guests) params.set('guests', guests);
    return `/rooms/${roomId}${params.toString() ? `?${params.toString()}` : ''}`;
  };

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
            <img
              src={getFirstImage(hotel.images)}
              alt={hotel.name}
              className="w-full h-96 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getHotelLocalFallback(hotel.id);
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {hotel.images?.slice(1, 4).map((img, idx) => (
              <img
                key={idx}
                src={getHotelImageUrl(img)}
                alt={`${hotel.name} ${idx}`}
                className="w-full h-24 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getHotelLocalFallback(`${hotel.id}-${idx}`);
                }}
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
      <section className="relative overflow-hidden rounded-3xl bg-[#0f4a73] px-4 py-10 md:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 10%, rgba(255,255,255,.5) 0, rgba(255,255,255,0) 40%), linear-gradient(115deg, rgba(255,255,255,.16) 1px, transparent 1px)',
            backgroundSize: 'auto, 34px 34px',
          }}
        />

        <div className="relative z-10 mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">ROOM COLLECTION</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[0.15em] text-white md:text-4xl">HANG PHONG</h2>
        </div>

        {rooms.length > 0 ? (
          <div className="relative z-10 grid grid-cols-1 gap-4 rounded-2xl bg-white/95 p-4 md:grid-cols-12 md:auto-rows-[132px] md:gap-3 md:p-3">
            {rooms.map((room, index) => {
              const meta = getRoomMeta(room);
              return (
                <Link
                  key={room.id}
                  href={buildRoomHref(room.id)}
                  className={`group relative min-h-[220px] overflow-hidden rounded-xl ${getRoomLayoutClass(index)}`}
                >
                  <img
                    src={getRoomImageUrl(room.image_url)}
                    alt={room.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getRoomLocalFallback(room.id);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3 text-white md:bottom-4 md:left-4 md:right-4">
                    <h3 className="line-clamp-2 text-2xl font-semibold leading-tight drop-shadow md:text-4xl lg:text-5xl">
                      {room.name}
                    </h3>

                    <div className="mt-2 grid grid-cols-3 gap-2 rounded-md bg-black/35 px-3 py-2 text-xs md:mt-3 md:text-sm">
                      <div className="flex items-center gap-1">
                        <span aria-hidden="true">🛏️</span>
                        <span>{meta.bed}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span aria-hidden="true">🗖</span>
                        <span>{meta.area}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span aria-hidden="true">👁️</span>
                        <span>{meta.view}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="relative z-10 rounded-2xl bg-white p-12 text-center text-gray-500">
            Khong co phong nao kha dung cho khoang thoi gian nay.
          </div>
        )}
      </section>
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
