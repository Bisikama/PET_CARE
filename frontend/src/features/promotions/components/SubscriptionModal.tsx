'use client';

import React, { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLANS = [
  { id: 'BASIC', name: 'Gói Cơ Bản', price: 99000, period: '1 tháng', desc: 'Dành cho chủ nuôi có 1-2 thú cưng.' },
  { id: 'PREMIUM', name: 'Gói VIP Pro', price: 249000, period: '1 tháng', desc: 'Ưu tiên ghép cặp provider & miễn phí tư vấn y tế.' },
  { id: 'YEARLY', name: 'Gói Tiết Kiệm Năm', price: 1990000, period: '12 tháng', desc: 'Tiết kiệm 35% chi phí dịch vụ chăm sóc cả năm.' },
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { mySubscription, isSubmitting, error, checkoutVnPay, checkoutWallet } = useSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState('PREMIUM');

  if (!isOpen) return null;

  const handleCheckoutVnPay = async () => {
    const url = await checkoutVnPay({ planId: selectedPlanId, paymentMethod: 'VNPAY' });
    if (url) window.location.href = url;
  };

  const handleCheckoutWallet = async () => {
    const ok = await checkoutWallet({ planId: selectedPlanId, paymentMethod: 'WALLET' });
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Đăng Ký Gói Chăm Sóc Thú Cưng</h3>
            {mySubscription && (
              <span className="text-xs text-emerald-600 font-semibold">
                Đang dùng: {mySubscription.planName} (Hạn đến {new Date(mySubscription.expiresAt).toLocaleDateString('vi-VN')})
              </span>
            )}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`cursor-pointer flex items-center justify-between rounded-xl border p-4 transition ${
                selectedPlanId === plan.id
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">{plan.name}</div>
                <div className="text-xs text-gray-500">{plan.desc}</div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-emerald-600 text-base">
                  {plan.price.toLocaleString('vi-VN')} đ
                </div>
                <div className="text-[11px] text-gray-400">/ {plan.period}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleCheckoutWallet}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Thanh toán bằng Ví PetCare
          </button>
          <button
            onClick={handleCheckoutVnPay}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Thanh toán qua VNPay
          </button>
        </div>
      </div>
    </div>
  );
};
