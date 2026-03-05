// lib/useAIChat.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import { API_URL } from '@/lib/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RoomSuggestion {
  id: number;
  name: string;
  hotel_name: string;
  city: string;
  price: number;
  image_url?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  suggestions: RoomSuggestion[] | null;
  isTyping: boolean;
  isOpen: boolean;
  step: string;
}

export function useAIChat() {
  const messagesRef = useRef<ChatMessage[]>([]);

  // Keep ref in sync with state
  const [state, setStateInternal] = useState<ChatState>({
    messages: [
      {
        role: 'assistant',
        content:
          'Xin chào! Tôi là **BookingAI Assistant** 🤖\n\nTôi có thể giúp bạn tìm phòng khách sạn hoàn hảo tại Việt Nam!\nBạn muốn đi du lịch ở đâu? (Ví dụ: Đà Nẵng, Phú Quốc, Hội An, Sapa...)',
      },
    ],
    suggestions: null,
    isTyping: false,
    isOpen: false,
    step: 'greeting',
  });

  // Wrap setState so ref stays in sync
  const setState = useCallback((updater: ChatState | ((s: ChatState) => ChatState)) => {
    setStateInternal((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      messagesRef.current = next.messages;
      return next;
    });
  }, []);

  const openChat = useCallback(() => setState((s) => ({ ...s, isOpen: true })), [setState]);
  const closeChat = useCallback(() => setState((s) => ({ ...s, isOpen: false })), [setState]);
  const toggleChat = useCallback(() => setState((s) => ({ ...s, isOpen: !s.isOpen })), [setState]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: text };

    setState((s) => ({
      ...s,
      messages: [...s.messages, userMsg],
      isTyping: true,
      suggestions: null,
    }));

    try {
      // Use ref to get the up-to-date messages (avoids stale closure)
      const currentMessages = messagesRef.current;
      const historyToSend = [...currentMessages, userMsg];

      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_history: historyToSend.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply };

      setState((s) => ({
        ...s,
        messages: [...s.messages, assistantMsg],
        suggestions: data.suggestions || null,
        isTyping: false,
        step: data.step,
      }));
    } catch {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'Có lỗi xảy ra, vui lòng thử lại nhé! 😅',
      };
      setState((s) => ({
        ...s,
        messages: [...s.messages, errorMsg],
        isTyping: false,
      }));
    }
  }, [setState]);

  const resetChat = useCallback(() => {
    setState({
      messages: [
        {
          role: 'assistant',
          content:
            'Xin chào! Tôi là **BookingAI Assistant** 🤖\n\nTôi có thể giúp bạn tìm phòng khách sạn hoàn hảo tại Việt Nam!\nBạn muốn đi du lịch ở đâu? (Ví dụ: Đà Nẵng, Phú Quốc, Hội An, Sapa...)',
        },
      ],
      suggestions: null,
      isTyping: false,
      isOpen: true,
      step: 'greeting',
    });
  }, []);

  return { state, openChat, closeChat, toggleChat, sendMessage, resetChat };
}
