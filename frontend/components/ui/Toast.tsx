'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// Simple event bus for toasts
const listeners: ((toast: Toast) => void)[] = [];

export const toast = {
  success: (message: string) => emit({ id: Math.random().toString(), message, type: 'success' }),
  error: (message: string) => emit({ id: Math.random().toString(), message, type: 'error' }),
  info: (message: string) => emit({ id: Math.random().toString(), message, type: 'info' }),
  warning: (message: string) => emit({ id: Math.random().toString(), message, type: 'warning' }),
};

function emit(toast: Toast) {
  listeners.forEach((listener) => listener(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      // Auto dismiss after 3 seconds
      setTimeout(() => {
        removeToast(toast.id);
      }, 3000);
    };

    listeners.push(handler);
    return () => {
      const index = listeners.indexOf(handler);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md animate-in slide-in-from-right-full fade-in duration-300
            ${t.type === 'success' ? 'bg-white border-l-4 border-green-500 text-gray-800' : ''}
            ${t.type === 'error' ? 'bg-white border-l-4 border-red-500 text-gray-800' : ''}
            ${t.type === 'info' ? 'bg-white border-l-4 border-blue-500 text-gray-800' : ''}
            ${t.type === 'warning' ? 'bg-white border-l-4 border-yellow-500 text-gray-800' : ''}
          `}
        >
          <div className="flex-shrink-0">
            {t.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {t.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
          </div>
          <p className="text-sm font-medium flex-1">{t.message}</p>
          <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
