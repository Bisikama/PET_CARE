'use client';

import * as React from 'react';
import { X, Loader2, Award, MapPin, Briefcase, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { useProvider } from '@/features/provider';
import { useProviderArea } from '../hooks/useProviderArea';
import { AddressSelector } from './AddressSelector';

export function ProviderAreaModal() {
  const { isOpen, step } = useProvider();
  const { isSubmitting, error, setError, closeModal, setStep, addServiceArea } = useProviderArea();

  const [addressData, setAddressData] = React.useState<{ province: string; district: string; ward: string } | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) closeModal();
    };
    if (isOpen && step === 2) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, step, isSubmitting, closeModal]);

  if (!isOpen || step !== 2) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);

    if (!addressData || !addressData.province || !addressData.district || !addressData.ward) {
      setValidationErrors({
        address: 'Vui lòng chọn đầy đủ thông tin Tỉnh/Thành phố, Quận/Huyện, Phường/Xã.',
      });
      return;
    }

    await addServiceArea({
      city: addressData.province,
      district: addressData.district,
      ward: addressData.ward,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={() => !isSubmitting && closeModal()}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-xl bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden z-10 transform transition-all duration-300 animate-scale-up">
        {/* Header */}
        <div className="bg-[#031625] px-6 py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">💼</span>
            <h3 className="text-base md:text-lg font-bold tracking-wide">
              Đăng Ký Đối Tác - Bước 2/4
            </h3>
          </div>
          {!isSubmitting && (
            <button
              onClick={closeModal}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          {[
            { id: 1, label: 'Thông tin', icon: Briefcase },
            { id: 2, label: 'Khu vực', icon: MapPin },
            { id: 3, label: 'Dịch vụ', icon: Award },
            { id: 4, label: 'Xác minh', icon: FileText },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className="flex items-center gap-1.5 hover:opacity-85 transition-all cursor-pointer outline-none border-none bg-transparent"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                step === s.id ? 'bg-slate-800 text-white shadow-md' :
                step > s.id ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > s.id ? '✓' : s.id}
              </div>
              <span className={`text-xs font-bold hidden sm:inline ${
                step === s.id ? 'text-slate-800' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
              {s.id < 4 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline ml-1.5" />}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 text-sm font-semibold rounded-2xl border border-rose-100">
              {error}
            </div>
          )}

          {validationErrors.address && (
            <div className="p-4 bg-rose-50 text-rose-700 text-sm font-semibold rounded-2xl border border-rose-100">
              {validationErrors.address}
            </div>
          )}

          {/* Vietnam Address Selector */}
          <AddressSelector
            onAddressChange={(data) => {
              setAddressData(data);
              setValidationErrors({});
            }}
            initialValues={addressData ? {
              province: addressData.province,
              district: addressData.district,
              ward: addressData.ward
            } : undefined}
          />

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep(1);
              }}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs md:text-sm font-bold rounded-2xl transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="px-4 py-3 text-slate-400 hover:text-slate-600 text-xs md:text-sm font-bold rounded-2xl transition-all duration-150 cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-3 bg-[#031625] hover:bg-[#031625]/90 text-[#f0c05a] text-xs md:text-sm font-bold rounded-2xl shadow-lg flex items-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#f0c05a]" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Tiếp theo
                    <ChevronRight className="w-4 h-4 text-[#f0c05a]" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
