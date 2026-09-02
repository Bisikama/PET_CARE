'use client';

import * as React from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit3, 
  ToggleLeft, 
  ToggleRight, 
  RefreshCw, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Coins, 
  X,
  Sparkles
} from 'lucide-react';
import { Promotion, CreatePromotionInput } from '../types';
import { promotionsService } from '../services/promotions.service';
import { Portal } from '@/components/ui/Portal';

export function AdminPromotionsManager() {
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [discountType, setDiscountType] = React.useState<'PERCENT' | 'AMOUNT'>('PERCENT');
  const [formData, setFormData] = React.useState({
    code: '',
    discountPercent: '10',
    discountAmount: '50000',
    minOrderValue: '200000',
    maxDiscountAmount: '100000',
    usageLimit: '100',
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
    isActive: true,
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [modalError, setModalError] = React.useState<string | null>(null);

  // Edit Modal state
  const [editModal, setEditModal] = React.useState<{
    show: boolean;
    promotion: Promotion | null;
    discountType: 'PERCENT' | 'AMOUNT';
    formData: any;
    submitting: boolean;
  }>({
    show: false,
    promotion: null,
    discountType: 'PERCENT',
    formData: {},
    submitting: false,
  });

  const fetchPromotions = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await promotionsService.getAllPromotionsAdmin();
      setPromotions(data || []);
    } catch (err: any) {
      console.error('Error fetching admin promotions:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách mã khuyến mãi.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.code.trim()) {
      setModalError('Vui lòng nhập mã khuyến mãi.');
      return;
    }

    const payload: CreatePromotionInput = {
      code: formData.code.trim().toUpperCase(),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      isActive: formData.isActive,
    };

    if (discountType === 'PERCENT') {
      const pct = parseFloat(formData.discountPercent);
      if (isNaN(pct) || pct <= 0 || pct > 100) {
        setModalError('Phần trăm giảm giá phải từ 1 đến 100%.');
        return;
      }
      payload.discountPercent = pct;
      if (formData.maxDiscountAmount) {
        payload.maxDiscountAmount = parseFloat(formData.maxDiscountAmount);
      }
    } else {
      const amt = parseFloat(formData.discountAmount);
      if (isNaN(amt) || amt <= 0) {
        setModalError('Số tiền giảm giá phải lớn hơn 0.');
        return;
      }
      payload.discountAmount = amt;
    }

    if (formData.minOrderValue) payload.minOrderValue = parseFloat(formData.minOrderValue);
    if (formData.usageLimit) payload.usageLimit = parseInt(formData.usageLimit, 10);

    setSubmitting(true);
    try {
      await promotionsService.createPromotion(payload);
      setShowCreateModal(false);
      await fetchPromotions();
    } catch (err: any) {
      console.error('Error creating promotion:', err);
      setModalError(err?.response?.data?.message || err?.message || 'Không thể tạo mã khuyến mãi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (promo: Promotion) => {
    try {
      await promotionsService.updatePromotion(promo.id, {
        is_active: !promo.is_active,
      });
      await fetchPromotions();
    } catch (err: any) {
      console.error('Error toggling active:', err);
      alert(err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái mã.');
    }
  };

  const handleOpenEditModal = (promo: Promotion) => {
    setEditModal({
      show: true,
      promotion: promo,
      discountType: promo.discount_percent ? 'PERCENT' : 'AMOUNT',
      formData: {
        code: promo.code,
        discountPercent: promo.discount_percent ? String(promo.discount_percent) : '',
        discountAmount: promo.discount_amount ? String(promo.discount_amount) : '',
        minOrderValue: promo.min_order_value ? String(promo.min_order_value) : '',
        maxDiscountAmount: promo.max_discount_amount ? String(promo.max_discount_amount) : '',
        usageLimit: promo.usage_limit !== null ? String(promo.usage_limit) : '',
        startDate: new Date(promo.start_date).toISOString().substring(0, 10),
        endDate: new Date(promo.end_date).toISOString().substring(0, 10),
        isActive: promo.is_active,
      },
      submitting: false,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.promotion) return;

    setEditModal(p => ({ ...p, submitting: true }));
    try {
      const f = editModal.formData;
      const updatePayload: any = {
        is_active: f.isActive,
        start_date: new Date(f.startDate).toISOString(),
        end_date: new Date(f.endDate).toISOString(),
        min_order_value: f.minOrderValue ? parseFloat(f.minOrderValue) : null,
        usage_limit: f.usageLimit ? parseInt(f.usageLimit, 10) : null,
      };

      if (editModal.discountType === 'PERCENT') {
        updatePayload.discount_percent = parseFloat(f.discountPercent);
        updatePayload.discount_amount = null;
        updatePayload.max_discount_amount = f.maxDiscountAmount ? parseFloat(f.maxDiscountAmount) : null;
      } else {
        updatePayload.discount_amount = parseFloat(f.discountAmount);
        updatePayload.discount_percent = null;
        updatePayload.max_discount_amount = null;
      }

      await promotionsService.updatePromotion(editModal.promotion.id, updatePayload);
      setEditModal(p => ({ ...p, show: false, submitting: false }));
      await fetchPromotions();
    } catch (err: any) {
      console.error('Error updating promotion:', err);
      alert(err?.response?.data?.message || err?.message || 'Không thể cập nhật mã.');
      setEditModal(p => ({ ...p, submitting: false }));
    }
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const filteredPromotions = promotions.filter(p => p.code.toLowerCase().includes(search.toLowerCase().trim()));

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-500" />
              Quản Lý Mã Khuyến Mãi (Admin Promotions)
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Tạo và cập nhật mã giảm giá qua API: <code className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-mono text-[11px]">POST & PUT /api/admin/promotions</code>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tạo mã khuyến mãi mới
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm mã khuyến mãi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-800 transition-all"
            />
          </div>
          <span className="text-xs font-bold text-slate-400">Tổng cộng {filteredPromotions.length} mã</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          {error}
        </div>
      )}

      {/* Promotions Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <span className="text-xs font-bold">Đang nạp danh sách mã khuyến mãi...</span>
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <Tag className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold">Chưa có mã khuyến mãi nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Mã giảm giá</th>
                  <th className="py-4 px-4">Hình thức giảm</th>
                  <th className="py-4 px-4">Đơn tối thiểu</th>
                  <th className="py-4 px-4">Lượt sử dụng</th>
                  <th className="py-4 px-4">Thời gian áp dụng</th>
                  <th className="py-4 px-4">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredPromotions.map((p) => {
                  const isExpired = new Date() > new Date(p.end_date);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-mono font-black text-slate-800 text-sm">{p.code}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-amber-600">
                          {p.discount_percent ? `${p.discount_percent}%` : formatCurrency(p.discount_amount)}
                        </span>
                        {p.max_discount_amount && (
                          <div className="text-[10px] text-slate-400">Tối đa: {formatCurrency(p.max_discount_amount)}</div>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-700">
                        {p.min_order_value ? formatCurrency(p.min_order_value) : 'Không giới hạn'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-800">{p.used_count}</span>
                        <span className="text-slate-400"> / {p.usage_limit !== null ? p.usage_limit : '∞'} lượt</span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-medium text-[11px]">
                        {formatDate(p.start_date)} - {formatDate(p.end_date)}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full border cursor-pointer ${
                            p.is_active && !isExpired
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {p.is_active && !isExpired ? <ToggleRight className="w-3.5 h-3.5 text-emerald-600" /> : <ToggleLeft className="w-3.5 h-3.5 text-rose-500" />}
                          {p.is_active && !isExpired ? 'BẬT (ACTIVE)' : isExpired ? 'HẾT HẠN' : 'TẮT (INACTIVE)'}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                          Cập nhật (PUT)
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Promotion Modal */}
      {showCreateModal && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => !submitting && setShowCreateModal(false)} />
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-5 z-10 border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-500" />
                  <h4 className="text-base font-extrabold text-slate-800">Tạo mã khuyến mãi mới (POST)</h4>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  {modalError}
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-medium">
                {/* Code input */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase tracking-wider block">Mã khuyến mãi (Code)</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: SUMMER2026"
                    value={formData.code}
                    onChange={(e) => setFormData(p => ({ ...p, code: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-mono font-bold uppercase outline-none focus:bg-white focus:border-slate-800"
                  />
                </div>

                {/* Discount Type */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase tracking-wider block">Hình thức giảm giá</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDiscountType('PERCENT')}
                      className={`p-2.5 rounded-2xl border font-bold transition-all ${
                        discountType === 'PERCENT' ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Theo phần trăm (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('AMOUNT')}
                      className={`p-2.5 rounded-2xl border font-bold transition-all ${
                        discountType === 'AMOUNT' ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Theo số tiền (VND)
                    </button>
                  </div>
                </div>

                {discountType === 'PERCENT' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 uppercase tracking-wider block">Phần trăm giảm (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.discountPercent}
                        onChange={(e) => setFormData(p => ({ ...p, discountPercent: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:bg-white focus:border-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 uppercase tracking-wider block">Giảm tối đa (VND)</label>
                      <input
                        type="number"
                        min="0"
                        step="10000"
                        value={formData.maxDiscountAmount}
                        onChange={(e) => setFormData(p => ({ ...p, maxDiscountAmount: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:bg-white focus:border-slate-800"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider block">Số tiền giảm (VND)</label>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData(p => ({ ...p, discountAmount: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:bg-white focus:border-slate-800"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider block">Đơn tối thiểu (VND)</label>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData(p => ({ ...p, minOrderValue: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:bg-white focus:border-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider block">Giới hạn số lượt sử dụng</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Bỏ trống nếu không giới hạn"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData(p => ({ ...p, usageLimit: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:bg-white focus:border-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider block">Ngày bắt đầu</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:bg-white focus:border-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider block">Ngày kết thúc</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:bg-white focus:border-slate-800"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={submitting}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-2xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tạo mã mới (POST)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Edit Promotion Modal */}
      {editModal.show && editModal.promotion && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => !editModal.submitting && setEditModal(p => ({ ...p, show: false }))} />
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-5 z-10 border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-indigo-500" />
                  <h4 className="text-base font-extrabold text-slate-800">Cập nhật mã: {editModal.promotion.code} (PUT)</h4>
                </div>
                <button onClick={() => setEditModal(p => ({ ...p, show: false }))} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-medium">
                {/* Active Toggle */}
                <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="font-bold text-slate-700">Kích hoạt mã khuyến mãi</span>
                  <button
                    type="button"
                    onClick={() => setEditModal(p => ({ ...p, formData: { ...p.formData, isActive: !p.formData.isActive } }))}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs border cursor-pointer ${
                      editModal.formData.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {editModal.formData.isActive ? 'Đang bật (ACTIVE)' : 'Đang tắt (INACTIVE)'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider block">Đơn tối thiểu (VND)</label>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      value={editModal.formData.minOrderValue}
                      onChange={(e) => setEditModal(p => ({ ...p, formData: { ...p.formData, minOrderValue: e.target.value } }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:bg-white focus:border-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider block">Giới hạn số lượt</label>
                    <input
                      type="number"
                      min="1"
                      value={editModal.formData.usageLimit}
                      onChange={(e) => setEditModal(p => ({ ...p, formData: { ...p.formData, usageLimit: e.target.value } }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:bg-white focus:border-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider block">Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={editModal.formData.startDate}
                      onChange={(e) => setEditModal(p => ({ ...p, formData: { ...p.formData, startDate: e.target.value } }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:bg-white focus:border-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider block">Ngày kết thúc</label>
                    <input
                      type="date"
                      value={editModal.formData.endDate}
                      onChange={(e) => setEditModal(p => ({ ...p, formData: { ...p.formData, endDate: e.target.value } }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:bg-white focus:border-slate-800"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditModal(p => ({ ...p, show: false }))}
                    disabled={editModal.submitting}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-2xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={editModal.submitting}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {editModal.submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu thay đổi (PUT)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
