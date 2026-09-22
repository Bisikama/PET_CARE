import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left side: Banner (Hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <Image
          src="/hero-banner.jpg"
          alt="PetCare Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#0b1c30]/40 backdrop-blur-[2px]" />
        
        {/* Banner Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity">
            <div className="bg-white p-2 rounded-xl">
              <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight">PetCare</span>
          </Link>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Nền tảng chăm sóc thú cưng uy tín hàng đầu
            </h1>
          </div>
        </div>
      </div>

      {/* Right side: Auth forms */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        {/* Pattern Background for right side */}
        <div 
          className="absolute inset-0 z-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 24 24' fill='%23132742'%3E%3Cpath d='M12 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm-4.5-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6-4.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm3 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />
        
        <div className="w-full z-10 flex justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
