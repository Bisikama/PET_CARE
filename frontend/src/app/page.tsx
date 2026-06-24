'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  CalendarCheck2,
  HeartHandshake,
  Search,
  Award,
  Sparkles,
  Clock,
  CreditCard,
  Lock,
  CheckCircle2,
  Menu,
  X,
  ChevronRight,
  Star,
  Users,
  ShieldAlert,
  ArrowRight,
  Check,
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#08243D]/5 select-none font-sans">
      {/* 1. Header/Navbar Cố Định Phía Trên */}
      <header className="sticky top-0 z-50 w-full bg-[#08243D]/90 backdrop-blur-md border-b border-slate-800/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto h-20 px-6 md:px-12 flex items-center justify-between">
          
          {/* Logo PetCare bên trái */}
          <Link href={ROUTES.LANDING} className="flex items-center gap-3 select-none group">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border border-[#F7C948]/30 bg-[#0B2A47] flex items-center justify-center shadow-lg">
              <Image
                src="/logo.png"
                alt="PetCare Logo"
                fill
                priority
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#F7C948] to-[#ffd866] bg-clip-text text-transparent tracking-wide">
              PetCare
            </span>
          </Link>

          {/* Menu chính ở giữa */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#trang-chu" className="hover:text-[#F7C948] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#F7C948] after:transition-all">Trang chủ</a>
            <a href="#dich-vu" className="hover:text-[#F7C948] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#F7C948] after:transition-all">Dịch vụ</a>
            <a href="#tim-provider" className="hover:text-[#F7C948] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#F7C948] after:transition-all">Tìm Provider</a>
            <a href="#cach-hoat-dong" className="hover:text-[#F7C948] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#F7C948] after:transition-all">Cách hoạt động</a>
          </nav>

          {/* Nút hành động bên phải */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href={ROUTES.REGISTER}>
              <span className="text-sm font-semibold text-[#F7C948] hover:text-[#ffd866] transition-colors cursor-pointer">
                Trở thành Provider
              </span>
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <Link href={ROUTES.LOGIN}>
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/40 text-sm font-semibold h-10 border border-slate-700/60 rounded-xl px-4 transition-all">
                Đăng nhập
              </Button>
            </Link>
            <Link href={ROUTES.REGISTER}>
              <button className="h-10 px-5 text-sm font-bold bg-gradient-to-r from-[#F7C948] to-[#f3b51a] hover:from-[#ffe066] hover:to-[#f3b51a] text-[#08243D] rounded-xl shadow-lg hover:shadow-yellow-500/10 active:scale-95 transition-all">
                Đặt lịch ngay
              </button>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-slate-300 hover:text-[#F7C948] p-2 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#08243D] border-t border-slate-800/60 px-6 py-6 space-y-4 animate-slide-down">
            <nav className="flex flex-col gap-4 text-sm font-semibold text-slate-300">
              <a href="#trang-chu" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F7C948] py-2 transition-colors border-b border-slate-800/40">Trang chủ</a>
              <a href="#dich-vu" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F7C948] py-2 transition-colors border-b border-slate-800/40">Dịch vụ</a>
              <a href="#tim-provider" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F7C948] py-2 transition-colors border-b border-slate-800/40">Tìm Provider</a>
              <a href="#cach-hoat-dong" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F7C948] py-2 transition-colors border-b border-slate-800/40">Cách hoạt động</a>
            </nav>
            <div className="pt-4 flex flex-col gap-3">
              <Link href={ROUTES.REGISTER} onClick={() => setMobileMenuOpen(false)}>
                <div className="w-full text-center py-2 text-sm font-semibold text-[#F7C948] hover:underline">
                  Trở thành Provider
                </div>
              </Link>
              <Link href={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800/50">
                  Đăng nhập
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER} onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full py-3 text-sm font-bold bg-gradient-to-r from-[#F7C948] to-[#f3b51a] hover:from-[#ffe066] text-[#08243D] rounded-xl shadow-lg">
                  Đặt lịch ngay
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section Nền Xanh Navy Đậm */}
      <section id="trang-chu" className="bg-[#08243D] text-white pt-16 pb-20 md:py-24 relative overflow-hidden border-b border-slate-900/60">
        
        {/* Background Decorative SVG Lines and Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0B2A47]/60 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute top-10 right-10 opacity-10 pointer-events-none animate-spin-slow">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-48 h-48 text-[#F7C948]">
            <circle cx="8" cy="6" r="2.5" />
            <circle cx="16" cy="6" r="2.5" />
            <circle cx="4.5" cy="11.5" r="2.5" />
            <circle cx="19.5" cy="11.5" r="2.5" />
            <path d="M12 10.5c-3 0-5.5 2-5.5 5.5s2.5 5 5.5 5 5.5-1.5 5.5-5-2.5-5.5-5.5-5.5z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center">
          
          {/* Paw Icon Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/65 backdrop-blur-md border border-slate-800 text-[#F7C948] text-xs font-bold tracking-wider uppercase mb-6 animate-pulse">
            <Sparkles className="h-4 w-4 text-[#F7C948]" />
            Dịch vụ chuyên nghiệp hàng đầu
          </div>

          {/* Tiêu đề lớn: PetCare */}
          <h1 className="text-center font-extrabold text-[#F7C948] tracking-widest text-6xl md:text-8xl mb-4 font-serif drop-shadow-md select-none">
            PetCare
          </h1>

          {/* Subtitle */}
          <p className="text-center text-lg md:text-2xl font-medium text-slate-200 max-w-xl mx-auto leading-relaxed mb-3">
            Chăm sóc thú cưng tại nhà – An toàn, tiện lợi, tận tâm
          </p>

          {/* Subtitle Quote */}
          <p className="text-center text-xs md:text-sm italic text-slate-400 max-w-md mx-auto mb-10 font-light tracking-wide">
            "We are pet care with the best care, and never make your pet scare."
          </p>

  

          {/* Poster chính và Bong bóng dịch vụ bao quanh (Visual Composition) */}
          <div className="relative w-full max-w-4xl mx-auto min-h-[460px] md:min-h-[600px] flex flex-col md:flex-row items-center justify-center my-6 gap-8">
            
            {/* Center Hero Poster Container */}
            <div className="relative z-10 w-[260px] sm:w-[320px] md:w-[380px] aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-4 border-slate-800/90 bg-slate-950 flex flex-col group transition-all duration-500 hover:scale-[1.02]">
              <Image
                src="/hero-banner.jpg"
                alt="PetCare Hero Banner Poster"
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gold gradient subtle light overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-[#F7C948]/5 opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>

            {/* FLOATING SERVICE BUBBLES - Absolute on desktop, clean flex on mobile */}
            
            {/* Bubble 1: TẮM RỬA */}
            <div className="absolute md:-translate-x-0 md:-translate-y-0 top-0 left-2 md:top-8 md:left-[80px] lg:left-[120px] z-20 group hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center">
              <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-slate-800 group-hover:border-[#F7C948] shadow-2xl transition-all duration-300 bg-slate-900/60 backdrop-blur-md">
                <Image
                  src="/dog-bathing.jpg"
                  alt="Tắm rửa"
                  fill
                  className="object-cover group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-300" />
              </div>
              <span className="mt-2.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[#F7C948] text-[10px] md:text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap uppercase tracking-wider">
                Tắm rửa
              </span>
            </div>

            {/* Bubble 2: CẮT MÓNG */}
            <div className="absolute md:-translate-x-0 md:-translate-y-0 top-0 right-2 md:top-12 md:right-[80px] lg:right-[120px] z-20 group hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center">
              <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-slate-800 group-hover:border-[#F7C948] shadow-2xl transition-all duration-300 bg-slate-900/60 backdrop-blur-md">
                <Image
                  src="/cắt-móng.jpg"
                  alt="Cắt móng"
                  fill
                  className="object-cover group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-300" />
              </div>
              <span className="mt-2.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[#F7C948] text-[10px] md:text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap uppercase tracking-wider">
                Cắt móng
              </span>
            </div>

            {/* Bubble 3: TỈA LÔNG */}
            <div className="absolute md:-translate-x-0 md:-translate-y-0 bottom-0 right-2 md:bottom-16 md:right-[60px] lg:right-[100px] z-20 group hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center">
              <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-slate-800 group-hover:border-[#F7C948] shadow-2xl transition-all duration-300 bg-slate-900/60 backdrop-blur-md">
                <Image
                  src="/tỉa-lông.jpg"
                  alt="Tỉa lông"
                  fill
                  className="object-cover group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-300" />
              </div>
              <span className="mt-2.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[#F7C948] text-[10px] md:text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap uppercase tracking-wider">
                Tỉa lông
              </span>
            </div>

            {/* Bubble 4: CHĂM SÓC CƠ BẢN */}
            <div className="absolute md:-translate-x-0 md:-translate-y-0 bottom-0 left-2 md:bottom-20 md:left-[60px] lg:left-[100px] z-20 group hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center">
              <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-slate-800 group-hover:border-[#F7C948] shadow-2xl transition-all duration-300 bg-slate-900/60 backdrop-blur-md">
                <Image
                  src="/cat.jpg"
                  alt="Chăm sóc cơ bản"
                  fill
                  className="object-cover group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-300" />
              </div>
              <span className="mt-2.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[#F7C948] text-[10px] md:text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap uppercase tracking-wider">
                Chăm sóc cơ bản
              </span>
            </div>

            {/* Card giới thiệu ngắn bên trái giống mockup */}
            <div className="absolute bottom-4 left-4 md:bottom-24 md:-left-32 z-35 max-w-[210px] md:max-w-[260px] bg-[#0B2A47]/85 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-[#F7C948]/20 transition-all duration-300 text-left hidden sm:block">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Về PetCare</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                <strong>PetCare</strong> là website đặt lịch chăm sóc thú cưng trực tuyến hàng đầu. Chúng tôi cung cấp giải pháp toàn diện bao gồm tắm rửa, chải lông, cắt móng, tỉa lông và chăm sóc cơ bản cho cún & mèo yêu một cách thuận tiện, an toàn và chuyên nghiệp nhất ngay tại không gian nhà bạn.
              </p>
            </div>

            {/* Decorative Paw print details */}
            <div className="absolute top-1/2 left-8 opacity-20 pointer-events-none hidden md:block">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#F7C948]">
                <circle cx="8" cy="6" r="2.5" />
                <circle cx="16" cy="6" r="2.5" />
                <circle cx="4.5" cy="11.5" r="2.5" />
                <circle cx="19.5" cy="11.5" r="2.5" />
                <path d="M12 10.5c-3 0-5.5 2-5.5 5.5s2.5 5 5.5 5 5.5-1.5 5.5-5-2.5-5.5-5.5-5.5z" />
              </svg>
            </div>
            
          </div>

        </div>
      </section>

      {/* 3. Trust Bar 4 Items */}
      <section className="bg-[#0B2A47] border-b border-slate-900/40 relative z-20 py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 items-center">
            
            {/* Item 1: AN TOÀN */}
            <div className="flex flex-col items-center text-center p-4 hover:bg-slate-900/25 rounded-2xl transition-all group">
              <div className="w-12 h-12 rounded-full bg-slate-900/60 border border-[#F7C948]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6 text-[#F7C948]" />
              </div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">An Toàn</h4>
              <p className="text-xs text-slate-400 max-w-[160px]">Bảo hiểm dịch vụ & thông tin xác minh rõ ràng</p>
            </div>

            {/* Item 2: TIỆN LỢI */}
            <div className="flex flex-col items-center text-center p-4 hover:bg-slate-900/25 rounded-2xl transition-all group">
              <div className="w-12 h-12 rounded-full bg-slate-900/60 border border-[#F7C948]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-[#F7C948]" />
              </div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Tiện Lợi</h4>
              <p className="text-xs text-slate-400 max-w-[160px]">Chăm sóc tại nhà, đặt lịch trực tuyến 30 giây</p>
            </div>

            {/* Item 3: TẬN TÂM */}
            <div className="flex flex-col items-center text-center p-4 hover:bg-slate-900/25 rounded-2xl transition-all group">
              <div className="w-12 h-12 rounded-full bg-slate-900/60 border border-[#F7C948]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HeartHandshake className="h-6 w-6 text-[#F7C948]" />
              </div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Tận Tâm</h4>
              <p className="text-xs text-slate-400 max-w-[160px]">Yêu thương và nâng niu thú cưng như gia đình</p>
            </div>

            {/* Item 4: ĐÁNG TIN CẬY */}
            <div className="flex flex-col items-center text-center p-4 hover:bg-slate-900/25 rounded-2xl transition-all group">
              <div className="w-12 h-12 rounded-full bg-slate-900/60 border border-[#F7C948]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6 text-[#F7C948]" />
              </div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Đáng Tin Cậy</h4>
              <p className="text-xs text-slate-400 max-w-[160px]">Hơn 10k đánh giá 5 sao xuất sắc</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Section Escrow: Thanh Toán An Toàn 100% */}
      <section id="cach-hoat-dong" className="py-20 px-6 md:px-12 bg-white relative">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="flex flex-col items-center space-y-6">
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F7C948]/10 text-[#f3b51a]">
              🛡️ BẢO VỆ GIAO DỊCH KHÁCH HÀNG
            </span>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#08243D] leading-tight max-w-2xl">
              Thanh Toán An Toàn 100% Qua Hệ Thống Escrow
            </h2>
            
            <p className="text-slate-600 leading-relaxed text-sm md:text-base max-w-2xl mx-auto">
              Sự tin cậy và minh bạch là giá trị cốt lõi tại PetCare. Chúng tôi áp dụng quy trình thanh toán trung gian (Escrow) tiên tiến nhất để đảm bảo an tâm tuyệt đối cho khách hàng.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 pt-4 text-left max-w-2xl w-full mx-auto">
              <div className="flex gap-3 items-start bg-slate-50/80 p-4 rounded-2xl border border-slate-100 hover:shadow-sm transition-all">
                <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-[#08243D]">Tạm giữ phí an toàn</h5>
                  <p className="text-xs text-slate-500 mt-0.5">Tiền được giữ bởi hệ thống trong suốt thời gian dịch vụ.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-slate-50/80 p-4 rounded-2xl border border-slate-100 hover:shadow-sm transition-all">
                <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-[#08243D]">Hoàn tiền 100%</h5>
                  <p className="text-xs text-slate-500 mt-0.5">Cam kết hoàn lại chi phí nếu Provider không thực hiện dịch vụ.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-slate-50/80 p-4 rounded-2xl border border-slate-100 hover:shadow-sm transition-all">
                <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-[#08243D]">Xác nhận trước khi chuyển</h5>
                  <p className="text-xs text-slate-500 mt-0.5">Hệ thống chỉ giải ngân sau khi có sự chấp thuận từ bạn.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-slate-50/80 p-4 rounded-2xl border border-slate-100 hover:shadow-sm transition-all">
                <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-[#08243D]">Hỗ trợ tranh chấp 24/7</h5>
                  <p className="text-xs text-slate-500 mt-0.5">Đội ngũ CSKH hỗ trợ xử lý sự cố hoặc khiếu nại tức thì.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-wrap gap-4 justify-center">
              <Link href={ROUTES.REGISTER}>
                <button className="h-12 px-8 bg-[#08243D] hover:bg-[#0B2A47] text-white font-bold text-sm rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2">
                  Đặt lịch an tâm ngay <ChevronRight className="h-4 w-4" />
                </button>
              </Link>
              <a href="#dich-vu">
                <Button variant="outline" className="border-slate-300 hover:bg-slate-50 text-slate-700 h-12 text-sm font-semibold rounded-xl px-8">Tìm hiểu thêm</Button>
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Services Section (Additional Visual Detail for Landing Page) */}
      <section id="dich-vu" className="py-20 px-6 md:px-12 bg-slate-50 border-t border-slate-200/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#f3b51a] tracking-widest uppercase bg-[#F7C948]/10 px-3 py-1.5 rounded-full">
              Dịch vụ nổi bật
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#08243D] mt-4">
              Chúng Tôi Chăm Sóc Bé Yêu Như Thế Nào?
            </h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              Các gói dịch vụ tiêu chuẩn 5 sao được thực hiện bởi các chuyên gia chăm sóc thú cưng (Provider) giàu kinh nghiệm.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Service 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-[#F7C948]/20 hover:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col group">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                <Image
                  src="/dog-bathing.jpg"
                  alt="Dịch vụ Tắm rửa thú cưng"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-extrabold text-base text-[#08243D] mb-2 uppercase tracking-wide">Tắm Rửa</h3>
              <p className="text-slate-500 text-xs leading-relaxed flex-1">
                Tắm sấy khô, chải tơi lông, vệ sinh tai, xịt nước hoa dưỡng lông cao cấp giúp bé luôn sạch sẽ và thơm mát.
              </p>
              <Link href={ROUTES.REGISTER} className="mt-4 flex items-center gap-1 text-xs font-bold text-[#0B2A47] hover:text-[#F7C948] transition-colors">
                Đặt lịch tắm rửa <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Service 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-[#F7C948]/20 hover:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col group">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                <Image
                  src="/cắt-móng.jpg"
                  alt="Dịch vụ Cắt móng thú cưng"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-extrabold text-base text-[#08243D] mb-2 uppercase tracking-wide">Cắt Móng</h3>
              <p className="text-slate-500 text-xs leading-relaxed flex-1">
                Cắt tỉa móng và mài dũa góc cạnh cẩn thận, tránh trầy xước và đau đớn khi bé di chuyển hoặc đùa nghịch.
              </p>
              <Link href={ROUTES.REGISTER} className="mt-4 flex items-center gap-1 text-xs font-bold text-[#0B2A47] hover:text-[#F7C948] transition-colors">
                Đặt lịch cắt móng <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Service 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-[#F7C948]/20 hover:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col group">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                <Image
                  src="/tỉa-lông.jpg"
                  alt="Dịch vụ Tỉa lông chải lông"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-extrabold text-base text-[#08243D] mb-2 uppercase tracking-wide">Tỉa lông & Chải lông</h3>
              <p className="text-slate-500 text-xs leading-relaxed flex-1">
                Loại bỏ lông rụng thừa, cắt tạo kiểu thẩm mỹ thời thượng, gỡ rối tối ưu phù hợp với từng giống chó mèo.
              </p>
              <Link href={ROUTES.REGISTER} className="mt-4 flex items-center gap-1 text-xs font-bold text-[#0B2A47] hover:text-[#F7C948] transition-colors">
                Đặt lịch tỉa lông <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Service 4 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-[#F7C948]/20 hover:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col group">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                <Image
                  src="/cat.jpg"
                  alt="Dịch vụ Chăm sóc cơ bản"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-extrabold text-base text-[#08243D] mb-2 uppercase tracking-wide">Chăm Sóc Cơ Bản</h3>
              <p className="text-slate-500 text-xs leading-relaxed flex-1">
                Combo vệ sinh mắt mũi tai miệng chuyên nghiệp, vệ sinh tuyến hôi và kiểm tra sức khỏe tổng quan cơ bản.
              </p>
              <Link href={ROUTES.REGISTER} className="mt-4 flex items-center gap-1 text-xs font-bold text-[#0B2A47] hover:text-[#F7C948] transition-colors">
                Đặt lịch chăm sóc <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Section Escrow Provider (CTA) */}
      <section id="tim-provider" className="py-20 px-6 md:px-12 bg-[#08243D] text-white text-center relative overflow-hidden border-t border-slate-900">
        <div className="absolute top-1/2 left-10 opacity-5 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-64 h-64 text-[#F7C948]">
            <circle cx="8" cy="6" r="2.5" />
            <circle cx="16" cy="6" r="2.5" />
            <circle cx="4.5" cy="11.5" r="2.5" />
            <circle cx="19.5" cy="11.5" r="2.5" />
            <path d="M12 10.5c-3 0-5.5 2-5.5 5.5s2.5 5 5.5 5 5.5-1.5 5.5-5-2.5-5.5-5.5-5.5z" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Bạn Muốn Thu Nhập Từ Việc Chăm Sóc Thú Cưng?
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Tham gia vào mạng lưới Provider chuyên nghiệp của PetCare. Chúng tôi giúp bạn quản lý lịch đặt hẹn, xử lý thanh toán tự động an toàn qua hệ thống Escrow và tiếp cận hàng nghìn khách hàng xung quanh bạn.
          </p>
          <div className="pt-4 flex flex-wrap gap-4 justify-center">
            <Link href={ROUTES.REGISTER}>
              <button className="h-12 px-8 font-bold bg-[#F7C948] hover:bg-[#ffe066] text-[#08243D] rounded-xl shadow-lg hover:shadow-yellow-500/10 active:scale-95 transition-all text-sm">
                Đăng ký làm Provider ngay
              </button>
            </Link>
            <Link href={ROUTES.LOGIN}>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/40 h-12 text-sm font-semibold rounded-xl">
                Đăng nhập tài khoản
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer đầy đủ thông tin PetCare */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 md:px-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-12">
            
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <Link href={ROUTES.LANDING} className="flex items-center gap-2 select-none group">
                <div className="relative w-8 h-8 overflow-hidden rounded-full border border-[#F7C948]/20 bg-[#0B2A47] flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="PetCare Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#F7C948] to-[#ffda73] bg-clip-text text-transparent tracking-wide">
                  PetCare
                </span>
              </Link>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Mạng lưới đặt lịch dịch vụ chăm sóc sức khỏe, tắm rửa, tỉa lông, cắt móng cho cún mèo chuyên nghiệp hàng đầu ngay tại nhà của bạn.
              </p>
              <div className="flex gap-2.5 text-xs text-slate-500">
                <span>Email: contact@petcare.com</span>
                <span>•</span>
                <span>Hotline: 1900 8888</span>
              </div>
            </div>

            {/* Column 2: Links - Dịch vụ */}
            <div className="space-y-3">
              <h5 className="text-white text-xs uppercase font-extrabold tracking-wider">Dịch vụ</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#dich-vu" className="hover:text-[#F7C948] transition-colors">Tắm rửa vệ sinh</a></li>
                <li><a href="#dich-vu" className="hover:text-[#F7C948] transition-colors">Cắt tỉa móng chân</a></li>
                <li><a href="#dich-vu" className="hover:text-[#F7C948] transition-colors">Tỉa tạo kiểu lông</a></li>
                <li><a href="#dich-vu" className="hover:text-[#F7C948] transition-colors">Chăm sóc tai mắt miệng</a></li>
              </ul>
            </div>

            {/* Column 3: Links - Về chúng tôi */}
            <div className="space-y-3">
              <h5 className="text-white text-xs uppercase font-extrabold tracking-wider">Tìm hiểu thêm</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#tim-provider" className="hover:text-[#F7C948] transition-colors">Trở thành đối tác</a></li>
                <li><a href="#cach-hoat-dong" className="hover:text-[#F7C948] transition-colors">Phương thức hoạt động</a></li>
                <li><a href="#trang-chu" className="hover:text-[#F7C948] transition-colors">Câu hỏi thường gặp</a></li>
                <li><a href="#cach-hoat-dong" className="hover:text-[#F7C948] transition-colors">Chính sách bảo mật</a></li>
              </ul>
            </div>

            {/* Column 4: Links - Escrow Trust */}
            <div className="space-y-3">
              <h5 className="text-white text-xs uppercase font-extrabold tracking-wider">Thanh toán an toàn</h5>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Lock className="h-3.5 w-3.5 shrink-0" /> Escrow Protected
                </li>
                <li>Hệ thống ký quỹ tạm giữ phí bảo mật 100%.</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} PetCare System. Bảo lưu mọi quyền.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
              <a href="#" className="hover:text-white transition-colors">Chính sách Escrow</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
