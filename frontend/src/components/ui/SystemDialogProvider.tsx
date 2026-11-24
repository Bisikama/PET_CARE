'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';

export type SystemNoticeType = 'success' | 'error' | 'warning' | 'info';

export interface SystemToastItem {
  id: string;
  title: string;
  message: string;
  type: SystemNoticeType;
}

export interface SystemConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'warning' | 'danger' | 'info';
}

export interface SystemPromptOptions {
  title: string;
  message?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ActiveConfirm extends SystemConfirmOptions {
  resolve: (value: boolean) => void;
}

interface ActivePrompt extends SystemPromptOptions {
  resolve: (value: string | null) => void;
}

interface SystemDialogState {
  toasts: SystemToastItem[];
  activeConfirm: ActiveConfirm | null;
  activePrompt: ActivePrompt | null;
  pushToast: (item: Omit<SystemToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
  openConfirm: (options: SystemConfirmOptions) => Promise<boolean>;
  closeConfirm: (result: boolean) => void;
  openPrompt: (options: SystemPromptOptions) => Promise<string | null>;
  closePrompt: (result: string | null) => void;
}

export const useSystemDialogStore = create<SystemDialogState>((set, get) => ({
  toasts: [],
  activeConfirm: null,
  activePrompt: null,

  pushToast: (item) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({ toasts: [...state.toasts, { ...item, id }] }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 4500);
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  openConfirm: (options) => {
    return new Promise<boolean>((resolve) => {
      set({
        activeConfirm: {
          ...options,
          resolve,
        },
      });
    });
  },

  closeConfirm: (result) => {
    const current = get().activeConfirm;
    if (current) {
      current.resolve(result);
    }
    set({ activeConfirm: null });
  },

  openPrompt: (options) => {
    return new Promise<string | null>((resolve) => {
      set({
        activePrompt: {
          ...options,
          resolve,
        },
      });
    });
  },

  closePrompt: (result) => {
    const current = get().activePrompt;
    if (current) {
      current.resolve(result);
    }
    set({ activePrompt: null });
  },
}));

function inferNoticeType(message: string): { type: SystemNoticeType; title: string } {
  const lower = message.toLowerCase();
  if (
    lower.includes('thành công') ||
    lower.includes('đã đặt làm') ||
    lower.includes('hoàn tất')
  ) {
    return { type: 'success', title: 'Thao tác thành công' };
  }
  if (
    lower.includes('vui lòng') ||
    lower.includes('chưa') ||
    lower.includes('hãy') ||
    lower.includes('tối thiểu')
  ) {
    return { type: 'warning', title: 'Lưu ý từ hệ thống' };
  }
  return { type: 'error', title: 'Thông báo hệ thống' };
}

/**
 * Hiển thị thông báo hệ thống (thay thế hoàn toàn cho `window.alert` / `alert`).
 */
export function systemAlert(
  message: string,
  options?: { title?: string; type?: SystemNoticeType },
) {
  const inferred = inferNoticeType(message);
  useSystemDialogStore.getState().pushToast({
    title: options?.title ?? inferred.title,
    message,
    type: options?.type ?? inferred.type,
  });
}

/**
 * Hiển thị hộp thoại xác nhận sang trọng trên hệ thống (thay thế hoàn toàn cho `window.confirm` / `confirm`).
 */
export function systemConfirm(
  messageOrOptions: string | SystemConfirmOptions,
): Promise<boolean> {
  const opts: SystemConfirmOptions =
    typeof messageOrOptions === 'string'
      ? {
          message: messageOrOptions,
          title: messageOrOptions.toLowerCase().includes('xóa')
            ? 'Xác nhận xóa dữ liệu'
            : 'Xác nhận thao tác',
          variant: messageOrOptions.toLowerCase().includes('xóa') ? 'danger' : 'warning',
        }
      : messageOrOptions;

  return useSystemDialogStore.getState().openConfirm(opts);
}

/**
 * Hiển thị hộp thoại nhập nội dung trên hệ thống (thay thế hoàn toàn cho `window.prompt`).
 */
export function systemPrompt(options: SystemPromptOptions): Promise<string | null> {
  return useSystemDialogStore.getState().openPrompt(options);
}

const TOAST_STYLES: Record<
  SystemNoticeType,
  {
    icon: React.ReactNode;
    border: string;
    badgeBg: string;
    barColor: string;
  }
> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    border: 'border-emerald-200/90',
    badgeBg: 'bg-emerald-50 border-emerald-100',
    barColor: 'bg-emerald-500',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    border: 'border-amber-200/90',
    badgeBg: 'bg-amber-50 border-amber-100',
    barColor: 'bg-[#F7C948]',
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-rose-600" />,
    border: 'border-rose-200/90',
    badgeBg: 'bg-rose-50 border-rose-100',
    barColor: 'bg-rose-500',
  },
  info: {
    icon: <Info className="w-5 h-5 text-[#08243D]" />,
    border: 'border-slate-200/90',
    badgeBg: 'bg-slate-100 border-slate-200',
    barColor: 'bg-[#08243D]',
  },
};

