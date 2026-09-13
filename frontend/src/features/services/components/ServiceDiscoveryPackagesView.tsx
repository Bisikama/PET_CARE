'use client';

import React, { useState } from 'react';
import { useServiceDiscovery } from '../hooks/useServiceDiscovery';

export const ServiceDiscoveryPackagesView: React.FC = () => {
  const { packages, recommendations, isLoading, isSubmitting, error, createSuggestion } = useServiceDiscovery();

  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await createSuggestion({ title, description });
    if (ok) {
      setSuccessMsg('Cảm ơn bạn đã đề xuất dịch vụ mới!');
      setTitle('');
      setDescription('');
      setShowSuggestionModal(false);
    }
  };

  if (isLoading && packages.length === 0) {
    return <div className="p-8 text-center text-sm text-gray-500">Đang tải gói dịch vụ gợi ý...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gói Dịch Vụ & Gợi Ý Dành Cho Bạn</h2>
          <p className="text-xs text-gray-500">Khám phá các gói combo và gợi ý phù hợp nhất với thú cưng của bạn.</p>
        </div>
        <button
          onClick={() => setShowSuggestionModal(true)}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          + Đề Xuất Dịch Vụ Mới
        </button>
      </div>

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-600 dark:bg-emerald-950/40">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40">
          {error}
        </div>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            ⭐ Gợi Ý Cá Nhân Hóa
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="rounded-xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="font-bold text-gray-900 dark:text-white text-sm">{rec.serviceName}</div>
                <div className="text-xs text-gray-500 mt-1">{rec.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Packages Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
          📦 Danh Sách Gói Combo
        </h3>
        {packages.length === 0 ? (
          <p className="text-xs text-gray-400 py-4">Chưa có gói combo nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="font-extrabold text-emerald-600 text-lg">{pkg.name}</div>
                <p className="text-xs text-gray-500 mt-1">{pkg.description}</p>
                <div className="mt-4 pt-3 border-t flex justify-between items-center dark:border-gray-800">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    {Number(pkg.price).toLocaleString('vi-VN')} đ
                  </span>
                  <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                    Chọn Gói
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggestion Modal */}
      {showSuggestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Đề Xuất Dịch Vụ Mới</h3>
              <button onClick={() => setShowSuggestionModal(false)} className="rounded-lg p-1 text-gray-400">✕</button>
            </div>
            <form onSubmit={handleSuggestionSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Tên dịch vụ mong muốn</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border p-2 text-xs dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Mô tả nhu cầu</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="mt-1 w-full rounded-lg border p-2 text-xs dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSuggestionModal(false)}
                  className="rounded-lg border px-4 py-2 text-xs text-gray-600 dark:border-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Gửi đề xuất
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
