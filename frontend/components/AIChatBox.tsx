// components/AIChatBox.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAIChat, ChatState, RoomSuggestion } from '@/lib/useAIChat';

// ─── Markdown renderer (bold only) ───────────────────────────────────────────
function renderMd(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-orange-600">{part}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ─── Mini room card ───────────────────────────────────────────────────────────
function RoomCard({ room }: { room: RoomSuggestion }) {
  return (
    <Link
      href={`/rooms/${room.id}`}
      className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50 p-3 hover:bg-orange-100 transition-colors"
    >
      <div
        className="h-14 w-14 flex-shrink-0 rounded-lg bg-gray-200 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: room.image_url ? `url(${room.image_url})` : undefined }}
      >
        {!room.image_url && (
          <div className="flex h-full w-full items-center justify-center text-2xl">🏨</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">{room.name}</p>
        <p className="truncate text-xs text-gray-500">{room.hotel_name} · {room.city}</p>
        <p className="text-xs font-bold text-orange-600">
          {room.price.toLocaleString('vi-VN')}đ<span className="font-normal text-gray-400">/đêm</span>
        </p>
      </div>
    </Link>
  );
}

// ─── Props interface (supports both standalone and controlled) ────────────────
interface AIChatBoxProps {
  /** Pass external state + handlers when orchestrated by AIAssistant */
  externalState?: ChatState;
  onToggle?: () => void;
  onSend?: (text: string) => void;
  onReset?: () => void;
}

export default function AIChatBox({ externalState, onToggle, onSend, onReset }: AIChatBoxProps) {
  // Use internal hook only when no external state provided
  const internal = useAIChat();
  const state   = externalState ?? internal.state;
  const toggle  = onToggle  ?? internal.toggleChat;
  const send    = onSend    ?? internal.sendMessage;
  const reset   = onReset   ?? internal.resetChat;

  const [input, setInput] = useState('');
  const messagesEndRef    = useRef<HTMLDivElement>(null);
  const inputRef          = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.suggestions, state.isTyping]);

  useEffect(() => {
    if (state.isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [state.isOpen]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || state.isTyping) return;
    setInput('');
    send(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {/* ── Chat Panel ─────────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-24 right-6 z-[9998] flex flex-col rounded-2xl shadow-2xl
          transition-all duration-300 ease-in-out overflow-hidden
          ${state.isOpen
            ? 'w-[370px] opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'w-[370px] opacity-0 scale-95 translate-y-4 pointer-events-none'
          }`}
        style={{
          maxHeight: state.isOpen ? '580px' : '0px',
          background: 'linear-gradient(135deg,#fff8f5 0%,#ffffff 100%)',
        }}
      >
        {/* Header */}
        <div
          className="flex flex-shrink-0 items-center justify-between px-4 py-3 text-white"
          style={{ background: 'linear-gradient(135deg,#f97316 0%,#ea580c 100%)' }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">🤖</div>
            <div>
              <p className="text-sm font-bold leading-tight">BookingAI Assistant</p>
              <p className="text-xs text-orange-100">Trợ lý đặt phòng thông minh</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Reset */}
            <button onClick={reset} title="Cuộc hội thoại mới"
              className="rounded-full p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
              </svg>
            </button>
            {/* Close */}
            <button onClick={toggle}
              className="rounded-full p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: '400px' }}>
          {state.messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm">🤖</div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line
                ${msg.role === 'user'
                  ? 'rounded-tr-sm bg-orange-500 text-white'
                  : 'rounded-tl-sm bg-white text-gray-800 shadow-sm border border-orange-50'}`}>
                {renderMd(msg.content)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {state.isTyping && (
            <div className="flex justify-start">
              <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm">🤖</div>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm border border-orange-50">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-orange-400"
                    style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}

          {/* Room suggestions */}
          {state.suggestions && state.suggestions.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Gợi ý phòng</p>
              {state.suggestions.map((room) => <RoomCard key={room.id} room={room} />)}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-orange-100 px-3 py-3">
          <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2
            focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              disabled={state.isTyping}
              className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400 disabled:opacity-60"
            />
            <button onClick={handleSend} disabled={!input.trim() || state.isTyping}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white
                transition hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Floating Robot Button ───────────────────────────────────────────── */}
      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-[9999] flex h-14 w-14 items-center justify-center
          rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg,#f97316 0%,#dc2626 100%)',
          boxShadow: '0 4px 24px rgba(249,115,22,0.5)',
        }}
        title={state.isOpen ? 'Đóng chat' : 'Mở AI Chat'}
      >
        {state.isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        ) : (
          <span className="text-2xl select-none">🤖</span>
        )}
        {!state.isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping bg-orange-400 opacity-30 pointer-events-none" />
        )}
      </button>
    </>
  );
}
