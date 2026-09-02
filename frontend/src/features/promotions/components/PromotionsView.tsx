'use client';

import * as React from 'react';
import { Tag, Search, RefreshCw, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { Promotion } from '../types';
import { promotionsService } from '../services/promotions.service';
import { PromotionCard } from './PromotionCard';

export function PromotionsView() {
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');

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

  const filteredPromotions = promotions.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" /> Kho Ưu Đãi & Mã Giảm Giá Đang Áp Dụng
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
