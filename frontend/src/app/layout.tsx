import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Pet Care - Hệ thống quản lý chăm sóc thú cưng',
  description: 'Hệ thống quản lý đặt lịch, dịch vụ và hồ sơ thú cưng chuyên nghiệp.',
  keywords: ['pet care', 'chăm sóc thú cưng', 'đặt lịch thú cưng', 'quản lý thú cưng'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="font-sans min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
