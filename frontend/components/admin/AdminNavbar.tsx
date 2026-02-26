'use client';

import { useEffect, useState } from 'react';
import { Bell, Shield } from 'lucide-react';

interface AdminUser {
  full_name: string;
  email: string;
  role: string;
}

interface AdminNavbarProps {
  title: string;
}

export default function AdminNavbar({ title }: AdminNavbarProps) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        setAdminUser(JSON.parse(raw));
      } catch {}
    }
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
        </button>

        {/* Admin badge */}
        <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
            <Shield size={16} className="text-orange-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-800 leading-tight">
              {adminUser?.full_name || 'Admin'}
            </p>
            <p className="text-xs text-orange-500 font-medium">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
