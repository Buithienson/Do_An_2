import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel — AI-Booking',
  description: 'Trang quản trị hệ thống AI-Booking',
  robots: 'noindex, nofollow',
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // The auth guard is handled client-side in AdminLayout component
  // because Next.js layout files cannot access localStorage (server-side)
  return <>{children}</>;
}
