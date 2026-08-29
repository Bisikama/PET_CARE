'use client';

import * as React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

export type ActionType =
  | 'approve-kyc'
  | 'approve-partner'
  | 'approve-screening'
  | 'reject-kyc'
  | 'reject-partner';

interface ActionConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  actionType: ActionType;
  providerId: string;
  onCancel: () => void;
  /**
   * For approve actions, reason will be undefined.
   * For reject actions, reason contains the input from textarea.
   */
  onConfirm: (reason?: string) => Promise<void>;
}

export function ActionConfirmModal({
  show,
  title,
  message,
  actionType,
  onCancel,
  onConfirm,
}: ActionConfirmModalProps) {
  const isReject = actionType.startsWith('reject');
  const [reason, setReason] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (show) {
      setReason('');
      setLoading(false);
    }
  }, [show]);

  if (!show) return null;

  const handleConfirm = async () => {
    if (isReject && !reason.trim()) {
      return;
    }
    setLoading(true);
    try {
      await onConfirm(isReject ? reason : undefined);
    } finally {
      setLoading(false);
    }
  };

  const Icon = isReject ? XCircle : CheckCircle2;
  const iconColor = isReject ? 'text-rose-500' : 'text-emerald-500';
  const iconBg = isReject ? 'bg-rose-50' : 'bg-emerald-50';
  const confirmBtnClass = isReject
    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200';

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl z-10 overflow-hidden animate-scale-up">
        {/* Header stripe */}
        <div className={`h-1.5 w-full ${isReject ? 'bg-rose-500' : 'bg-emerald-500'}`} />

        <div className="p-6 space-y-5">
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon + Title */}
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center shrink-0`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-800 leading-snug">{title}</h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {isReject ? 'Hành động này sẽ gửi thông báo tới đối tác.' : 'Xem lại trước khi xác nhận.'}
              </p>
            </div>
          </div>

          {/* Message */}
          <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed border ${
            isReject
              ? 'bg-rose-50/60 text-rose-800 border-rose-100'
              : 'bg-emerald-50/60 text-emerald-800 border-emerald-100'
          }`}>
            {message}
          </div>

          {/* Reject reason textarea */}
          {isReject && (
            <div className="space-y-2">
              <label htmlFor="reject-reason" className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Lý do từ chối (bắt buộc)
              </label>
              <textarea
                id="reject-reason"
                rows={3}
                placeholder="Nhập lý do chi tiết để gửi tới đối tác..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all duration-200 resize-none"
              />
              {isReject && !reason.trim() && (
                <p className="text-[11px] text-rose-500 font-semibold">* Vui lòng nhập lý do trước khi xác nhận</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-2xl transition-all cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || (isReject && !reason.trim())}
              className={`flex-1 py-2.5 text-white text-sm font-bold rounded-2xl shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${confirmBtnClass}`}
            >
              {loading ? 'Đang xử lý...' : isReject ? 'Xác nhận từ chối' : 'Xác nhận'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </Portal>
  );
}
