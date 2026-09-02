'use client';

import * as React from 'react';
import { X, Mail, Phone, Calendar, ShieldCheck, Loader2, MapPin, Edit3 } from 'lucide-react';
import { useMe } from '../hooks/useMe';
import { formatDate } from '@/utils/formatDate';
import { UpdateProfileModal } from './UpdateProfileModal';

export function MeModal() {
  const { isOpen, user, isLoading, error, closeModal, refresh, openAddressModal } = useMe();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);

  // Listen to Escape key to close the modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  const displayName = user?.fullName || 'Người dùng';
  const firstLetter = displayName.charAt(0).toUpperCase();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'PROVIDER':
        return 'Nhà cung cấp';
      default:
        return 'Khách hàng';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in" 
        onClick={closeModal}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden z-10 transform transition-all duration-300 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white/90 hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        {isLoading ? (
          /* Loading State */
          <div className="h-96 flex flex-col items-center justify-center p-8">
            <Loader2 className="h-10 w-10 text-teal-600 animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-500">Đang tải thông tin...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="h-96 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 font-bold text-xl">
              !
            </div>
            <div>
              <p className="font-bold text-slate-800">Đã xảy ra lỗi</p>
              <p className="text-xs text-slate-500 mt-1">{error}</p>
            </div>
            <button
              onClick={refresh}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all active:scale-95"
            >
              Thử lại
            </button>
          </div>
        ) : user ? (
          /* Main content when user data is available */
          <>
            {/* Upper profile header with gradient */}
            <div className="relative bg-gradient-to-br from-teal-800 to-slate-900 px-6 py-8 flex flex-col items-center text-center">
              {/* Decorative elements */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
              <div className="absolute left-0 bottom-0 w-24 h-24 bg-teal-500/10 rounded-full blur-lg pointer-events-none" />

              {/* Large Avatar */}
              <div className="w-20 h-20 rounded-full bg-teal-100/10 border-2 border-white/30 flex items-center justify-center text-teal-200 font-bold text-3xl uppercase shadow-inner mb-4">
                {firstLetter}
              </div>

              {/* Name */}
              <h3 className="text-xl font-bold text-white tracking-tight">{displayName}</h3>
              
              {/* Role Badge */}
              <span className="mt-2.5 inline-flex px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold tracking-wider uppercase transition-colors">
                {getRoleBadge(user.role)}
              </span>
            </div>

            {/* Information list */}
            <div className="p-6 md:p-8 space-y-5">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin chi tiết</h4>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Số điện thoại</p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate">
                      {user.phone || 'Chưa cung cấp'}
                    </p>
                  </div>
                </div>

                {/* Account Status */}
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trạng thái hệ thống</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-semibold text-slate-700">
                        {user.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Created At */}
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ngày đăng ký</p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                      {formatDate(user.createdAt, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Customer Addresses Link */}
                <div 
                  onClick={() => {
                    closeModal();
                    openAddressModal();
                  }}
                  className="flex items-center gap-4 cursor-pointer hover:bg-slate-50 p-2.5 rounded-2xl transition-all duration-200"
                >
                  <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Địa chỉ của tôi</p>
                    <p className="text-sm font-semibold text-teal-600 mt-0.5 hover:text-teal-700 transition-colors">
                      Quản lý địa chỉ nhận dịch vụ
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button Footer */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
                <button
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-semibold transition-all duration-200 active:scale-95 cursor-pointer border border-transparent"
                >
                  Cập nhật hồ sơ
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all duration-200 active:scale-95 cursor-pointer border border-transparent"
                >
                  Đóng
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <UpdateProfileModal 
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      />
    </div>
  );
}
