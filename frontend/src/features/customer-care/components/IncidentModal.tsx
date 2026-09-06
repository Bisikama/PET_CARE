'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Upload, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCustomerCareMutations } from '../hooks/useCustomerCare';
import { IncidentType } from '../types';

import { Portal } from '@/components/ui/Portal';

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onSuccess?: () => void;
}

const INCIDENT_TYPES = [
  { value: IncidentType.PET_HEALTH_EMERGENCY, label: 'Cấp cứu / Sức khỏe thú cưng' },
  { value: IncidentType.PROPERTY_DAMAGE, label: 'Hư hỏng tài sản' },
  { value: IncidentType.SAFETY_CONCERN, label: 'Vấn đề an toàn / Đe dọa' },
  { value: IncidentType.OTHER, label: 'Sự cố khác' },
];

export const IncidentModal: React.FC<IncidentModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  onSuccess,
}) => {
  const { reportIncident, loading, error } = useCustomerCareMutations();
  const [type, setType] = useState<IncidentType>(IncidentType.SAFETY_CONCERN);
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      await reportIncident(bookingId, {
        type,
        description,
        files,
      });
      setIsSubmitted(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setIsSubmitted(false);
        setDescription('');
        setFiles([]);
      }, 1800);
    } catch (err) {
      // Error handled by mutation hook
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden border border-red-100">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-rose-600"></div>

          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {isSubmitted ? (
            <div className="py-8 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-800">Đã gửi báo cáo sự cố!</h3>
              <p className="text-slate-600 text-sm max-w-xs mx-auto">
                Đội ngũ CSKH và ban quản lý an toàn đã nhận được thông tin và sẽ ưu tiên xử lý khẩn cấp cho bạn.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-red-50 text-red-600">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">Báo báo sự cố an toàn</h3>
                  <p className="text-slate-500 text-xs">Vui lòng cung cấp chi tiết sự cố xảy ra trong lịch đặt này</p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Loại sự cố</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as IncidentType)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 text-sm bg-slate-50 font-medium"
                >
                  {INCIDENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả sự cố khẩn cấp</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết những gì đã xảy ra, thời gian và hiện trạng hiện tại..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 text-sm resize-none"
                ></textarea>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Ảnh/Video bằng chứng (tối đa 5 file)
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-red-400 rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-slate-50">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-slate-500 font-medium">Bấm để tải ảnh hoặc hình ảnh chứng minh</span>
                </div>

                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-red-50 text-red-700 text-xs px-3 py-1.5 rounded-xl border border-red-200 font-medium"
                      >
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <button type="button" onClick={() => removeFile(idx)} className="hover:text-red-900">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 h-12 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/30"
                >
                  {loading ? 'Đang gửi...' : 'Báo cáo sự cố'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Portal>
  );
};
