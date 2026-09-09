'use client';

import React, { useState } from 'react';
import { useAdminUsersManager } from '../hooks/useAdminUsersManager';

export const AdminUsersManagerTable: React.FC = () => {
  const { adminUsers, deactivationRequests, isLoading, error, approveDeactivation, rejectDeactivation } = useAdminUsersManager();
  const [tab, setTab] = useState<'users' | 'deactivations'>('users');

  if (isLoading && adminUsers.length === 0) {
    return <div className="py-8 text-center text-sm text-gray-500">Đang tải danh sách người dùng...</div>;
  }

  return (
    <div className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex justify-between items-center border-b pb-3 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quản Lý Nâng Cao Người Dùng & Yêu Cầu Hủy</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('users')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
              tab === 'users' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Tất cả User ({adminUsers.length})
          </button>
          <button
            onClick={() => setTab('deactivations')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
              tab === 'deactivations' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Yêu cầu hủy ({deactivationRequests.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/40">{error}</div>
      )}

      {tab === 'users' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="p-3">Họ và tên</th>
                <th className="p-3">Email / SĐT</th>
                <th className="p-3">Vai trò</th>
                <th className="p-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {adminUsers.map((u, idx) => (
                <tr key={u.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="p-3 font-semibold text-gray-900 dark:text-white">{u.fullName || u.name || 'User'}</td>
                  <td className="p-3 text-gray-500">{u.email || u.phone || 'N/A'}</td>
                  <td className="p-3">
                    <span className="rounded bg-blue-100 px-2 py-0.5 font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {u.role || 'CUSTOMER'}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-emerald-600">{u.status || 'ACTIVE'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {deactivationRequests.length === 0 ? (
            <p className="py-8 text-center text-xs text-gray-400">Không có yêu cầu hủy tài khoản nào đang chờ.</p>
          ) : (
            deactivationRequests.map((req) => (
              <div key={req.id} className="flex justify-between items-center rounded-xl border p-3.5 text-xs dark:border-gray-800">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{req.userName || req.userId}</div>
                  <div className="text-gray-400">Lý do: {req.reason || 'Không có lý do cụ thể'}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveDeactivation(req.id)}
                    className="rounded bg-red-600 px-3 py-1 font-semibold text-white hover:bg-red-700"
                  >
                    Duyệt hủy
                  </button>
                  <button
                    onClick={() => rejectDeactivation(req.id)}
                    className="rounded border px-3 py-1 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
