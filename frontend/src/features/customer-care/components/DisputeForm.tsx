'use client';

import React, { useState } from 'react';
import { useCustomerCareMutations } from '../hooks/useCustomerCare';
import { DisputeReason } from '../types';
import { UploadCloud, X } from 'lucide-react';

interface DisputeFormProps {
  bookingId: string;
  onSuccess?: () => void;
}

export function DisputeForm({ bookingId, onSuccess }: DisputeFormProps) {
  const { openDispute, loading, error } = useCustomerCareMutations();
  const [reason, setReason] = useState<DisputeReason>(DisputeReason.UNSATISFACTORY_SERVICE);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
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
    <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-slate-200 w-full max-w-2xl">
      <h3 className="text-2xl font-black text-slate-800 mb-2">Mở Tranh Chấp</h3>
      <p className="text-slate-500 text-sm mb-8">
        Xin lỗi vì trải nghiệm không tốt của bạn. Hãy cung cấp thông tin để chúng tôi có thể giải quyết nhanh nhất.
      </p>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Lý do tranh chấp</label>
          <select 
            value={reason}
            onChange={(e) => setReason(e.target.value as DisputeReason)}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50 font-medium text-slate-700"
          >
            <option value={DisputeReason.UNSATISFACTORY_SERVICE}>Dịch vụ không đạt yêu cầu</option>
            <option value={DisputeReason.PROVIDER_NO_SHOW}>Provider không đến</option>
            <option value={DisputeReason.CUSTOMER_NO_SHOW}>Tôi không thể đến</option>
            <option value={DisputeReason.PAYMENT_ISSUE}>Vấn đề thanh toán</option>
            <option value={DisputeReason.OTHER}>Lý do khác</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề</label>
          <input 
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tóm tắt vấn đề..."
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-700"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả chi tiết</label>
          <textarea 
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kể rõ sự việc xảy ra..."
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-slate-700"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Đính kèm bằng chứng (Ảnh/Video)</label>
          
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 relative hover:bg-slate-100 transition-colors">
            <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
            <p className="text-sm font-medium text-slate-600">Kéo thả hoặc click để chọn file</p>
            <p className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG, MP4 (Tối đa 5 files)</p>
            <input 
              type="file" 
              multiple 
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {files.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              {files.map((file, index) => (
                <div key={index} className="relative bg-slate-100 px-3 py-2 rounded-xl flex items-center justify-between border border-slate-200 group">
                  <span className="text-xs font-medium text-slate-600 truncate mr-2" title={file.name}>
                    {file.name}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-red-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white font-black py-4 rounded-xl hover:bg-red-700 disabled:opacity-70 transition-colors"
          >
            {loading ? 'Đang gửi...' : 'Gửi Tranh Chấp'}
          </button>
        </div>
      </form>
    </div>
  );
}