export function SystemDialogProvider() {
  const { toasts, activeConfirm, activePrompt, dismissToast, closeConfirm, closePrompt } =
    useSystemDialogStore();
  const [mounted, setMounted] = React.useState(false);
  const [promptValue, setPromptValue] = React.useState('');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (activePrompt) {
      setPromptValue(activePrompt.defaultValue ?? '');
    }
  }, [activePrompt]);

  React.useEffect(() => {
    if (!activeConfirm && !activePrompt) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeConfirm) closeConfirm(false);
        if (activePrompt) closePrompt(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeConfirm, activePrompt, closeConfirm, closePrompt]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* 1. Floating Luxury System Toast Stack */}
      {toasts.length > 0 && (
        <div className="fixed top-5 right-5 z-[250] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0">
          {toasts.map((t) => {
            const style = TOAST_STYLES[t.type];
            return (
              <div
                key={t.id}
                className={`pointer-events-auto relative overflow-hidden rounded-2xl bg-white border ${style.border} shadow-xl p-4 flex items-start gap-3.5 animate-slide-down`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.barColor}`} />
                <div
                  className={`w-9 h-9 rounded-xl border ${style.badgeBg} flex items-center justify-center shrink-0 ml-1`}
                >
                  {style.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-[#08243D] tracking-tight">{t.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed break-words">
                    {t.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(t.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                  aria-label="Đóng thông báo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Luxury System Confirm Modal */}
      {activeConfirm && (
        <div
          onClick={() => closeConfirm(false)}
          className="fixed inset-0 z-[240] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden animate-scale-up"
          >
            {/* Header */}
            <div className="bg-[#08243D] px-6 py-4 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    activeConfirm.variant === 'danger'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                      : 'bg-white/10 text-[#F7C948] border border-white/15'
                  }`}
                >
                  {activeConfirm.variant === 'danger' ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {activeConfirm.title || 'Xác nhận thao tác hệ thống'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {activeConfirm.message}
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => closeConfirm(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  {activeConfirm.cancelText || 'Hủy bỏ'}
                </button>
                <button
                  type="button"
                  onClick={() => closeConfirm(true)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                    activeConfirm.variant === 'danger'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-[#08243D] hover:bg-[#0c3254] text-[#F7C948]'
                  }`}
                >
                  {activeConfirm.confirmText || 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Luxury System Prompt Modal */}
      {activePrompt && (
        <div
          onClick={() => closePrompt(null)}
          className="fixed inset-0 z-[240] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in select-none"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              if (!promptValue.trim()) return;
              closePrompt(promptValue.trim());
            }}
            className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden animate-scale-up"
          >
            <div className="bg-[#08243D] px-6 py-4 text-white flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white">{activePrompt.title}</h3>
              <button
                type="button"
                onClick={() => closePrompt(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {activePrompt.message && (
                <p className="text-xs text-slate-500 leading-relaxed">{activePrompt.message}</p>
              )}
              <input
                type="text"
                autoFocus
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                placeholder={activePrompt.placeholder || 'Nhập nội dung...'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#08243D] outline-none transition-colors"
              />
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => closePrompt(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  {activePrompt.cancelText || 'Hủy bỏ'}
                </button>
                <button
                  type="submit"
                  disabled={!promptValue.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#08243D] hover:bg-[#0c3254] text-xs font-bold text-[#F7C948] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  {activePrompt.confirmText || 'Xác nhận'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>,
    document.body,
  );
}
