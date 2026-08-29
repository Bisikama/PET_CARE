'use client';

import * as React from 'react';
import { X, Loader2, Upload, FileText, Check } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';
import { providerService } from '../services/provider.service';

interface AddCertificateModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddCertificateModal({ show, onClose, onSuccess }: AddCertificateModalProps) {
  const [documentType, setDocumentType] = React.useState('GROOMING_CERTIFICATE');
  const [file, setFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);

    const errors: Record<string, string> = {};
    if (!file) {
      errors.file = 'Vui lòng tải lên tệp chứng chỉ của bạn.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await providerService.uploadDocument(documentType, file!);
      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải lên chứng chỉ.');
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
              <FileText className="w-5 h-5 text-[#f0c05a]" />
              <h3 className="text-sm md:text-base font-bold tracking-wide">
                Tải lên chứng chỉ chuyên môn
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

            {/* Document Type select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Loại chứng chỉ/Tài liệu
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 transition-all cursor-pointer"
              >
                <option value="GROOMING_CERTIFICATE">Chứng chỉ Cắt tỉa lông (Grooming)</option>
                <option value="PET_CARE_CERTIFICATE">Chứng chỉ Chăm sóc thú cưng (Pet Care)</option>
                <option value="FIRST_AID_CERTIFICATE">Chứng chỉ Sơ cấp cứu thú cưng (First Aid)</option>
                <option value="BACKGROUND_SCREENING">Lý lịch tư pháp / Sàng lọc lý lịch</option>
                <option value="OTHER">Các giấy tờ khác</option>
              </select>
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Tải tệp lên (PDF, PNG, JPG)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf, image/*"
                className="hidden"
              />
              
              {file ? (
                <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex flex-col items-center justify-center p-4 h-[160px] text-center">
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" className="h-full object-contain rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <FileText className="w-10 h-10 text-teal-650" />
                      <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{file.name}</span>
                      <span className="text-[10px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setFilePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-1 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 rounded-2xl h-[160px] flex flex-col items-center justify-center cursor-pointer transition-all"
                >
                  <Upload className="w-6 h-6 text-slate-450 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Click để chọn tệp tải lên</span>
                  <span className="text-[10px] text-slate-400 mt-1">Hỗ trợ PDF, PNG, JPG dưới 10MB</span>
                </div>
              )}
              {validationErrors.file && (
                <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.file}</p>
              )}
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
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Tải tài liệu lên
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
