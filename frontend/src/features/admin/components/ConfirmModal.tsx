'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  show,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!show) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onCancel}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden z-10 p-6 space-y-5 transform transition-all duration-300 animate-scale-up text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm">
          <Check className="w-6 h-6" />
        </div>
        
        <div className="space-y-2">
          <h4 className="text-base font-bold text-slate-800 uppercase tracking-wide">
            {title}
          </h4>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
          >
            {confirmText}
          </button>
        </div>
      </div>
      </div>
    </Portal>
  );
}
