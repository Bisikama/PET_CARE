'use client';

import * as React from 'react';
import { X, Loader2, Upload, FileText, Check, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useProvider } from '@/features/provider';
import { providerService } from '@/features/provider/services/provider.service';

export function ProviderCertificateStep() {
  const { setStep, closeModal } = useProvider();
  
  const [documentType, setDocumentType] = React.useState('GROOMING_CERTIFICATE');
  const [file, setFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  
  const [uploadedDocs, setUploadedDocs] = React.useState<any[]>([]);
  const [localUploadedFiles, setLocalUploadedFiles] = React.useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch already uploaded certificates
  const loadCertificates = React.useCallback(async () => {
    setLoadingDocs(true);
    try {
      const docs = await providerService.getDocuments();
      // Filter out KYC documents (CCCD & Face Portrait)
      const certs = (docs || []).filter(
        (d: any) => d.document_type !== 'IDENTITY_CARD' && d.document_type !== 'FACE_PORTRAIT'
      );
      setUploadedDocs(certs);
    } catch (err: any) {
      // If error is 403 Forbidden, user is a CUSTOMER registering, which is expected
      if (err?.response?.status !== 403) {
        console.error('Error fetching certificates:', err);
      }
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  React.useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);

    if (!file) {
      setValidationErrors({ file: 'Vui lòng chọn tệp chứng chỉ của bạn.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await providerService.uploadDocument(documentType, file);
      // Append file to local list since user might not have access to fetch getDocuments API
      const newLocalDoc = {
        id: `local-${Date.now()}`,
        document_type: documentType,
        file_name: file.name,
      };
      setLocalUploadedFiles((prev) => [newLocalDoc, ...prev]);
      
      setFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadCertificates();
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải lên chứng chỉ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa chứng chỉ này?')) return;
    
    if (docId.startsWith('local-')) {
      setLocalUploadedFiles((prev) => prev.filter((d) => d.id !== docId));
      return;
    }

    try {
      await providerService.deleteDocument(docId);
      await loadCertificates();
    } catch (err: any) {
      console.error('Error deleting document:', err);
      if (err?.response?.status === 403) {
        alert('Không thể xóa chứng chỉ sau khi đã nộp hồ sơ.');
      } else {
        alert('Không thể xóa tài liệu này.');
      }
    }
  };

  const handleNext = () => {
    setStep(4); // Move to Step 4 (eKYC)
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
            <span className="text-xs font-bold text-slate-400">Thông tin</span>
          </button>
          <div className="w-8 h-[1px] bg-slate-200" />
          
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 hover:opacity-85 transition-all cursor-pointer outline-none border-none bg-transparent"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-emerald-500 text-white">
              ✓
            </div>
            <span className="text-xs font-bold text-slate-400">Địa chỉ</span>
          </button>
          <div className="w-8 h-[1px] bg-slate-200" />

          <button
            type="button"
            className="flex items-center gap-1.5 outline-none border-none bg-transparent"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-slate-800 text-white shadow-md">
              3
            </div>
            <span className="text-xs font-bold text-slate-800">Chứng chỉ</span>
          </button>
          <div className="w-8 h-[1px] bg-slate-200" />

          <button
            type="button"
            disabled
            className="flex items-center gap-1.5 opacity-60 outline-none border-none bg-transparent"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-slate-200 text-slate-500">
              4
            </div>
            <span className="text-xs font-bold text-slate-400">Xác minh</span>
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 md:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100 animate-fade-in">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Upload Form */}
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Loại chứng chỉ/Tài liệu
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 transition-all cursor-pointer"
                >
                  <option value="GROOMING_CERTIFICATE">Chứng chỉ Cắt tỉa lông (Grooming)</option>
                  <option value="PET_CARE_CERTIFICATE">Chứng chỉ Chăm sóc thú cưng</option>
                  <option value="FIRST_AID_CERTIFICATE">Chứng chỉ Sơ cứu thú cưng (First Aid)</option>
                  <option value="BACKGROUND_SCREENING">Lý lịch tư pháp / Sàng lọc</option>
                  <option value="OTHER">Các giấy tờ khác</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Chọn tệp chứng chỉ (Ảnh hoặc PDF)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf, image/*"
                  className="hidden"
                />

                {file ? (
                  <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col items-center justify-center p-3 h-[140px] text-center">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="h-full object-contain rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <FileText className="w-8 h-8 text-teal-650" />
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{file.name}</span>
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
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-350 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 rounded-xl h-[140px] flex flex-col items-center justify-center cursor-pointer transition-all"
                  >
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Click để chọn tệp chứng chỉ</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">PDF, PNG, JPG dưới 10MB</span>
                  </div>
                )}
                {validationErrors.file && (
                  <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.file}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Tải chứng chỉ lên
                  </>
                )}
              </button>
            </form>

            {/* Right: Uploaded List */}
            <div className="space-y-3 flex flex-col justify-between border-l border-slate-100 pl-6">
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Các chứng chỉ đã tải lên ({uploadedDocs.length + localUploadedFiles.length})
                </label>
                
                <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                  {loadingDocs ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-slate-400 text-xs font-semibold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tải danh sách...
                    </div>
                  ) : (uploadedDocs.length + localUploadedFiles.length) === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-semibold bg-slate-50 border border-slate-100 rounded-xl">
                      Chưa có chứng chỉ nào được tải lên.
                    </div>
                  ) : (
                    [...localUploadedFiles, ...uploadedDocs].map((doc) => {
                      const typeLabels: Record<string, string> = {
                        GROOMING_CERTIFICATE: 'Cắt tỉa lông',
                        PET_CARE_CERTIFICATE: 'Chăm sóc thú cưng',
                        FIRST_AID_CERTIFICATE: 'Sơ cứu thú cưng',
                        BACKGROUND_SCREENING: 'Lý lịch tư pháp',
                        OTHER: 'Giấy tờ khác',
                      };
                      return (
                        <div key={doc.id} className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-700 truncate block" title={typeLabels[doc.document_type]}>
                                {typeLabels[doc.document_type] || 'Chứng chỉ'}
                              </span>
                              {doc.file_name && (
                                <span className="text-[9px] font-medium text-slate-400 block truncate max-w-[130px]" title={doc.file_name}>
                                  {doc.file_name}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-lg cursor-pointer animate-fade-in"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 font-medium bg-slate-50 p-3 border border-slate-100 rounded-xl leading-relaxed">
                💡 Bạn có thể đăng ký nhiều chứng chỉ cùng lúc để tăng tỷ lệ được duyệt và uy tín thương hiệu trên hệ thống.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-150 px-6 py-4 flex gap-3 justify-between">
          <button
            onClick={() => setStep(2)}
            disabled={isSubmitting}
            className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#031625] hover:bg-[#031625]/90 text-[#f0c05a] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
          >
            Tiếp theo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
