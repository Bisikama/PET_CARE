'use client';

import * as React from 'react';
import { X, Loader2, Save, Award, Info, MapPin, Briefcase, FileText, ChevronRight, ChevronLeft, Upload } from 'lucide-react';
import { useProviderRegister } from '../hooks/useProviderRegister';

export function ProviderDocumentModal() {
  const { isOpen, closeModal, step, setStep, isSubmitting, error, setError, uploadDocument } = useProviderRegister();

  const [idCardFile, setIdCardFile] = React.useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = React.useState<string | null>(null);
  const [certFile, setCertFile] = React.useState<File | null>(null);
  const [certPreview, setCertPreview] = React.useState<string | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  const idCardInputRef = React.useRef<HTMLInputElement>(null);
  const certInputRef = React.useRef<HTMLInputElement>(null);

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) closeModal();
    };
    if (isOpen && step === 4) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, step, isSubmitting, closeModal]);

  if (!isOpen || step !== 4) return null;

  const handleIdCardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'].includes(file.type)) {
        setValidationErrors((prev) => ({ ...prev, idCard: 'Định dạng tệp phải là PNG, JPG hoặc PDF.' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors((prev) => ({ ...prev, idCard: 'Tệp không được vượt quá 5MB.' }));
        return;
      }
      setIdCardFile(file);
      if (file.type.startsWith('image/')) {
        setIdCardPreview(URL.createObjectURL(file));
      } else {
        setIdCardPreview('/pdf-icon-placeholder.png');
      }
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy.idCard;
        return copy;
      });
    }
  };

  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'].includes(file.type)) {
        setValidationErrors((prev) => ({ ...prev, cert: 'Định dạng tệp phải là PNG, JPG hoặc PDF.' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors((prev) => ({ ...prev, cert: 'Tệp không được vượt quá 5MB.' }));
        return;
      }
      setCertFile(file);
      if (file.type.startsWith('image/')) {
        setCertPreview(URL.createObjectURL(file));
      } else {
        setCertPreview('/pdf-icon-placeholder.png');
      }
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy.cert;
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);

    const errors: Record<string, string> = {};
    if (!idCardFile) {
      errors.idCard = 'Vui lòng tải lên tài liệu định danh (CCCD/CMND) để xác minh danh tính.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Upload IDENTITY_CARD
    let uploadSuccess = false;
    if (idCardFile) {
      uploadSuccess = await uploadDocument('IDENTITY_CARD', idCardFile);
    }

    // Upload optional CERTIFICATE if exists
    if (uploadSuccess && certFile) {
      await uploadDocument('GROOMING_CERTIFICATE', certFile);
    }

    if (uploadSuccess) {
      setStep(5); // Go to Success Screen
    }
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
              Đăng Ký Đối Tác - Bước 4/4
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
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/30 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Yêu cầu bắt buộc tải lên hình ảnh CCCD/CMND để xác thực danh tính. Việc này giúp đảm bảo sự tin tưởng và an toàn của cộng đồng PET CARE.
              </p>
            </div>

            {/* Identity Card File Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Ảnh Căn cước công dân / CMND (Bắt buộc)
              </label>
              <input
                type="file"
                ref={idCardInputRef}
                onChange={handleIdCardFileChange}
                accept="image/png, image/jpeg, image/jpg, application/pdf"
                className="hidden"
              />
              
              {idCardPreview ? (
                <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-4 max-h-[140px]">
                  {idCardFile?.type === 'application/pdf' ? (
                    <span className="text-xs font-bold text-slate-600">📄 File PDF: {idCardFile.name}</span>
                  ) : (
                    <img src={idCardPreview} alt="CCCD Preview" className="max-h-[120px] object-contain rounded-lg" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIdCardFile(null);
                      setIdCardPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-1 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => idCardInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 rounded-2xl py-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-150"
                >
                  <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                  <span className="text-xs font-bold text-slate-600">Tải ảnh mặt trước CCCD</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">Hỗ trợ PNG, JPG, PDF tối đa 5MB</span>
                </div>
              )}
              {validationErrors.idCard && (
                <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.idCard}</p>
              )}
            </div>

            {/* Certificate File Input (Optional) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Chứng chỉ hành nghề (Nếu có - Không bắt buộc)
              </label>
              <input
                type="file"
                ref={certInputRef}
                onChange={handleCertFileChange}
                accept="image/png, image/jpeg, image/jpg, application/pdf"
                className="hidden"
              />
              
              {certPreview ? (
                <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-4 max-h-[140px]">
                  {certFile?.type === 'application/pdf' ? (
                    <span className="text-xs font-bold text-slate-600">📄 File PDF: {certFile.name}</span>
                  ) : (
                    <img src={certPreview} alt="Cert Preview" className="max-h-[120px] object-contain rounded-lg" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setCertFile(null);
                      setCertPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-1 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => certInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 rounded-2xl py-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-150"
                >
                  <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                  <span className="text-xs font-bold text-slate-600">Tải lên chứng chỉ hành nghề</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">Tải lên chứng chỉ bác sĩ, làm đẹp...</span>
                </div>
              )}
              {validationErrors.cert && (
                <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.cert}</p>
              )}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep(3);
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
                    <Save className="w-4 h-4 text-[#f0c05a]" />
                    Hoàn thành đăng ký
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
