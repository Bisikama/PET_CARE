'use client';

import * as React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { useProvider } from '@/features/provider';

export function ProviderSuccessModal() {
  const { isOpen, closeModal, step } = useProvider();

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isOpen && step === 4) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, step, closeModal]);

  if (!isOpen || step !== 4) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={closeModal}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-xl bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden z-10 transform transition-all duration-300 animate-scale-up">
        {/* Header */}
        <div className="bg-[#031625] px-6 py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">💼</span>
            <h3 className="text-base md:text-lg font-bold tracking-wide">
              Đăng Ký Thành Công
            </h3>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center scale-up">
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-lg font-bold text-slate-800">Gửi Hồ Sơ Thành Công!</h4>
            <p className="text-slate-500 text-xs md:text-sm max-w-sm font-medium leading-relaxed">
              Cảm ơn bạn đã đăng ký gia nhập đội ngũ đối tác chăm sóc thú cưng của PET CARE. Hồ sơ nháp (DRAFT) của bạn đang được đợi quản trị viên kiểm tra thông tin định danh và phê duyệt.
            </p>
          </div>
          <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-400 font-medium">
            Vui lòng theo dõi tiến trình onboarding trong mục tài khoản của bạn. Admin sẽ xét duyệt hồ sơ trong vòng 24 giờ làm việc.
          </div>

          {/* Footer Close Button */}
          <div className="pt-2 w-full flex items-center justify-center">
            <button
              type="button"
              onClick={closeModal}
              className="w-full sm:w-auto px-10 py-3.5 bg-[#031625] hover:bg-[#031625]/90 text-[#f0c05a] text-sm font-bold rounded-2xl shadow-md cursor-pointer transition-all duration-150 text-center"
            >
              Đóng lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
