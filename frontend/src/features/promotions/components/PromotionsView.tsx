'use client';

import * as React from 'react';
import { Tag, Search, RefreshCw, Loader2, AlertTriangle, CheckCircle2, Ticket } from 'lucide-react';
import { Promotion } from '../types';
import { promotionsService } from '../services/promotions.service';
import { PromotionCard } from './PromotionCard';
import { useApplyPromotion } from '../hooks/useApplyPromotion';

export function PromotionsView() {
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');

  const [promoCode, setPromoCode] = React.useState('');
  const [orderValue, setOrderValue] = React.useState('');
  const { applyPromotion, isLoading: isApplying, error: applyError, result: applyResult, clearResult } = useApplyPromotion();

  const fetchPromotions = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await promotionsService.getActivePromotions();
      setPromotions(list || []);
    } catch (err: any) {
      console.error('Error loading active promotions:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách khuyến mãi.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim() || !orderValue.trim()) return;
    await applyPromotion({
      promoCode: promoCode.trim().toUpperCase(),
      orderValue: parseFloat(orderValue),
    });
  };

  const filteredPromotions = promotions.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase().trim())
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="space-y-6 pb-8 animate-fade-in select-none">
      {/* Clean Navy Banner */}
      <div className="bg-[#08243D] p-8 rounded-3xl text-white shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#F7C948]">
              Kho ưu đãi & Voucher
            </p>
            <h2 className="text-2xl font-bold tracking-tight">
              Mã Giảm Giá Dịch Vụ Chăm Sóc
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Áp dụng mã ưu đãi khi thanh toán các gói tắm sấy và chăm sóc thú cưng tại nhà.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPromotions}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0 self-start md:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Apply Promo Code Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Ticket className="w-4.5 h-4.5 text-[#08243D]" />
          <h3 className="text-sm font-bold text-[#08243D]">Kiểm tra mã khuyến mãi</h3>
        </div>

        <form onSubmit={handleApplyPromo} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mã khuyến mãi</label>
            <input
              type="text"
              placeholder="VD: SUMMER2026"
              value={promoCode}
              onChange={(e) => { setPromoCode(e.target.value); clearResult(); }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase outline-none focus:bg-white focus:border-[#08243D] transition-colors"
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Giá trị đơn (VNĐ)</label>
            <input
              type="number"
              min="0"
              step="10000"
              placeholder="250000"
              value={orderValue}
              onChange={(e) => { setOrderValue(e.target.value); clearResult(); }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#08243D] transition-colors"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isApplying || !promoCode.trim() || !orderValue.trim()}
              className="px-5 py-2.5 bg-[#08243D] hover:bg-[#0c3254] text-[#F7C948] font-bold text-xs rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              {isApplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ticket className="w-3.5 h-3.5" />}
              {isApplying ? 'Đang kiểm tra...' : 'Kiểm tra mã'}
            </button>
          </div>
        </form>

        {applyResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-emerald-800">Mã <span className="font-mono">{applyResult.code}</span> hợp lệ!</p>
              <p className="text-slate-600">
                Giảm <strong className="text-emerald-700">{formatCurrency(applyResult.discountAmount)}</strong> · Còn thanh toán: <strong className="text-[#08243D]">{formatCurrency(applyResult.finalPrice)}</strong>
              </p>
            </div>
          </div>
        )}

        {applyError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-medium rounded-xl border border-rose-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            {applyError}
          </div>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-[#08243D]">
          Danh sách mã khả dụng ({filteredPromotions.length})
        </h3>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã khuyến mãi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#08243D] transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs font-medium rounded-2xl border border-rose-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2 bg-white rounded-3xl border border-slate-200/70">
          <Loader2 className="w-7 h-7 animate-spin text-[#08243D]" />
          <span className="text-xs font-medium">Đang tải danh sách ưu đãi...</span>
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/70 text-slate-400 space-y-2">
          <Tag className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">Hiện không có mã khuyến mãi nào khả dụng</p>
          <p className="text-xs text-slate-400">Bạn vẫn có thể nhập mã riêng vào khung kiểm tra phía trên.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPromotions.map((promo) => (
            <PromotionCard key={promo.id} promotion={promo} />
          ))}
        </div>
      )}
    </div>
  );
}


