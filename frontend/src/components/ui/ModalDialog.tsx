'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ModalDialogProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  isBusy?: boolean;
}

export function ModalDialog({ title, children, onClose, isBusy }: ModalDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-busy={isBusy || undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (!isBusy) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-11/12 max-w-md overflow-y-auto rounded-3xl bg-white p-6 text-slate-800 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 id={titleId} className="text-lg font-bold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          disabled={isBusy}
          aria-label="Đóng"
          className="shrink-0 rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      {children}
    </dialog>
  );
}

interface SuccessDialogProps {
  title: string;
  message: string;
  onClose: () => void;
}

export function SuccessDialog({ title, message, onClose }: SuccessDialogProps) {
  return (
    <ModalDialog title={title} onClose={onClose}>
      <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-800">
        <CheckCircle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
        <p>{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-5 w-full rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
      >
        Đã hiểu
      </button>
    </ModalDialog>
  );
}
