'use client';

import * as React from 'react';
import { Portal } from '@/components/ui/Portal';

interface RejectReasonModalProps {
  show: boolean;
  title: string;
  label: string;
  placeholder?: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function RejectReasonModal({
  show,
  title,
  label,
  placeholder = 'Nhập lý do chi tiết...',
  onConfirm,
  onCancel,
}: RejectReasonModalProps) {
  const [reason, setReason] = React.useState('');

  React.useEffect(() => {
    if (show) {
      setReason('');
    }
  }, [show]);

  if (!show) return null;

  const handleConfirmClick = () => {
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do.');
      return;
    }
    onConfirm(reason);
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onCancel}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden z-10 p-6 space-y-4 transform transition-all duration-300 animate-scale-up">
        <h4 className="text-base font-bold text-slate-800 uppercase tracking-wide">
          {title}
        </h4>
        
        <div className="space-y-1.5">
          <label htmlFor="reject-reason" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {label}
          </label>
          <textarea
            id="reject-reason"
            rows={3}
            placeholder={placeholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 transition-all duration-200"
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-400 hover:text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirmClick}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
      </div>
    </Portal>
  );
}
