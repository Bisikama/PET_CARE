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

  // Apply promo state
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
    <div className="space-y-6 animate-fade-in select-none">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold uppercase tracking-wider backdrop-blur-sm">
              <Tag className="w-3.5 h-3.5" /> Kho Ưu Đãi & Mã Giảm Giá Đang Áp Dụng
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Sưu Tầm Voucher Tiết Kiệm Chi Phí Chăm Sóc Bé Cưng
            </h2>
            <p className="text-amber-100 text-xs md:text-sm font-medium leading-relaxed max-w-xl">
              Áp dụng mã giảm giá khi thanh toán dịch vụ tắm rửa, cắt tỉa và chăm sóc thú cưng tại nhà.
            </p>
          </div>

          <button
            onClick={fetchPromotions}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-amber-900 font-bold text-xs shadow-lg hover:bg-amber-50 transition-all cursor-pointer disabled:opacity-50 shrink-0 self-start md:self-center"
          >
            <RefreshCw className={`w-4 h-4 text-amber-800 ${loading ? 'animate-spin' : ''}`} />
            Làm mới danh sách
          </button>
        </div>
      </div>

      {/* Apply Promo Code Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-emerald-500" />
          <h3 className="text-sm font-black text-slate-800 tracking-tight">Áp dụng mã khuyến mãi</h3>
          <code className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">POST /promotions/apply</code>
        </div>

        <form onSubmit={handleApplyPromo} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mã khuyến mãi</label>
            <input
              type="text"
              placeholder="VD: SUMMER2026"
              value={promoCode}
              onChange={(e) => { setPromoCode(e.target.value); clearResult(); }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 uppercase outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Giá trị đơn (VND)</label>
            <input
              type="number"
              min="0"
              step="10000"
              placeholder="500000"
              value={orderValue}
              onChange={(e) => { setOrderValue(e.target.value); clearResult(); }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isApplying || !promoCode.trim() || !orderValue.trim()}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              {isApplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ticket className="w-3.5 h-3.5" />}
              {isApplying ? 'Đang kiểm tra...' : 'Áp dụng mã'}
            </button>
          </div>
        </form>

        {/* Apply result */}
        {applyResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-emerald-800">Áp dụng mã <span className="font-mono">{applyResult.code}</span> thành công!</p>
              <div className="flex flex-wrap gap-3 mt-1.5">
                <span className="px-2.5 py-1 bg-white rounded-lg font-bold text-emerald-700 border border-emerald-100">
                  Giảm: {formatCurrency(applyResult.discountAmount)}
                </span>
                <span className="px-2.5 py-1 bg-white rounded-lg font-bold text-slate-700 border border-slate-100">
                  Tổng sau giảm: {formatCurrency(applyResult.finalPrice)}
                </span>
              </div>
              {applyResult.message && <p className="text-emerald-600 font-medium mt-1">{applyResult.message}</p>}
            </div>
          </div>
        )}

        {/* Apply error */}
        {applyError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            {applyError}
          </div>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Tag className="w-4 h-4 text-amber-500" />
          <span>Danh sách mã khả dụng ({filteredPromotions.length})</span>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã khuyến mãi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-800 transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          {error}
        </div>
      )}

      {/* Grid List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-100">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <span className="text-xs font-bold">Đang nạp danh sách voucher ưu đãi...</span>
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 space-y-2">
          <Tag className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-bold">Hiện không có mã khuyến mãi nào khả dụng.</p>
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
