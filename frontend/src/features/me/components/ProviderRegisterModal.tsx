'use client';

import * as React from 'react';
import { X, Loader2, Save, Award, Info, MapPin, Briefcase, FileText, ChevronRight } from 'lucide-react';
import { useProvider } from '@/features/provider';
import { useProviderProfile } from '../hooks/useProviderProfile';

export function ProviderRegisterModal() {
  const { isOpen, step, setStep } = useProvider();
  const { isSubmitting, error, closeModal, registerProvider } = useProviderProfile();

  const [providerType, setProviderType] = React.useState<'SITTER' | 'GROOMER' | 'VET'>('SITTER');
  const [experienceYears, setExperienceYears] = React.useState('1');
  const [bio, setBio] = React.useState('');
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  const handleStepClick = (targetStep: number) => {
    if (targetStep > 1) {
      alert('Vui lòng hoàn thành Bước 1 để khởi tạo hồ sơ đối tác.');
      return;
    }
    setStep(targetStep);
  };

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) closeModal();
    };
    if (isOpen && step === 1) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, step, isSubmitting, closeModal]);

  if (!isOpen || step !== 1) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const errors: Record<string, string> = {};
    const years = parseInt(experienceYears, 10);
    if (isNaN(years) || years < 0) {
      errors.experienceYears = 'Số năm kinh nghiệm phải là số lớn hơn hoặc bằng 0.';
    }
    if (bio.trim().length > 500) {
      errors.bio = 'Giới thiệu bản thân tối đa 500 ký tự.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    await registerProvider({
      providerType,
      experienceYears: years,
      bio: bio.trim(),
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
              Đăng Ký Đối Tác - Bước 1/3
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
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-6 justify-center">
          {[
            { id: 1, label: 'Thông tin' },
            { id: 2, label: 'Địa chỉ' },
            { id: 3, label: 'Xác minh' },
          ].map((s) => (
            <React.Fragment key={s.id}>
              <button
                type="button"
                onClick={() => handleStepClick(s.id)}
                className="flex items-center gap-1.5 hover:opacity-85 transition-all cursor-pointer outline-none border-none bg-transparent"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  step === s.id ? 'bg-slate-800 text-white shadow-md' :
                  step > s.id ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className={`text-xs font-bold ${
                  step === s.id ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </button>
              {s.id < 3 && <div className="w-12 h-[1px] bg-slate-200" />}
            </React.Fragment>
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Vai trò dịch vụ chính
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'SITTER', label: 'Pet Sitter', desc: 'Chăm sóc thú cưng' },
                  { type: 'GROOMER', label: 'Groomer', desc: 'Cắt tỉa lông' },
                  { type: 'VET', label: 'Bác sĩ thú y', desc: 'Hỗ trợ y tế' },
                ].map((item) => {
                  const isActive = providerType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setProviderType(item.type as any)}
                      className={`p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                        isActive
                          ? 'border-slate-800 bg-slate-800 text-white shadow-md'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-sm font-extrabold">{item.label}</span>
                      <span className={`text-[9px] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="experienceYears" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Số năm kinh nghiệm
              </label>
              <div className="relative">
                <input
                  id="experienceYears"
                  type="number"
                  min="0"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 transition-all duration-200"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              {validationErrors.experienceYears && (
                <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.experienceYears}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Giới thiệu bản thân
              </label>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Giới thiệu kinh nghiệm làm việc và sự tận tâm của bạn với vật nuôi..."
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 transition-all duration-200"
              />
              <div className="flex justify-between text-[10px] text-slate-400 px-1">
                <span>Tối đa 500 ký tự</span>
                <span>{bio.length}/500</span>
              </div>
              {validationErrors.bio && (
                <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.bio}</p>
              )}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
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
        </form>
      </div>
    </div>
  );
}
