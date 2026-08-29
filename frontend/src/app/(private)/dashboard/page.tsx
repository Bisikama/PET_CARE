'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { Heart, Mail, Plus, Shield, Sparkles, User, AlertCircle, Check, HelpCircle, Briefcase, LayoutDashboard, ClipboardList, Database, ShieldCheck, Gavel, BarChart3, Activity } from 'lucide-react';
import { PetList, usePetStore } from '@/features/pet';
import { useMeStore } from '@/features/me';
import { ProviderHeader, useProvider } from '@/features/provider';
import { AdminHeader, PartnerVerificationList } from '@/features/admin';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const { openModal: openProfileModal } = useMeStore();
  const { openModal: openPetModal } = usePetStore();
  const { openModal: openProviderModal } = useProvider();
  const [providerTab, setProviderTab] = React.useState('active-cases');
  const adminTab = searchParams.get('tab') || 'verify-partners';

  if (user?.role === 'ADMIN') {
    return (
      <div className="space-y-8 animate-fade-in animate-scale-up">
        {/* Admin Header Component */}
        <AdminHeader />
        
        {/* Tab Content Panel */}
        {adminTab === 'verify-partners' ? (
          <PartnerVerificationList />
        ) : (
          <div className="bg-white p-12 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-teal-50 text-teal-600 rounded-3xl">
              <Shield className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">Bảng điều khiển & Chức năng</h3>
              <p className="text-slate-400 text-xs md:text-sm max-w-sm">
                Tính năng này đang được thiết lập kết nối dữ liệu. Vui lòng quay lại sau.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (user?.role === 'PROVIDER') {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Provider Header Component */}
        <ProviderHeader activeTab={providerTab} onTabChange={setProviderTab} />
        
        {/* Tab Contents */}
        {providerTab === 'active-cases' && (
          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
                  Danh sách ca chăm sóc thực tế
                </h3>
                <p className="text-slate-400 text-xs font-medium">
                  Lịch làm việc và các ca chăm sóc thú cưng được phân bổ hôm nay.
                </p>
              </div>
            </div>
            {/* Mock active case */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-3xl transition-all duration-200">
                <div className="flex gap-4">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                    <img 
                      src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop&q=80" 
                      alt="Bé Lu" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-base truncate">Bé Lu</span>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[10px] font-bold shrink-0">
                        Poodle
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs md:text-sm font-medium">
                      Chăm sóc tại nhà • 14:00 - 18:00
                    </p>
                    <p className="text-slate-400 text-[11px]">Chủ nuôi: Trần Quốc Bảo</p>
                  </div>
                </div>
                <div className="text-left sm:text-right space-y-1 self-start sm:self-center">
                  <p className="font-extrabold text-slate-800 text-base">120.000 đ</p>
                  <span className="inline-flex px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold">
                    Đang diễn ra
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {providerTab === 'onboarding' && (
          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-1 pb-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
                Tiến trình onboarding & xác minh
              </h3>
              <p className="text-slate-400 text-xs font-medium">
                Hoàn thành các bước dưới đây để tài khoản của bạn được kiểm duyệt và kích hoạt đầy đủ tính năng.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Checklist */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Xác thực số điện thoại & Email</span>
                  </div>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                    Đã hoàn thành
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                      !
                    </div>
                    <span className="text-sm font-bold text-slate-700">Xác minh danh tính (CCCD/CMND)</span>
                  </div>
                  <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg">
                    Đang kiểm duyệt
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-3 opacity-60">
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">
                      -
                    </div>
                    <span className="text-sm font-bold text-slate-700">Kiểm tra kiến thức & năng lực</span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
                    Chưa thực hiện
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-3 opacity-60">
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">
                      -
                    </div>
                    <span className="text-sm font-bold text-slate-700">Ký hợp đồng đối tác điện tử</span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
                    Chưa ký
                  </span>
                </div>
              </div>

              {/* Guide card */}
              <div className="lg:col-span-1 p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Lưu ý kiểm duyệt
                  </h4>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
                    Hồ sơ của bạn đang được đội ngũ PET CARE kiểm tra thông tin CCCD trong vòng 24h làm việc. 
                    Trong lúc chờ đợi, bạn có thể xem các tài liệu hướng dẫn hoặc liên hệ bộ phận hỗ trợ đối tác nếu cần trợ giúp gấp.
                  </p>
                </div>
                <button className="w-full py-3 bg-[#031625] hover:bg-[#031625]/90 text-[#f0c05a] text-sm font-bold rounded-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer">
                  Xem Hướng Dẫn Đối Tác
                </button>
              </div>
            </div>
          </div>
        )}

        {providerTab === 'schedule' && (
          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-1 pb-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
                Quản lý lịch & năng lực dịch vụ
              </h3>
              <p className="text-slate-400 text-xs font-medium">
                Thiết lập khung giờ rảnh nhận lịch và quản lý dịch vụ chăm sóc bạn cung cấp.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active services */}
              <div className="lg:col-span-1 space-y-4">
                <h4 className="text-sm font-bold text-slate-700">Dịch vụ đang cung cấp</h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">Tắm rửa & Vệ sinh</span>
                    <span className="text-xs text-amber-600 font-extrabold bg-amber-50 px-2 py-0.5 rounded-md">
                      80.000đ/giờ
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">Dắt thú cưng đi dạo</span>
                    <span className="text-xs text-amber-600 font-extrabold bg-amber-50 px-2 py-0.5 rounded-md">
                      50.000đ/giờ
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">Trông giữ thú cưng ngày</span>
                    <span className="text-xs text-amber-600 font-extrabold bg-amber-50 px-2 py-0.5 rounded-md">
                      150.000đ/ngày
                    </span>
                  </div>
                </div>
              </div>

              {/* Working hours */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-sm font-bold text-slate-700">Khung giờ nhận lịch trong tuần</h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-xs font-bold">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700">
                    Thứ Hai<br/>
                    <span className="text-[10px] text-slate-400 font-medium">08:00 - 18:00</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700">
                    Thứ Ba<br/>
                    <span className="text-[10px] text-slate-400 font-medium">08:00 - 18:00</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700">
                    Thứ Tư<br/>
                    <span className="text-[10px] text-slate-400 font-medium">08:00 - 18:00</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700">
                    Thứ Năm<br/>
                    <span className="text-[10px] text-slate-400 font-medium">08:00 - 18:00</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700">
                    Thứ Sáu<br/>
                    <span className="text-[10px] text-slate-400 font-medium">08:00 - 18:00</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700">
                    Thứ Bảy<br/>
                    <span className="text-[10px] text-slate-400 font-medium">08:00 - 20:00</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                    Chủ Nhật<br/>
                    <span className="text-[10px] text-amber-600 font-medium">08:00 - 22:00</span>
                  </div>
                  <div className="p-3 bg-slate-100 border border-dashed border-slate-200 rounded-xl text-slate-400 flex items-center justify-center cursor-pointer hover:bg-slate-200/50 transition-all duration-150">
                    + Thêm lịch
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative bg-[#031625] p-8 md:p-10 rounded-[32px] text-white shadow-xl overflow-hidden border border-slate-800/60">
        {/* Glow effects */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,rgba(240,192,90,0.12),transparent_60%)] pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-[radial-gradient(circle_at_bottom,rgba(20,184,166,0.04),transparent_60%)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3.5">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400/5 border border-amber-400/15 text-[#f0c05a] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              Khu vực chủ nuôi
            </div>
            
            {/* Title */}
            <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight text-white leading-tight">
              Chào mừng trở lại,{' '}
              <span 
                onClick={openProfileModal} 
                className="cursor-pointer underline decoration-teal-400/60 decoration-wavy underline-offset-6 hover:text-teal-300 transition-all duration-200"
              >
                {user?.fullName || 'Người dùng'}
              </span>
              !
            </h2>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={openProviderModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/25 text-teal-300 text-sm font-semibold transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              Đăng ký làm đối tác
            </button>
            <button 
              onClick={openPetModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-700/80 bg-slate-800/20 hover:bg-slate-800/40 text-white text-sm font-semibold transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Đăng ký bé cưng
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#f0c05a] hover:bg-[#e0b04a] text-slate-950 text-sm font-bold transition-all duration-200 active:scale-95 shadow-md shadow-amber-500/10">
              <Heart className="w-4 h-4 fill-current" />
              Đặt người chăm sóc mới
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: My Pets List */}
        <div className="lg:col-span-2">
          <PetList />
        </div>

        {/* Right column: Account Info Details */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Thông tin tài khoản</h3>
              <p className="text-slate-400 text-xs mt-0.5">Chi tiết tài khoản đăng nhập của bạn.</p>
            </div>

            <div className="space-y-4">
              <div 
                onClick={openProfileModal}
                className="flex items-center gap-4 p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer transition-all duration-200 active:scale-[0.99]"
              >
                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Họ và tên</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{user?.fullName || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 font-medium">Email</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate">{user?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Vai trò hệ thống</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{user?.role || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
