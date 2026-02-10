import type { Metadata } from "next";
import { Poppins, Volkhov } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});

const volkhov = Volkhov({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-volkhov",
});

export const metadata: Metadata = {
  title: "AI-Booking - Hotel Booking System",
  description: "Hotel booking system with AI integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${poppins.variable} ${volkhov.variable} font-sans antialiased`}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
