'use client';

import * as React from 'react';
import { X, Loader2, Award, MapPin, Briefcase, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { useProvider } from '@/features/provider';
import { useProviderCapability } from '../hooks/useProviderCapability';

export function ProviderCapabilityModal() {
  const { isOpen, step } = useProvider();
  const { isSubmitting, error, setError, closeModal, setStep, registerCapability, getActiveServices } = useProviderCapability();

  const [servicesList, setServicesList] = React.useState<any[]>([]);
  const [serviceId, setServiceId] = React.useState('');
  const [petSpecies, setPetSpecies] = React.useState<'Dog' | 'Cat'>('Dog');
  const [minWeight, setMinWeight] = React.useState('0');
  const [maxWeight, setMaxWeight] = React.useState('50');
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  // Load active services dynamically when rendering Step 3
  React.useEffect(() => {
    if (isOpen && step === 3 && servicesList.length === 0) {
      getActiveServices().then((list) => {
        setServicesList(list);
        if (list && list.length > 0) {
          setServiceId(list[0].id);
        }
      });
    }
  }, [isOpen, step, getActiveServices, servicesList.length]);

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) closeModal();
    };
    if (isOpen && step === 3) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, step, isSubmitting, closeModal]);

  if (!isOpen || step !== 3) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);

    const errors: Record<string, string> = {};
    if (!serviceId) {
      errors.serviceId = 'Vui lòng chọn dịch vụ bạn cung cấp.';
    }
    const minW = parseFloat(minWeight);
    const maxW = parseFloat(maxWeight);
    if (isNaN(minW) || minW < 0) errors.minWeight = 'Cân nặng tối thiểu phải từ 0kg.';
    if (isNaN(maxW) || maxW <= minW) errors.maxWeight = 'Cân nặng tối đa phải lớn hơn cân nặng tối thiểu.';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    await registerCapability({
      serviceId,
      petSpecies,
      minWeight: minW,
      maxWeight: maxW,
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
              Đăng Ký Đối Tác - Bước 3/4
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

          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="serviceId" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Chọn loại dịch vụ bạn muốn đăng ký trước
              </label>
              <select
                id="serviceId"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 transition-all duration-200 cursor-pointer"
              >
                {servicesList.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} (Giá sàn: {new Intl.NumberFormat('vi-VN').format(srv.basePrice)}đ)
                  </option>
                ))}
                {servicesList.length === 0 && (
                  <option value="">Đang tải các gói dịch vụ hệ thống...</option>
                )}
              </select>
              {validationErrors.serviceId && (
                <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.serviceId}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Loài thú cưng nhận chăm sóc
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { type: 'Dog', label: 'Chó 🐶' },
                  { type: 'Cat', label: 'Mèo 🐱' },
                ].map((species) => {
                  const isActive = petSpecies === species.type;
                  return (
                    <button
                      key={species.type}
                      type="button"
                      onClick={() => setPetSpecies(species.type as any)}
                      className={`p-3.5 rounded-2xl border text-center font-bold text-sm transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'border-slate-800 bg-slate-800 text-white shadow-md'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {species.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="minWeight" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Cân nặng tối thiểu (kg)
                </label>
                <input
                  id="minWeight"
                  type="number"
                  min="0"
                  value={minWeight}
                  onChange={(e) => setMinWeight(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 transition-all duration-200"
                />
                {validationErrors.minWeight && (
                  <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.minWeight}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="maxWeight" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Cân nặng tối đa (kg)
                </label>
                <input
                  id="maxWeight"
                  type="number"
                  min="1"
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 transition-all duration-200"
                />
                {validationErrors.maxWeight && (
                  <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.maxWeight}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep(2);
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
