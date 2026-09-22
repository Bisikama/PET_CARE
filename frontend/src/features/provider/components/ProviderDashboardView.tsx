'use client';

import React from 'react';
import { useProviderDashboard } from '../hooks/useProviderDashboard';

export const ProviderDashboardView: React.FC = () => {
  const {
    providerData,
    dashboardData,
    reviews,
    trustScoreLogs,
    capabilities,
    isLoading,
    error,
    updateStatus,
  } = useProviderDashboard();

  if (isLoading && !dashboardData) {
    return <div className="p-8 text-center text-sm text-gray-500">Đang tải bảng điều khiển đối tác...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header & Status */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-lg">
        <div>
          <h1 className="text-2xl font-extrabold">{providerData?.fullName || 'Đối Tác Pet Care'}</h1>
          <p className="mt-1 text-xs opacity-90">Điểm uy tín: <span className="font-bold text-yellow-300">{(providerData as any)?.trustScore || 100} điểm</span></p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold">Trạng thái:</span>
          <select
            value={(providerData as any)?.status || 'ONLINE'}
            onChange={(e) => updateStatus(e.target.value)}
            className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-white/30"
          >

            <option value="ONLINE" className="text-gray-900">🟢 Đang hoạt động (Online)</option>
            <option value="BUSY" className="text-gray-900">🟡 Đang bận (Busy)</option>
            <option value="OFFLINE" className="text-gray-900">🔴 Tạm ngưng (Offline)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs text-gray-400 uppercase font-semibold">Tổng Đơn Đã Nhận</span>
          <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
            {dashboardData?.totalBookings || 0}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs text-gray-400 uppercase font-semibold">Doanh Thu Tạm Tính</span>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            {dashboardData?.revenue ? Number(dashboardData.revenue).toLocaleString('vi-VN') + ' đ' : '0 đ'}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs text-gray-400 uppercase font-semibold">Đánh Giá Trung Bình</span>
          <div className="mt-2 text-2xl font-bold text-amber-500">
            ⭐ {dashboardData?.averageRating || '5.0'} / 5
          </div>
        </div>
      </div>

      {/* Trust Score Logs & Capabilities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Trust Score Logs */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Lịch Sử Điểm Uy Tín</h3>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 text-xs">
            {trustScoreLogs.length === 0 ? (
              <p className="text-gray-400 py-4 text-center">Chưa có thay đổi điểm uy tín.</p>
            ) : (
              trustScoreLogs.map((log, idx) => (
                <div key={log.id || idx} className="flex justify-between border-b pb-2 dark:border-gray-800">
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{log.reason}</div>
                    <span className="text-gray-400">{new Date(log.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <span className={`font-bold ${log.scoreChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {log.scoreChange >= 0 ? `+${log.scoreChange}` : log.scoreChange}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Capabilities */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Năng Lực Phục Vụ (Capabilities)</h3>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 text-xs">
            {capabilities.length === 0 ? (
              <p className="text-gray-400 py-4 text-center">Chưa có thông tin năng lực.</p>
            ) : (
              capabilities.map((cap, idx) => (
                <div key={cap.id || idx} className="flex justify-between items-center rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800/60">
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{cap.serviceName || cap.serviceId}</span>
                    <div className="text-gray-400 text-[11px]">Loài: {cap.petSpecies} | Cân nặng: {cap.minWeight} - {cap.maxWeight} kg</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
