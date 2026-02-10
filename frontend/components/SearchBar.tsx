'use client';

import { Calendar, Users, MapPin, Search, ChevronDown, Minus, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  
  const locationRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      setIsLoadingLocations(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/hotels/cities`);
        if (response.ok) {
          const cities = await response.json();
          setLocations(cities);
        } else {
          setLocations([]);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        setLocations([]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchCities();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (guestRef.current && !guestRef.current.contains(event.target as Node)) {
        setShowGuestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (guests) params.append('guests', guests.toString());
    
    router.push(`/search?${params.toString()}`);
  };

  const handleSelectLocation = (loc: string) => {
    setLocation(loc);
    setShowLocationDropdown(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 relative z-40">
      <div className="bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-2 pl-6 flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
        
        {/* Location Section */}
        <div className="relative w-full md:flex-1 py-2 md:py-0 pr-4 group" ref={locationRef}>
          <div 
            className="flex flex-col cursor-pointer hover:bg-gray-50 rounded-2xl px-4 py-2 transition-all"
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
          >
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1 flex items-center gap-2">
              <MapPin size={14} className="text-orange-500" />
              Điểm đến
            </label>
            <input
              type="text"
              placeholder="Bạn muốn đi đâu?"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowLocationDropdown(true);
              }}
              className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 font-medium focus:outline-none truncate cursor-pointer"
            />
          </div>

          {/* Location Dropdown */}
          {showLocationDropdown && (
            <div className="absolute top-full left-0 mt-4 w-80 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 p-2 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {isLoadingLocations ? (
                  <div className="p-4 text-center text-gray-400 text-sm">Đang tải...</div>
                ) : locations.length > 0 ? (
                  locations
                    .filter(loc => loc.toLowerCase().includes(location.toLowerCase()))
                    .map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full text-left px-4 py-3 hover:bg-orange-50 rounded-xl text-gray-700 hover:text-orange-600 font-medium flex items-center gap-3 transition-colors"
                    >
                      <MapPin size={16} className="text-gray-400" />
                      {loc}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">Không tìm thấy địa điểm</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Check-in Section */}
        <div className="relative w-full md:w-auto md:min-w-[160px] py-2 md:py-0 px-4 group">
          <div className="flex flex-col cursor-pointer hover:bg-gray-50 rounded-2xl px-4 py-2 transition-all relative">
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Calendar size={14} className="text-orange-500" />
              Ngày nhận
            </label>
            <div className="relative">
              <input 
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className={`w-full bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full ${!checkIn ? 'text-transparent' : ''}`}
              />
              {!checkIn && (
                <span className="absolute left-0 top-0 text-sm text-gray-400 font-medium pointer-events-none">
                  Thêm ngày
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Check-out Section */}
        <div className="relative w-full md:w-auto md:min-w-[160px] py-2 md:py-0 px-4 group">
           <div className="flex flex-col cursor-pointer hover:bg-gray-50 rounded-2xl px-4 py-2 transition-all relative">
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Calendar size={14} className="text-orange-500" />
              Ngày trả
            </label>
            <div className="relative">
              <input 
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className={`w-full bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full ${!checkOut ? 'text-transparent' : ''}`}
              />
              {!checkOut && (
                <span className="absolute left-0 top-0 text-sm text-gray-400 font-medium pointer-events-none">
                  Thêm ngày
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Guests Section */}
        <div className="relative w-full md:w-auto md:min-w-[180px] py-2 md:py-0 px-4 group custom-dropdown" ref={guestRef}>
          <div 
            className="flex flex-col cursor-pointer hover:bg-gray-50 rounded-2xl px-4 py-2 transition-all"
            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
          >
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Users size={14} className="text-orange-500" />
              Khách
            </label>
            <div className="text-sm text-gray-700 font-medium truncate">
               {guests} Khách, 1 Phòng
            </div>
          </div>
          
           {showGuestDropdown && (
            <div className="absolute top-full right-0 mt-4 w-72 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200 cursor-default">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-800">Người lớn</h3>
                  <p className="text-xs text-gray-500">Từ 13 tuổi trở lên</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${guests <= 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:border-orange-500 hover:text-orange-500'}`}
                    disabled={guests <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center font-bold text-gray-800">{guests}</span>
                  <button 
                    onClick={() => setGuests(guests + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center hover:border-orange-500 hover:text-orange-500 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <div className="p-2">
          <button 
            onClick={handleSearch}
            className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white rounded-full p-4 shadow-lg shadow-orange-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 md:gap-0"
          >
            <Search size={24} strokeWidth={2.5} />
            <span className="md:hidden font-bold">Tìm kiếm</span>
          </button>
        </div>

      </div>
    </div>
  );
}
