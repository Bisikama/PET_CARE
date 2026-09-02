'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useDeleteService } from '../hooks/useDeleteService';
import { Service } from '../types';

interface DeleteServiceConfirmModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteServiceConfirmModal: React.FC<DeleteServiceConfirmModalProps> = ({
  service,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mounted, setMounted] = React.useState(false);
  const { deleteService, submitting, error: hookError } = useDeleteService();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);


  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!mounted || !isOpen || !service) return null;

  const handleDelete = async () => {
    setErrorMsg(null);
    try {
      await deleteService(service.id);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể xóa gói dịch vụ này.');
    }
  };


  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-[#29050d] pt-6 pb-5 px-6 text-white flex items-center justify-between border-b border-rose-800 shrink-0 select-none relative overflow-hidden">
          <div className="absolute right-0 top-0 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3.5 relative z-10 min-w-0 pr-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
              <Trash2 className="w-5.5 h-5.5 text-rose-400" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-lg font-black tracking-tight text-white truncate">
                Xác Nhận Xóa Dịch Vụ
              </h3>
              <p className="text-[11px] text-rose-300 font-medium">Hành động này có thể khôi phục từ DB Admin</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 w-9 h-9 flex items-center justify-center text-rose-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer shrink-0 active:scale-95"
            aria-label="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100/80 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              Cảnh báo xóa dịch vụ!
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Bạn có chắc chắn muốn xóa mềm gói dịch vụ{' '}
              <strong className="text-slate-900 font-extrabold">"{service.name}"</strong> (Mã:{' '}
              <code className="font-mono text-rose-700">{service.id.slice(0, 8)}...</code>)?
            </p>
          </div>

          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Dịch vụ sau khi xóa sẽ ẩn khỏi hệ thống đối tác và khách hàng đặt lịch. Các lịch đặt dịch vụ đã phát sinh trước đó vẫn giữ nguyên dữ liệu.
          </p>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-600/20 transition-all duration-150 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Xóa Gói Dịch Vụ
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
