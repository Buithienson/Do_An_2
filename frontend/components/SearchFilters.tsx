"use client";

import React, { useState } from "react";
import { X, SlidersHorizontal, Check } from "lucide-react";

interface SearchFiltersProps {
  onApplyFilters: (filters: FilterValues) => void;
  onClearFilters: () => void;
}

export interface FilterValues {
  minPrice: number;
  maxPrice: number;
  amenities: string[];
  sortBy: string;
}

const AMENITIES_OPTIONS = [
  { value: "wifi", label: "WiFi miễn phí" },
  { value: "pool", label: "Hồ bơi" },
  { value: "ac", label: "Điều hòa" },
  { value: "parking", label: "Bãi đỗ xe" },
  { value: "gym", label: "Phòng gym" },
  { value: "restaurant", label: "Nhà hàng" },
  { value: "spa", label: "Spa" },
  { value: "breakfast", label: "Ăn sáng" },
];

const SORT_OPTIONS = [
  { value: "price_asc", label: "Giá: Thấp đến cao" },
  { value: "price_desc", label: "Giá: Cao đến thấp" },
  { value: "rating", label: "Đánh giá cao nhất" },
];

export default function SearchFilters({ onApplyFilters, onClearFilters }: SearchFiltersProps) {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("price_asc");

  const handleApply = () => {
    onApplyFilters({
      minPrice,
      maxPrice,
      amenities: selectedAmenities,
      sortBy,
    });
  };

  const handleClear = () => {
    setMinPrice(0);
    setMaxPrice(10000000);
    setSelectedAmenities([]);
    setSortBy("price_asc");
    onClearFilters();
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-blue-600" />
          Bộ lọc
        </h3>
        <button
          onClick={handleClear}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Xóa tất cả
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Khoảng giá (VNĐ/đêm)</h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Từ</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Đến</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              min={minPrice}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="10,000,000"
            />
          </div>
          <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
            {formatPrice(minPrice)} - {formatPrice(maxPrice)} VNĐ
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Tiện nghi</h4>
        <div className="space-y-2">
          {AMENITIES_OPTIONS.map((amenity) => (
            <label
              key={amenity.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-2 transition"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity.value)}
                  onChange={() => toggleAmenity(amenity.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 border-2 rounded flex items-center justify-center transition ${
                    selectedAmenities.includes(amenity.value)
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  {selectedAmenities.includes(amenity.value) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-700">{amenity.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Sắp xếp theo</h4>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white cursor-pointer"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
      >
        Áp dụng bộ lọc
      </button>
    </div>
  );
}
