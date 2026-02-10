// File: frontend/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar({ variant = 'transparent' }: { variant?: 'transparent' | 'dark' }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const textColor = variant === 'transparent' ? 'text-white' : 'text-gray-800';
  const logoColor = variant === 'transparent' ? 'text-white' : 'text-gray-900';
  const borderColor = variant === 'transparent' ? 'border-white text-white hover:bg-white hover:text-black' : 'border-gray-300 text-gray-700 hover:bg-gray-100';

  return (
    <nav className={`absolute top-0 z-50 w-full px-8 py-6 ${variant === 'dark' ? 'bg-white shadow-sm relative' : ''}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link href="/" className={`text-2xl font-bold drop-shadow-md ${logoColor}`}>
          Booking<span className="text-orange-400">AI</span>
        </Link>

        {/* Menu */}
        <div className="hidden gap-8 md:flex">
          <Link href="/" className={`text-sm font-medium transition hover:text-orange-300 drop-shadow-sm ${textColor}`}>
            Home
          </Link>
          <Link href="/about" className={`text-sm font-medium transition hover:text-orange-300 drop-shadow-sm ${textColor}`}>
            About Us
          </Link>
          <Link href="/premium" className={`text-sm font-medium transition hover:text-orange-300 drop-shadow-sm ${textColor}`}>
            Premium
          </Link>
          <Link href="/blogs" className={`text-sm font-medium transition hover:text-orange-300 drop-shadow-sm ${textColor}`}>
            Blogs
          </Link>
        </div>

        {/* Nút Action */}
        <div className="flex gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-4">
               <Link 
                 href="/booking/history" 
                 className={`text-sm font-medium transition hover:text-orange-300 drop-shadow-sm ${textColor}`}
               >
                 Lịch sử chuyến đi
               </Link>
               <span className={`text-sm font-medium ${textColor}`}>Hi, {user.full_name}</span>
               <button 
                onClick={handleLogout}
                className="rounded-full bg-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-300"
               >
                 Logout
               </button>
            </div>
          ) : (
             <div className="flex gap-4">
                <Link href="/login" className={`rounded-full border px-6 py-2 text-sm font-medium transition ${borderColor}`}>
                    Đăng Nhập
                </Link>
                <Link href="/register" className="rounded-full bg-orange-500 px-6 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-orange-600">
                    Đăng Ký
                </Link>
             </div>
          )}
        </div>
      </div>
    </nav>
  );
}

