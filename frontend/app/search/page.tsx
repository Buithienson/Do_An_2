'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { API_URL } from '@/lib/api';
import { getFirstImage } from '@/lib/imageUtils';

interface Hotel {
  id: number;
  name: string;
  description: string;
  city: string;
  country: string;
  star_rating: number;
  images: string[];
  amenities: string[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const locationQuery = searchParams.get('location');
  const checkInDate = searchParams.get('checkIn');
  const checkOutDate = searchParams.get('checkOut');
  const guests = searchParams.get('guests');
  
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        if (locationQuery) {
            params.append('city', locationQuery);
        }
        
        const res = await fetch(`${API_URL}/api/hotels/?${params.toString()}`);
        if (!res.ok) throw new Error('API Error');
        
        const data = await res.json();
        setHotels(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [locationQuery]);

  return (
    <div className="mx-auto max-w-7xl px-8 py-12">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
            Khách sạn tại {locationQuery ? `"${locationQuery}"` : "Việt Nam"}
        </h1>
        
        {loading ? (
             <div className="flex justify-center py-20">Đang tải...</div>
        ) : hotels.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {hotels.map((hotel) => (
                    <Link
                      key={hotel.id}
                      href={`/hotel/${hotel.id}?checkIn=${checkInDate || ''}&checkOut=${checkOutDate || ''}&guests=${guests || ''}`}
                    >
                      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden">
                        {/* Hotel Image */}
                        <div className="relative h-48 overflow-hidden bg-gray-200">
                          <img
                            src={getFirstImage(hotel.images)}
                            alt={hotel.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/hotels/hotel_city_luxury.png';
                            }}
                          />
                        </div>

                        {/* Hotel Info */}
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                            {hotel.name}
                          </h3>
                          
                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-2">
                            <div className="flex gap-0.5">
                              {[...Array(hotel.star_rating)].map((_, i) => (
                                <span key={i} className="text-yellow-400 text-sm">★</span>
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">({hotel.star_rating}/5)</span>
                          </div>

                          {/* Location */}
                          <p className="text-sm text-gray-600 mb-3">
                            📍 {hotel.city}, {hotel.country}
                          </p>

                          {/* Description */}
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {hotel.description}
                          </p>

                          {/* Amenities Preview */}
                          {hotel.amenities && hotel.amenities.length > 0 && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1">
                                {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block bg-orange-50 px-2 py-1 rounded text-xs text-orange-600"
                                  >
                                    {amenity}
                                  </span>
                                ))}
                                {hotel.amenities.length > 3 && (
                                  <span className="inline-block bg-orange-50 px-2 py-1 rounded text-xs text-orange-600">
                                    +{hotel.amenities.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* CTA Button */}
                          <button className="w-full py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                            Xem phòng
                          </button>
                        </div>
                      </div>
                    </Link>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 text-gray-500">
                Không tìm thấy khách sạn nào tại địa điểm này.
            </div>
        )}
    </div>
  );
}

export default function SearchPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar variant="dark" />
            <Suspense fallback={<div>Loading Search...</div>}>
                <SearchContent />
            </Suspense>
        </div>
    );
}
