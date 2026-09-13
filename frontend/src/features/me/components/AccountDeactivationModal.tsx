'use client';

import React, { useState } from 'react';
import { useUserSettings } from '../hooks/useUserSettings';

interface AccountDeactivationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountDeactivationModal: React.FC<AccountDeactivationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isSubmitting, error, deactivateAccount, deleteAccount } = useUserSettings() as any;
  const [confirmText, setConfirmText] = useState('');
  const [mode, setMode] = useState<'deactivate' | 'delete'>('deactivate');

  if (!isOpen) return null;

  const handleAction = async () => {
    if (confirmText !== 'XÁC NHẬN') return;
    const ok = mode === 'deactivate' ? await deactivateAccount() : await deleteAccount();
    if (ok) {
      window.location.href = '/login';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
          <h3 className="text-lg font-bold text-red-600">
            {mode === 'deactivate' ? 'Vô Hiệu Hóa Tài Khoản' : 'Xóa Vĩnh Viễn Tài Khoản'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('deactivate')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border ${
                mode === 'deactivate' ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-gray-200'
              }`}
            >
              Tạm ngưng tài khoản
            </button>
            <button
              onClick={() => setMode('delete')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border ${
                mode === 'delete' ? 'border-red-600 bg-red-50 text-red-800' : 'border-gray-200'
              }`}
            >
              Xóa tài khoản
            </button>
          </div>

          <p className="text-xs text-gray-500">
            {mode === 'deactivate'
              ? 'Tài khoản của bạn sẽ tạm thời ẩn và có thể khôi phục khi đăng nhập lại.'
              : 'Hành động này KHÔNG THỂ HOÀN TÁC. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.'}
          </p>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Nhập từ <span className="font-bold text-red-600">XÁC NHẬN</span> để tiếp tục:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="XÁC NHẬN"
              className="mt-1 w-full rounded-lg border p-2 text-xs dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleAction}
              disabled={confirmText !== 'XÁC NHẬN' || isSubmitting}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-40"
            >
              Thực hiện
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
