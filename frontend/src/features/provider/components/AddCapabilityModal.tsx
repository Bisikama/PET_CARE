'use client';

import * as React from 'react';
import { X, Loader2, Award, Check } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';
import { providerService } from '../services/provider.service';

interface AddCapabilityModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddCapabilityModal({ show, onClose, onSuccess }: AddCapabilityModalProps) {
  const [servicesList, setServicesList] = React.useState<any[]>([]);
  const [serviceId, setServiceId] = React.useState('');
  const [petSpecies, setPetSpecies] = React.useState<'Dog' | 'Cat'>('Dog');
  const [minWeight, setMinWeight] = React.useState('0');
  const [maxWeight, setMaxWeight] = React.useState('50');

  const [loadingServices, setLoadingServices] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  // Load services list
  React.useEffect(() => {
    if (show) {
      setLoadingServices(true);
      providerService.getActiveServices()
        .then((list) => {
          console.log('[DEBUG] getActiveServices list:', list);
          setServicesList(list || []);
          if (list && list.length > 0) {
            console.log('[DEBUG] Setting initial serviceId:', list[0].id);
            setServiceId(list[0].id);
          }
          setLoadingServices(false);
        })
        .catch((err) => {
          console.error(err);
          setLoadingServices(false);
        });
    }
  }, [show]);

  // Handle ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    if (show) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [show, isSubmitting, onClose]);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);

    console.log('[DEBUG] handleSubmit serviceId:', serviceId);

    const errors: Record<string, string> = {};
    if (!serviceId) {
      errors.serviceId = 'Vui lòng chọn dịch vụ.';
    }
    const minW = parseFloat(minWeight);
    const maxW = parseFloat(maxWeight);
    if (isNaN(minW) || minW < 0) errors.minWeight = 'Cân nặng tối thiểu phải lớn hơn hoặc bằng 0kg.';
    if (isNaN(maxW) || maxW <= minW) errors.maxWeight = 'Cân nặng tối đa phải lớn hơn cân nặng tối thiểu.';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[DEBUG] Calling registerCapability with:', {
        serviceId,
        petSpecies,
        minWeight: minW,
        maxWeight: maxW,
      });
      await providerService.registerCapability({
        serviceId,
        petSpecies,
        minWeight: minW,
        maxWeight: maxW,
      });
      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error adding capability:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể đăng ký dịch vụ.');
      setIsSubmitting(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in"
          onClick={() => !isSubmitting && onClose()}
        />

        {/* Modal Box */}
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 transform animate-scale-up border border-slate-100">
          {/* Header */}
          <div className="bg-[#031625] px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#f0c05a]" />
              <h3 className="text-sm md:text-base font-bold tracking-wide">
                Đăng ký năng lực dịch vụ mới
              </h3>
            </div>
            {!isSubmitting && (
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100">
                {error}
              </div>
            )}

            {/* Service dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Dịch vụ cung cấp
              </label>
              {loadingServices ? (
                <div className="w-full px-4 py-3 bg-slate-100 rounded-2xl flex items-center gap-2 text-slate-400 text-xs font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang tải danh sách dịch vụ hệ thống...
                </div>
              ) : (
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 transition-all cursor-pointer"
                >
                  {servicesList.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} (Giá sàn: {new Intl.NumberFormat('vi-VN').format(srv.basePrice)}đ)
                    </option>
                  ))}
                </select>
              )}
              {validationErrors.serviceId && (
                <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.serviceId}</p>
              )}
            </div>

            {/* Species button grid */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Loài vật nuôi
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['Dog', 'Cat'].map((species) => {
                  const isActive = petSpecies === species;
                  return (
                    <button
                      key={species}
                      type="button"
                      onClick={() => setPetSpecies(species as any)}
                      className={`p-3 rounded-2xl border text-center text-xs font-extrabold transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#031625] bg-[#031625] text-white shadow-md'
                          : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {species === 'Dog' ? '🐶 Chó' : '🐱 Mèo'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weights range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="minWeight" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Cân nặng tối thiểu (kg)
                </label>
                <input
                  id="minWeight"
                  type="number"
                  min="0"
                  value={minWeight}
                  onChange={(e) => setMinWeight(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 transition-all duration-200"
                />
                {validationErrors.minWeight && (
                  <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.minWeight}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="maxWeight" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Cân nặng tối đa (kg)
                </label>
                <input
                  id="maxWeight"
                  type="number"
                  min="0"
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 transition-all duration-200"
                />
                {validationErrors.maxWeight && (
                  <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.maxWeight}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-650 text-xs font-bold rounded-2xl transition-all cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-[#031625] hover:bg-[#031625]/90 text-[#f0c05a] text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Đăng ký dịch vụ
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
