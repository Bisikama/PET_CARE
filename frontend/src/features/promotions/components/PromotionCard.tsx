'use client';

import * as React from 'react';
import { Tag, Copy, Check, Calendar, Coins, AlertCircle, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import { Promotion } from '../types';
import { promotionsService } from '../services/promotions.service';
import { Portal } from '@/components/ui/Portal';

interface PromotionCardProps {
  promotion: Promotion;
  onValidateSuccess?: (result: any) => void;
}

export function PromotionCard({ promotion, onValidateSuccess }: PromotionCardProps) {
  const [copied, setCopied] = React.useState(false);
  
  // Validation modal state
  const [showValidateModal, setShowValidateModal] = React.useState(false);
  const [orderValueInput, setOrderValueInput] = React.useState('200000');
  const [validating, setValidating] = React.useState(false);
  const [validateResult, setValidateResult] = React.useState<any | null>(null);
  const [validateError, setValidateError] = React.useState<string | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promotion.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (val?: number | null) => {
    if (val === null || val === undefined) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  const handleTestValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    const orderVal = parseFloat(orderValueInput);
    if (isNaN(orderVal) || orderVal <= 0) {
      setValidateError('Vui lòng nhập giá trị đơn hàng hợp lệ');
      return;
    }

    setValidating(true);
    setValidateError(null);
    setValidateResult(null);

    try {
      const res = await promotionsService.validatePromotion({
        code: promotion.code,
        orderValue: orderVal,
      });
      setValidateResult(res);
      if (onValidateSuccess) onValidateSuccess(res);
    } catch (err: any) {
      console.error('Validate error:', err);
      setValidateError(err?.response?.data?.message || err?.message || 'Mã không áp dụng được cho đơn này.');
    } finally {
      setValidating(false);
    }
  };

  const isExpired = new Date() > new Date(promotion.end_date);
  const isLimitReached = promotion.usage_limit !== null && promotion.used_count >= promotion.usage_limit;
  const isAvailable = promotion.is_active && !isExpired && !isLimitReached;

  return (
    <>
      <div className={`relative overflow-hidden rounded-3xl border transition-all duration-200 bg-white p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
        isAvailable ? 'border-amber-200 hover:border-amber-400' : 'border-slate-200 opacity-75 grayscale-[20%]'
      }`}>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-800 text-base tracking-tight font-mono">{promotion.code}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Sao chép mã"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] font-bold text-amber-600">
                {promotion.discount_percent
                  ? `Giảm ${promotion.discount_percent}% ${promotion.max_discount_amount ? `(Tối đa ${formatCurrency(promotion.max_discount_amount)})` : ''}`
                  : `Giảm trực tiếp ${formatCurrency(promotion.discount_amount)}`}
              </p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
            isAvailable
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {isAvailable ? 'Khả dụng' : isExpired ? 'Hết hạn' : isLimitReached ? 'Hết lượt' : 'Tạm ẩn'}
          </span>
        </div>

        {/* Requirements */}
        <div className="space-y-1.5 text-xs text-slate-500 font-semibold bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between">
            <span>Đơn tối thiểu:</span>
            <strong className="text-slate-800 font-bold">{promotion.min_order_value ? formatCurrency(promotion.min_order_value) : '0đ'}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Hạn sử dụng:</span>
            <span className="text-slate-700 font-medium">{formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}</span>
          </div>
          {promotion.usage_limit !== null && (
            <div className="flex items-center justify-between">
              <span>Số lượt khả dụng:</span>
              <span className="text-slate-700 font-medium">{promotion.used_count} / {promotion.usage_limit} lượt</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-1 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowValidateModal(true)}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow-sm transition-all duration-150 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Kiểm tra mã voucher
          </button>
        </div>
      </div>

      {/* Test Validate Modal */}
      {showValidateModal && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setShowValidateModal(false)} />
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4 z-10 border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-500" />
                  <h4 className="text-base font-black text-slate-800">Kiểm tra mã: {promotion.code}</h4>
                </div>
                <button onClick={() => setShowValidateModal(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">
                  Đóng
                </button>
              </div>

              <form onSubmit={handleTestValidate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Giả định giá trị đơn hàng (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={orderValueInput}
                    onChange={(e) => setOrderValueInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={validating}
                  className="w-full py-3 bg-[#031625] hover:bg-[#031625]/90 text-amber-400 text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xác minh giá giảm'}
                </button>
              </form>

              {validateError && (
                <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  {validateError}
                </div>
              )}

              {validateResult && (
                <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700 text-sm">
                    <ShieldCheck className="w-4 h-4" /> Mã hợp lệ!
                  </div>
                  <div className="space-y-1 border-t border-emerald-200/60 pt-2 font-semibold">
                    <div className="flex justify-between"><span>Giá ban đầu:</span> <span>{formatCurrency(validateResult.originalPrice)}</span></div>
                    <div className="flex justify-between text-emerald-700 font-bold"><span>Số tiền giảm:</span> <span>-{formatCurrency(validateResult.discountAmount)}</span></div>
                    <div className="flex justify-between text-slate-900 font-black text-sm border-t border-emerald-200 pt-1"><span>Còn thanh toán:</span> <span>{formatCurrency(validateResult.finalPrice)}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
