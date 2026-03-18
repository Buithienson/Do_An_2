/**
 * Utility functions for handling hotel/room image URLs.
 *
 * Handles 3 cases:
 * 1. Valid absolute URLs (http/https) → return as-is (with Unsplash params appended if needed)
 * 2. Relative paths starting with "/" → prepend frontend base URL
 * 3. Empty/null → return a local fallback image
 */

const UNSPLASH_PARAMS = '?w=800&auto=format&fit=crop&q=80';

const HOTEL_LOCAL_POOL = [
  '/hotels/hotel_bay_view.png',
  '/hotels/hotel_beach_resort.png',
  '/hotels/hotel_city_luxury.png',
  '/hotels/hotel_dalat.png',
  '/hotels/hotel_dalat_french.png',
  '/hotels/hotel_halong.png',
  '/hotels/hotel_hanoi.png',
  '/hotels/hotel_heritage.png',
  '/hotels/hotel_hoian.png',
  '/hotels/hotel_island_villa.png',
  '/hotels/hotel_mountain_resort.png',
  '/hotels/hotel_phuquoc.png',
  '/hotels/hotel_riverside.png',
  '/hotels/hotel_sapa.png',
  '/hotels/jw_marriott_phuquoc.png',
  '/hotels/renaissance_danang.png',
  '/hotels/sheraton_saigon.png',
  '/hotels/vinpearl_nhatrang.png'
];

// Fallback local images for hotels and rooms
const HOTEL_FALLBACK = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80';
const ROOM_FALLBACK = 'https://images.unsplash.com/photo-1596436889106-be35e843f97f?w=800&auto=format&fit=crop&q=80';

/**
 * Get a valid, displayable image URL for a hotel image.
 * @param url - Raw URL string from the database
 */
export function getHotelImageUrl(url: string | undefined | null): string {
  // 1. Nếu không có URL, trả về ảnh mặc định (Unsplash)
  if (!url || typeof url !== 'string') {
    return HOTEL_FALLBACK;
  }

  // Relative path (e.g., "/hotels/hotel_city_luxury.png") — serve directly
  if (url.startsWith('/')) {
    return url;
  }

  // Unsplash URL — append required params if missing
  if (url.includes('images.unsplash.com')) {
    if (!url.includes('?')) {
      return url + UNSPLASH_PARAMS;
    }
    // Already has params, return as-is
    return url;
  }

  // Old-style full URL that points to localhost or another origin's /hotels/ path
  // e.g., "http://localhost:3000/hotels/hotel_city_luxury.png"
  try {
    const parsed = new URL(url);
    // Extract just the pathname if it's pointing to a local static file
    if (parsed.pathname.startsWith('/hotels/') || parsed.pathname.startsWith('/rooms/')) {
      return parsed.pathname;
    }
  } catch {
    // URL parsing failed, fall through
  }

  // Return the URL as-is as a last resort
  return url || HOTEL_FALLBACK;
}

/**
 * Get a valid, displayable image URL for a room image.
 */
export function getRoomImageUrl(url: string | null | undefined): string {
  // The original getHotelImageUrl doesn't take a second fallback argument.
  // This function should probably use ROOM_FALLBACK if the URL is invalid.
  if (!url || typeof url !== 'string') {
    return ROOM_FALLBACK;
  }
  // Re-using getHotelImageUrl logic, but ensuring ROOM_FALLBACK is used if getHotelImageUrl returns its default.
  const imageUrl = getHotelImageUrl(url);
  return imageUrl === HOTEL_FALLBACK ? ROOM_FALLBACK : imageUrl;
}

/**
 * Get the first image from an images array (hotel or room).
 */
export function getFirstImage(images: string[] | null | undefined): string {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return HOTEL_FALLBACK;
  }
  
  return getHotelImageUrl(images[0]);
}

/**
 * Get the first image from an images array (hotel or room).
 */
export function extractAllImages(images: string[] | null | undefined): string[] {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [HOTEL_FALLBACK];
  }
  
  return images.map(img => getHotelImageUrl(img));
}

/**
 * Deterministic local fallback by seed (hotel id/name hash).
 */
export function getHotelLocalFallback(seed: number | string): string {
  const numericSeed =
    typeof seed === 'number'
      ? seed
      : Array.from(String(seed)).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

  const index = Math.abs(numericSeed) % HOTEL_LOCAL_POOL.length;
  return HOTEL_LOCAL_POOL[index];
}
