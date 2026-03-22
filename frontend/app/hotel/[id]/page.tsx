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

// ── Interfaces ────────────────────────────────────────────────────────────────

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

interface Review {
  id: number;
  overall_rating: number;
  comment: string;
  created_at: string;
  user?: { full_name: string };
}

interface AISummary {
  summary: string;
  highlights: string[];
  complaints: string[];
  total_reviews: number;
  average_rating: number | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function getAuthToken(): string | null {
  try {
    // Login page stores token under 'token' key
    return localStorage.getItem('token') || localStorage.getItem('access_token');
  } catch {
    return null;
  }
}

// ── Star Rating Component ─────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const stars = [2, 4, 6, 8, 10];
  return (
    <div className="flex gap-1 items-center">
      {stars.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          onMouseEnter={() => setHovered(v)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl transition-transform hover:scale-110"
        >
          <span className={(hovered || value) >= v ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-500 font-medium">{value}/10</span>
    </div>
  );
}

// ── AI Summary Card ───────────────────────────────────────────────────────────

function AISummaryCard({ hotelId, hasReviews }: { hotelId: string; hasReviews: boolean }) {
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasReviews) {
      setSummary(null);
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/ai/hotels/${hotelId}/summary`)
      .then((r) => r.json())
      .then((data) => setSummary(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hotelId, hasReviews]);

  if (!hasReviews) return null;

  if (loading) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-6 animate-pulse">
        <div className="h-4 bg-amber-200 rounded w-1/3 mb-3" />
        <div className="h-3 bg-amber-100 rounded w-full mb-2" />
        <div className="h-3 bg-amber-100 rounded w-4/5" />
      </div>
    );
  }

  if (!summary || summary.total_reviews === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-bold text-gray-900 text-lg">AI Tổng hợp ý kiến khách hàng</h3>
        <span className="ml-auto text-sm text-amber-700 font-medium bg-amber-100 px-2 py-0.5 rounded-full">
          {summary.total_reviews} đánh giá • {summary.average_rating}/10
        </span>
      </div>

      <p className="text-gray-700 text-sm leading-relaxed mb-4">{summary.summary}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {summary.highlights.length > 0 && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Điểm nổi bật</p>
            <ul className="space-y-1 list-disc pl-4">
              {summary.highlights.map((h) => (
                <li key={h} className="text-sm text-green-800">
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}
        {summary.complaints.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Cần cải thiện</p>
            <ul className="space-y-1 list-disc pl-4">
              {summary.complaints.map((c) => (
                <li key={c} className="text-sm text-red-800">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Content ──────────────────────────────────────────────────────────────

function HotelContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelId = params.id as string;
  const checkInDate = searchParams.get('checkIn');
  const checkOutDate = searchParams.get('checkOut');
  const guests = searchParams.get('guests');

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Wishlist
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Auth – must use state so it reads localStorage AFTER hydration (not SSR)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Check login state after mount (localStorage is only available client-side)
  useEffect(() => {
    setIsLoggedIn(Boolean(getAuthToken()));
  }, []);

  const buildRoomHref = (roomId: number) => {
    const p = new URLSearchParams();
    if (checkInDate) p.set('checkIn', checkInDate);
    if (checkOutDate) p.set('checkOut', checkOutDate);
    if (guests) p.set('guests', guests);
    return `/rooms/${roomId}${p.toString() ? `?${p.toString()}` : ''}`;
  };

  const fetchReviews = async () => {
    const r = await fetch(`${API_URL}/api/hotels/${hotelId}/reviews?limit=50`);
    if (r.ok) setReviews(await r.json());
  };

  // Initial load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [hotelRes, roomRes] = await Promise.all([
          fetch(`${API_URL}/api/hotels/${hotelId}`),
          fetch(`${API_URL}/api/rooms/?hotel_id=${hotelId}`),
        ]);

        if (!hotelRes.ok) throw new Error('Failed to fetch hotel');
        const hotelData = await hotelRes.json();
        setHotel(hotelData);

        if (roomRes.ok) {
          const roomData = await roomRes.json();
          setRooms(
            roomData.map((item: any) => ({
              id: item.id,
              hotel_id: item.hotel_id,
              name: item.name,
              price_per_night: item.base_price,
              location: `${hotelData.city}, ${hotelData.country}`,
              image_url: item.images?.[0] || '',
              images: item.images || [],
              amenities: item.amenities || [],
            }))
          );
        }

        await fetchReviews();

        // Auto-seed reviews nếu chưa có dữ liệu
        // (gọi silent – không block UI, không cần auth)
        try {
          const countRes = await fetch(`${API_URL}/api/hotels/${hotelId}/reviews?limit=1`);
          if (countRes.ok) {
            const countData = await countRes.json();
            if (Array.isArray(countData) && countData.length === 0) {
              // Trigger seed silently, then reload reviews
              await fetch(`${API_URL}/api/seed/reviews`, { method: 'POST' });
              await fetchReviews();
            }
          }
        } catch { /* seed failed silently */ }

        // Check wishlist status
        const token = getAuthToken();
        if (token) {
          const wRes = await fetch(`${API_URL}/api/wishlists/check/${hotelId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (wRes.ok) {
            const wData = await wRes.json();
            setIsWishlisted(wData.is_wishlisted);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hotelId]);

  // Toggle wishlist
  const handleWishlistToggle = async () => {
    const token = getAuthToken();
    if (!token) {
      alert('Vui lòng đăng nhập để lưu yêu thích!');
      return;
    }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await fetch(`${API_URL}/api/wishlists/${hotelId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsWishlisted(false);
      } else {
        await fetch(`${API_URL}/api/wishlists/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ hotel_id: Number(hotelId) }),
        });
        setIsWishlisted(true);
      }
    } catch {}
    setWishlistLoading(false);
  };

  // Submit review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    if (reviewRating === 0) {
      setReviewError('Vui lòng chọn số sao đánh giá.');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Vui lòng nhập nội dung nhận xét.');
      return;
    }
    const token = getAuthToken();
    if (!token) {
      setReviewError('Vui lòng đăng nhập để gửi đánh giá.');
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/hotels/${hotelId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          hotel_id: Number(hotelId),
          overall_rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      if (res.status === 400) {
        const err = await res.json();
        setReviewError(err.detail || 'Bạn đã đánh giá khách sạn này rồi.');
      } else if (!res.ok) {
        setReviewError('Gửi đánh giá thất bại. Vui lòng thử lại.');
      } else {
        setReviewSuccess('Cảm ơn bạn đã đánh giá! 🎉');
        setReviewComment('');
        setReviewRating(0);
        await fetchReviews();
      }
    } catch {
      setReviewError('Lỗi kết nối. Vui lòng thử lại.');
    }
    setReviewSubmitting(false);
  };

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
          <div className="flex items-start justify-between mb-2 gap-2">
            <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
            {/* Wishlist Button */}
            <button
              id="wishlist-toggle-btn"
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              title={isWishlisted ? 'Bỏ yêu thích' : 'Lưu yêu thích'}
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 shadow-sm hover:scale-110 ${
                isWishlisted
                  ? 'border-red-400 bg-red-50 text-red-500'
                  : 'border-gray-300 bg-white text-gray-400 hover:border-red-300 hover:text-red-400'
              }`}
            >
              <span className="text-lg">{isWishlisted ? '❤️' : '🤍'}</span>
            </button>
          </div>

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

      {/* ── Rooms Section ──────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">Room Collection</p>
              <h2 className="mt-1 text-3xl font-bold text-gray-900 md:text-4xl">Hạng Phòng</h2>
              <p className="mt-2 max-w-2xl text-gray-600">Thiết kế tối giản, thông tin rõ ràng để bạn chọn phòng nhanh hơn.</p>
            </div>
            <Link
              href={`/search?location=${encodeURIComponent(hotel.city)}`}
              className="inline-flex items-center rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
            >
              Xem tất cả phòng
            </Link>
          </div>

          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rooms.map((room) => {
                const meta = getRoomMeta(room);
                return (
                  <Link
                    key={room.id}
                    href={buildRoomHref(room.id)}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={getRoomImageUrl(room.image_url)}
                        alt={room.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getRoomLocalFallback(room.id);
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-sm font-bold text-orange-600 shadow">
                        {room.price_per_night.toLocaleString('vi-VN')}đ/đêm
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="line-clamp-1 text-xl font-bold text-gray-900">{room.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{hotel.city}, {hotel.country}</p>

                      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-lg bg-gray-100 px-2 py-2 text-center font-medium text-gray-700">{meta.bed}</div>
                        <div className="rounded-lg bg-gray-100 px-2 py-2 text-center font-medium text-gray-700">{meta.area}</div>
                        <div className="rounded-lg bg-gray-100 px-2 py-2 text-center font-medium text-gray-700">{meta.view}</div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                        <span className="text-sm font-medium text-gray-500">Chi tiết</span>
                        <span className="text-sm font-bold text-orange-600">Đặt ngay →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500">
              Không có phòng nào khả dụng cho khoảng thời gian này.
            </div>
          )}
        </div>
      </section>

      {/* ── Reviews Section ────────────────────────────────────── */}
      <section className="py-8 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">Đánh Giá</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Nhận Xét Của Khách Hàng</h2>
          </div>

          {/* AI Summary */}
          <div className="mb-8">
            <AISummaryCard hotelId={hotelId} hasReviews={reviews.length > 0} />
          </div>

          {/* Review List */}
          {reviews.length > 0 ? (
            <div className="space-y-4 mb-10">
              {reviews.slice(0, 10).map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 text-sm">
                      {review.user?.full_name?.charAt(0)?.toUpperCase() || 'K'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-semibold text-gray-900 text-sm">
                          {review.user?.full_name || 'Khách ẩn danh'}
                        </span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < Math.round(review.overall_rating / 2) ? 'text-yellow-400' : 'text-gray-200'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-xs font-bold text-gray-600 ml-1">
                            {review.overall_rating}/10
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 mb-8">
              Chưa có đánh giá nào. Hãy là người đầu tiên!
            </div>
          )}

          {/* Review Form */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 text-lg mb-4">
              {isLoggedIn ? 'Viết đánh giá của bạn' : 'Đăng nhập để gửi đánh giá'}
            </h3>

            {isLoggedIn ? (
              <form onSubmit={handleReviewSubmit} id="review-form">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Điểm đánh giá</label>
                  <StarRating value={reviewRating} onChange={setReviewRating} />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét</label>
                  <textarea
                    id="review-comment"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn về khách sạn này..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none resize-none transition"
                  />
                </div>

                {reviewError && (
                  <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                    {reviewError}
                  </div>
                )}
                {reviewSuccess && (
                  <div className="mb-3 p-3 rounded-lg bg-green-50 border border-green-100 text-green-600 text-sm">
                    {reviewSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  id="submit-review-btn"
                  disabled={reviewSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {reviewSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm mb-3">Bạn cần đăng nhập để có thể gửi đánh giá</p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Page Export ───────────────────────────────────────────────────────────────

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
