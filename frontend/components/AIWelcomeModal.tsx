// components/AIWelcomeModal.tsx
'use client';

import { useEffect, useState } from 'react';

interface AIWelcomeModalProps {
  onStartChat: () => void;
}

export default function AIWelcomeModal({ onStartChat }: AIWelcomeModalProps) {
  const [visible, setVisible] = useState(false);
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    // Only show on client, only if user is logged in and hasn't dismissed before
    if (typeof window === 'undefined') return;

    const user = localStorage.getItem('user');
    const alreadyShown = localStorage.getItem('ai_welcome_shown');

    if (user && !alreadyShown) {
      // Delay slightly so page finishes rendering
      const timer = setTimeout(() => {
        setVisible(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimIn(true));
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setAnimIn(false);
    setTimeout(() => setVisible(false), 300);
    localStorage.setItem('ai_welcome_shown', 'true');
  };

  const handleStart = () => {
    dismiss();
    setTimeout(() => onStartChat(), 350);
  };

  const handleLater = () => {
    dismiss();
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-300
        ${animIn ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
        onClick={handleLater}
      />

      {/* Modal Card */}
      <div
        className={`relative z-10 w-full max-w-sm rounded-3xl bg-white shadow-2xl transition-all duration-300
          ${animIn ? 'scale-100 translate-y-0' : 'scale-95 translate-y-6'}`}
        style={{ boxShadow: '0 20px 80px rgba(249, 115, 22, 0.25)' }}
      >
        {/* Top gradient banner */}
        <div
          className="rounded-t-3xl px-6 pt-8 pb-6 text-center text-white"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)' }}
        >
          {/* AI Avatar */}
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-5xl shadow-lg">
            🤖
          </div>
          <h2 className="text-xl font-bold leading-snug">Chào mừng bạn đến BookingAI!</h2>
          <p className="mt-1 text-sm text-orange-100">Trợ lý đặt phòng thông minh của bạn</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-center text-sm leading-relaxed text-gray-600">
            Tôi có thể giúp bạn{' '}
            <span className="font-semibold text-orange-600">tìm phòng khách sạn hoàn hảo</span>{' '}
            dựa trên sở thích và ngân sách của bạn tại hơn 1 triệu điểm nghỉ dưỡng trên khắp
            Việt Nam.
          </p>

          {/* Feature chips */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['🏨 Gợi ý thông minh', '💰 Giá tốt nhất', '⚡ Tìm kiếm nhanh'].map((f) => (
              <span
                key={f}
                className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 border border-orange-100"
              >
                {f}
              </span>
            ))}
          </div>

          {/* CTA question */}
          <p className="mt-5 text-center text-sm font-semibold text-gray-800">
            Bạn muốn tôi hỗ trợ tìm phòng ngay bây giờ không?
          </p>

          {/* Action buttons */}
          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={handleStart}
              className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-98"
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)' }}
            >
              ✨ Bắt đầu tư vấn ngay
            </button>
            <button
              onClick={handleLater}
              className="w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-700"
            >
              Để sau
            </button>
          </div>
        </div>

        {/* Close X */}
        <button
          onClick={handleLater}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
