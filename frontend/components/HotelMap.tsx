"use client";

import React from "react";
import { MapPin } from "lucide-react";

interface HotelMapProps {
  latitude: number;
  longitude: number;
  hotelName: string;
  address: string;
}

export default function HotelMap({ latitude, longitude, hotelName, address }: HotelMapProps) {
  // Google Maps embed URL
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${latitude},${longitude}&zoom=15`;
  
  // Google Maps link for "Open in Google Maps"
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-600" />
          Vị trí khách sạn
        </h3>
        
        <div className="mb-4">
          <p className="text-gray-700 font-medium">{hotelName}</p>
          <p className="text-gray-600 text-sm mt-1">{address}</p>
        </div>

        {/* Map Embed */}
        <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-200">
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapUrl}
              className="w-full h-full"
            />
          ) : (
            // Fallback: Static map image or placeholder
            <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-6">
              <MapPin className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 text-center mb-4">
                Google Maps API key chưa được cấu hình
              </p>
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition inline-flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Xem trên Google Maps
              </a>
            </div>
          )}
        </div>

        {/* Open in Google Maps button */}
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <div className="mt-4">
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition"
            >
              <MapPin className="w-4 h-4" />
              Mở trong Google Maps
            </a>
          </div>
        )}

        {/* Coordinates info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Tọa độ: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        </div>
      </div>
    </div>
  );
}
