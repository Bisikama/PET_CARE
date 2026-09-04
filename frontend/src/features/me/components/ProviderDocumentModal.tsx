'use client';

import * as React from 'react';
import { X, Loader2, Save, Info, Briefcase, FileText, ChevronLeft, Upload } from 'lucide-react';
import { useProvider } from '@/features/provider';
import { useProviderDocument } from '../hooks/useProviderDocument';

export function ProviderDocumentModal() {
  const { isOpen, step } = useProvider();
  const { isSubmitting, error, setError, closeModal, setStep, submitKyc } = useProviderDocument();

  // Basic KYC Form Fields
  const [idNumber, setIdNumber] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [issueDate, setIssueDate] = React.useState('');

  // 3 Images state
  const [frontFile, setFrontFile] = React.useState<File | null>(null);
  const [frontPreview, setFrontPreview] = React.useState<string | null>(null);
  
  const [backFile, setBackFile] = React.useState<File | null>(null);
  const [backPreview, setBackPreview] = React.useState<string | null>(null);
  
  const [faceFile, setFaceFile] = React.useState<File | null>(null);
  const [facePreview, setFacePreview] = React.useState<string | null>(null);

  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  const frontInputRef = React.useRef<HTMLInputElement>(null);
  const backInputRef = React.useRef<HTMLInputElement>(null);
  const faceInputRef = React.useRef<HTMLInputElement>(null);

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

  const validateFile = (file: File, field: string) => {
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setValidationErrors((prev) => ({ ...prev, [field]: 'Định dạng tệp phải là PNG, JPG hoặc WEBP.' }));
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setValidationErrors((prev) => ({ ...prev, [field]: 'Tệp không được vượt quá 10MB.' }));
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string, setFile: React.Dispatch<React.SetStateAction<File | null>>, setPreview: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateFile(file, field)) return;
      setFile(file);
      setPreview(URL.createObjectURL(file));
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);

    const errors: Record<string, string> = {};
    if (!idNumber.trim()) errors.idNumber = 'Vui lòng nhập số CCCD.';
    if (!fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên trên CCCD.';
    if (!dob) errors.dob = 'Vui lòng chọn ngày sinh.';
    if (!issueDate) errors.issueDate = 'Vui lòng chọn ngày cấp CCCD.';
    if (!frontFile) errors.frontImage = 'Vui lòng tải ảnh mặt trước CCCD.';
    if (!backFile) errors.backImage = 'Vui lòng tải ảnh mặt sau CCCD.';
    if (!faceFile) errors.faceImage = 'Vui lòng tải ảnh chân dung.';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const success = await submitKyc(
      {
        idNumber,
        fullName: fullName.toUpperCase(),
        dob,
        issueDate,
      },
      {
        frontImage: frontFile!,
        backImage: backFile!,
        faceImage: faceFile!,
      }
    );

    if (success) {
      setStep(4); // Go to Success Screen
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
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden z-10 transform transition-all duration-300 animate-scale-up">
        {/* Header */}
        <div className="bg-[#031625] px-6 py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">💼</span>
            <h3 className="text-base md:text-lg font-bold tracking-wide">
              Đăng Ký Đối Tác - Bước 3/3
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
          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 hover:opacity-85 transition-all cursor-pointer outline-none border-none bg-transparent"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-emerald-500 text-white">
              ✓
            </div>
            <span className="text-xs font-bold text-slate-400">
              Thông tin
            </span>
          </button>
          <div className="w-12 h-[1px] bg-slate-200" />
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 hover:opacity-85 transition-all cursor-pointer outline-none border-none bg-transparent"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-emerald-500 text-white">
              ✓
            </div>
            <span className="text-xs font-bold text-slate-400">
              Địa chỉ
            </span>
          </button>
          <div className="w-12 h-[1px] bg-slate-200" />
          <button
            type="button"
            className="flex items-center gap-1.5 outline-none border-none bg-transparent"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-slate-800 text-white shadow-md">
              3
            </div>
            <span className="text-xs font-bold text-slate-800">
              Xác minh danh tính (eKYC)
            </span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 text-sm font-semibold rounded-2xl border border-rose-100">
              {error}
            </div>
          )}

          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/30 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Yêu cầu bắt buộc tải lên hình ảnh CCCD và ảnh chân dung để xác thực danh tính. Thông tin của bạn được bảo mật tuyệt đối theo chính sách bảo mật của PET CARE.
            </p>
          </div>

          <div className="space-y-4">
            {/* Row 1: CCCD Number & Fullname */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="idNumber" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Số CCCD (12 chữ số)
                </label>
                <input
                  id="idNumber"
                  type="text"
                  maxLength={12}
                  placeholder="Ví dụ: 001202012345"
                  value={idNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setIdNumber(val);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 transition-all duration-200"
                />
                {validationErrors.idNumber && (
                  <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.idNumber}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Họ và tên (trên CCCD)
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Ví dụ: NGUYEN VAN A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 transition-all duration-200 uppercase"
                />
                {validationErrors.fullName && (
                  <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.fullName}</p>
                )}
              </div>
            </div>

            {/* Row 2: DOB & Issue Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="dob" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Ngày sinh
                </label>
                <input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 transition-all duration-200"
                />
                {validationErrors.dob && (
                  <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.dob}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="issueDate" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Ngày cấp CCCD
                </label>
                <input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 transition-all duration-200"
                />
                {validationErrors.issueDate && (
                  <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.issueDate}</p>
                )}
              </div>
            </div>

            {/* Row 3: Identity Card Images */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Hình ảnh định danh (eKYC)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Front Image */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 block">1. Ảnh mặt trước CCCD</span>
                  <input
                    type="file"
                    ref={frontInputRef}
                    onChange={(e) => handleFileChange(e, 'frontImage', setFrontFile, setFrontPreview)}
                    accept="image/*"
                    className="hidden"
                  />
                  {frontPreview ? (
                    <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 h-[120px]">
                      <img src={frontPreview} alt="Front CCCD" className="h-full object-contain rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setFrontFile(null);
                          setFrontPreview(null);
                        }}
                        className="absolute top-1.5 right-1.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-1 cursor-pointer transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => frontInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 rounded-2xl h-[120px] flex flex-col items-center justify-center cursor-pointer transition-all"
                    >
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[11px] font-bold text-slate-600">Tải ảnh mặt trước</span>
                    </div>
                  )}
                  {validationErrors.frontImage && (
                    <p className="text-[10px] text-rose-500 font-bold leading-tight">{validationErrors.frontImage}</p>
                  )}
                </div>

                {/* Back Image */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 block">2. Ảnh mặt sau CCCD</span>
                  <input
                    type="file"
                    ref={backInputRef}
                    onChange={(e) => handleFileChange(e, 'backImage', setBackFile, setBackPreview)}
                    accept="image/*"
                    className="hidden"
                  />
                  {backPreview ? (
                    <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 h-[120px]">
                      <img src={backPreview} alt="Back CCCD" className="h-full object-contain rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setBackFile(null);
                          setBackPreview(null);
                        }}
                        className="absolute top-1.5 right-1.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-1 cursor-pointer transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => backInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 rounded-2xl h-[120px] flex flex-col items-center justify-center cursor-pointer transition-all"
                    >
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[11px] font-bold text-slate-600">Tải ảnh mặt sau</span>
                    </div>
                  )}
                  {validationErrors.backImage && (
                    <p className="text-[10px] text-rose-500 font-bold leading-tight">{validationErrors.backImage}</p>
                  )}
                </div>

                {/* Face Image */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 block">3. Ảnh chân dung (Selfie)</span>
                  <input
                    type="file"
                    ref={faceInputRef}
                    onChange={(e) => handleFileChange(e, 'faceImage', setFaceFile, setFacePreview)}
                    accept="image/*"
                    className="hidden"
                  />
                  {facePreview ? (
                    <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 h-[120px]">
                      <img src={facePreview} alt="Portrait face" className="h-full object-contain rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setFaceFile(null);
                          setFacePreview(null);
                        }}
                        className="absolute top-1.5 right-1.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-1 cursor-pointer transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => faceInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 rounded-2xl h-[120px] flex flex-col items-center justify-center cursor-pointer transition-all"
                    >
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[11px] font-bold text-slate-600">Tải ảnh chân dung</span>
                    </div>
                  )}
                  {validationErrors.faceImage && (
                    <p className="text-[10px] text-rose-500 font-bold leading-tight">{validationErrors.faceImage}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

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
                    <Save className="w-4 h-4 text-[#f0c05a]" />
                    Nộp hồ sơ duyệt
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
