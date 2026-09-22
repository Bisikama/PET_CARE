'use client';

import React, { useState } from 'react';
import { useBookingMatching } from '../hooks/useBookingMatching';

interface BookingMatchingSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId?: string;
}

export const BookingMatchingSearchModal: React.FC<BookingMatchingSearchModalProps> = ({
  isOpen,
  onClose,
  serviceId = '',
}) => {
  const {
    calculatedPrice,
    matchingProviders,
    isLoading,
    isSubmitting,
    error,
    calculatePrice,
    searchMatchingProviders,
  } = useBookingMatching();

  const [lat, setLat] = useState(10.762622);
  const [lng, setLng] = useState(106.660172);
  const [scheduledTime, setScheduledTime] = useState(new Date().toISOString());

  if (!isOpen) return null;

  const handleCalcPrice = async () => {
    if (!serviceId) return;
    await calculatePrice({
      serviceId,
      startTime: scheduledTime,
    });
  };

  const handleSearchMatching = async () => {
    if (!serviceId) return;
    await searchMatchingProviders({
      serviceId,
      latitude: lat,
      longitude: lng,
      scheduledTime,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Ghép Cặp & Tính Giá Xem Trước
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Thời gian dự kiến
            </label>
            <input
              type="datetime-local"
              value={scheduledTime.slice(0, 16)}
              onChange={(e) => setScheduledTime(new Date(e.target.value).toISOString())}
              className="mt-1 w-full rounded-lg border p-2 text-xs dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCalcPrice}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang tính giá...' : 'Tính giá xem trước'}
            </button>
            <button
              onClick={handleSearchMatching}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isLoading ? 'Đang tìm kiếm...' : 'Tìm Provider ghép cặp'}
            </button>
          </div>

          {/* Combined Price Result */}
          {calculatedPrice && (
            <div className="rounded-xl bg-emerald-50 p-3.5 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Kết quả tính giá:</span>
              <div className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {calculatedPrice.finalPrice
                  ? Number(calculatedPrice.finalPrice).toLocaleString('vi-VN') + ' đ'
                  : JSON.stringify(calculatedPrice)}
              </div>
            </div>
          )}

          {/* Provider Search Results */}
          {matchingProviders.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Provider Phù Hợp ({matchingProviders.length})
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {matchingProviders.map((p: any, idx: number) => (
                  <div key={p.id || idx} className="flex justify-between items-center rounded-lg border p-2.5 text-xs dark:border-gray-800">
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{p.fullName || p.name || `Provider #${idx+1}`}</div>
                      <span className="text-gray-400">Khoảng cách: {p.distanceKm || 'Gần bạn'} km</span>
                    </div>
                    <button className="rounded bg-emerald-600 px-2.5 py-1 text-white hover:bg-emerald-700">
                      Chọn
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
