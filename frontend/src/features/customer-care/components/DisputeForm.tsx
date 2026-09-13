'use client';

import React, { useState } from 'react';
import { useCustomerCareMutations } from '../hooks/useCustomerCare';
import { DisputeReason } from '../types';
import { UploadCloud, X, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { Portal } from '@/components/ui/Portal';

interface DisputeFormProps {
  bookingId: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function DisputeForm({ bookingId, onClose, onSuccess }: DisputeFormProps) {
  const { openDispute, loading, error } = useCustomerCareMutations();
  const [reason, setReason] = useState<DisputeReason>(DisputeReason.UNSATISFACTORY_SERVICE);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await openDispute(bookingId, { reason, title, description, files });
      setTitle('');
      setDescription('');
      setFiles([]);
      setReason(DisputeReason.UNSATISFACTORY_SERVICE);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100">
          {/* Top red accent bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-amber-500"></div>

          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-4 pr-6">
            <div className="p-3 rounded-2xl bg-red-50 text-red-600">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">Mở Tranh Chấp</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Hãy cung cấp thông tin để chúng tôi hỗ trợ bạn nhanh nhất
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Lý do tranh chấp</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as DisputeReason)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-slate-50 font-medium text-slate-800 text-sm"
              >
                <option value={DisputeReason.UNSATISFACTORY_SERVICE}>Dịch vụ không đạt yêu cầu</option>
                <option value={DisputeReason.PROVIDER_NO_SHOW}>Provider không đến</option>
                <option value={DisputeReason.CUSTOMER_NO_SHOW}>Tôi không thể đến</option>
                <option value={DisputeReason.PAYMENT_ISSUE}>Vấn đề thanh toán</option>
                <option value={DisputeReason.OTHER}>Lý do khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tiêu đề</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tóm tắt ngắn gọn vấn đề..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mô tả chi tiết</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Kể rõ sự việc xảy ra và mong muốn xử lý..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none text-slate-800 text-sm"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Đính kèm bằng chứng (Ảnh/Video)</label>
              
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 relative hover:border-red-400 transition-colors">
                <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
                <p className="text-xs font-medium text-slate-600">Kéo thả hoặc click để chọn file</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ JPG, PNG, MP4 (Tối đa 5 files)</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {files.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="bg-red-50 text-red-700 px-3 py-1.5 rounded-xl flex items-center justify-between border border-red-200 text-xs font-medium">
                      <span className="truncate max-w-[150px]" title={file.name}>
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-2 hover:text-red-900"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              {onClose && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 h-12 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-sm"
                >
                  Hủy bỏ
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/30 text-sm"
              >
                {loading ? 'Đang gửi...' : 'Gửi Tranh Chấp'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
