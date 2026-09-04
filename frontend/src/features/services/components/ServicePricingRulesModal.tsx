'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Coins,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  Loader2,
  Clock,
  Dog,
  CheckCircle2,
  XCircle,
  Save,
  RotateCcw
} from 'lucide-react';
import { usePricingRules } from '../hooks/usePricingRules';
import { Service, PricingRule, CreatePricingRuleData, UpdatePricingRuleData } from '../types';

interface ServicePricingRulesModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

const SPECIES_OPTIONS = [
  { value: 'Dog', label: '🐶 Chó (Dog)' },
  { value: 'Cat', label: '🐱 Mèo (Cat)' },
  { value: 'Other', label: '🐾 Thú cưng khác' },
];

export const ServicePricingRulesModal: React.FC<ServicePricingRulesModalProps> = ({
  service,
  isOpen,
  onClose,
}) => {
  const [mounted, setMounted] = React.useState(false);
  const { pricingRules, isLoading, error, createRule, updateRule, deleteRule } = usePricingRules(
    isOpen && service ? service.id : null
  );

  const [editingRule, setEditingRule] = React.useState<PricingRule | null>(null);
  const [deletingRuleId, setDeletingRuleId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const confirmDeleteRule = async (ruleId: string) => {
    try {
      await deleteRule(ruleId);
      if (editingRule?.id === ruleId) {
        setEditingRule(null);
      }
      setDeletingRuleId(null);
    } catch (err: any) {
      setFormError(err.message || 'Không thể xóa quy tắc tính giá.');
    }
  };


  const [formData, setFormData] = React.useState<{
    petSpecies: string;
    minWeight: string;
    maxWeight: string;
    price: string;
    durationMinutes: string;
    isActive: boolean;
  }>({
    petSpecies: 'Dog',
    minWeight: '0',
    maxWeight: '5',
    price: '200000',
    durationMinutes: '60',
    isActive: true,
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form state when modal opens or editing rule changes
  React.useEffect(() => {
    if (editingRule) {
      setFormData({
        petSpecies: editingRule.petSpecies || 'Dog',
        minWeight: editingRule.minWeight !== null ? String(editingRule.minWeight) : '',
        maxWeight: editingRule.maxWeight !== null ? String(editingRule.maxWeight) : '',
        price: String(editingRule.price || 0),
        durationMinutes: String(editingRule.durationMinutes || 60),
        isActive: editingRule.isActive ?? true,
      });
    } else {
      setFormData({
        petSpecies: 'Dog',
        minWeight: '0',
        maxWeight: '5',
        price: '200000',
        durationMinutes: service ? String(service.durationMinutes) : '60',
        isActive: true,
      });
    }
    setFormError(null);
  }, [editingRule, service, isOpen]);

  if (!mounted || !isOpen || !service) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    setFormError(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const priceNum = Number(formData.price);
    const durationNum = Number(formData.durationMinutes);
    const minWNum = formData.minWeight !== '' ? Number(formData.minWeight) : null;
    const maxWNum = formData.maxWeight !== '' ? Number(formData.maxWeight) : null;

    if (!formData.petSpecies) {
      setFormError('Vui lòng chọn loại thú cưng.');
      return;
    }

    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Giá áp dụng phải lớn hơn hoặc bằng 0.');
      return;
    }

    if (isNaN(durationNum) || durationNum < 1) {
      setFormError('Thời lượng thực hiện phải tối thiểu 1 phút.');
      return;
    }

    if (minWNum !== null && maxWNum !== null && minWNum > maxWNum) {
      setFormError('Cân nặng tối thiểu không thể lớn hơn cân nặng tối đa.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingRule) {
        // PATCH /api/services/pricing-rules/{ruleId}
        const updatePayload: UpdatePricingRuleData = {
          petSpecies: formData.petSpecies,
          minWeight: minWNum,
          maxWeight: maxWNum,
          price: priceNum,
          durationMinutes: durationNum,
          isActive: formData.isActive,
        };
        await updateRule(editingRule.id, updatePayload);
        setEditingRule(null);
      } else {
        // POST /api/services/{id}/pricing-rules
        const createPayload: CreatePricingRuleData = {
          petSpecies: formData.petSpecies,
          minWeight: minWNum,
          maxWeight: maxWNum,
          price: priceNum,
          durationMinutes: durationNum,
          isActive: formData.isActive,
        };
        await createRule(createPayload);
      }
    } catch (err: any) {
      setFormError(err.message || 'Không thể lưu quy tắc tính giá này.');
    } finally {
      setSubmitting(false);
    }
  };


  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[88vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-[#1c1203] pt-7 pb-6 px-7 text-white flex items-center justify-between border-b border-amber-900/60 shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10 min-w-0 pr-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <Coins className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="text-xl font-black tracking-tight text-white truncate">
                Bảng Giá Chi Tiết (Pricing Rules)
              </h3>
              <p className="text-xs text-amber-200/80 font-medium leading-normal truncate">
                Cấu hình khung giá theo cân nặng & loài cho gói dịch vụ <span className="text-amber-400 font-bold">{service.name}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 w-9 h-9 flex items-center justify-center text-amber-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer shrink-0 active:scale-95"
            aria-label="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-7 space-y-6">
          {(error || formError) && (
            <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{formError || error}</span>
            </div>
          )}

          {/* Form to Add or Edit Pricing Rule */}
          <form onSubmit={handleSubmitForm} className="bg-amber-50/40 p-5 rounded-2xl border border-amber-200/60 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                {editingRule ? <Edit3 className="w-4 h-4 text-amber-600" /> : <Plus className="w-4 h-4 text-amber-600" />}
                {editingRule ? `Chỉnh sửa quy tắc (ID: ${editingRule.id.slice(0, 8)}...)` : 'Thêm quy tắc tính giá mới'}
              </h4>

              {editingRule && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Hủy sửa
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Pet Species */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Loài thú cưng</label>
                <select
                  name="petSpecies"
                  value={formData.petSpecies}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                >
                  {SPECIES_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Weight */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Cân nặng tối thiểu (kg)</label>
                <input
                  type="number"
                  name="minWeight"
                  step="0.5"
                  min="0"
                  value={formData.minWeight}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Max Weight */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Cân nặng tối đa (kg)</label>
                <input
                  type="number"
                  name="maxWeight"
                  step="0.5"
                  min="0"
                  value={formData.maxWeight}
                  onChange={handleInputChange}
                  placeholder="10 (để trống nếu không giới hạn)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              {/* Price */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Mức giá áp dụng (VND)</label>
                <input
                  type="number"
                  name="price"
                  step="10000"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="250000"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Duration Minutes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Thời lượng (Phút)</label>
                <input
                  type="number"
                  name="durationMinutes"
                  step="15"
                  min="1"
                  value={formData.durationMinutes}
                  onChange={handleInputChange}
                  placeholder="60"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang lưu...
                    </>
                  ) : editingRule ? (
                    <>
                      <Save className="w-3.5 h-3.5" /> Lưu Cập Nhật
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Thêm Quy Tắc
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Pricing Rules List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Danh sách quy tắc giá hiện có ({pricingRules.length})
              </h4>
            </div>

            {isLoading && pricingRules.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-400">Đang tải danh sách bảng giá...</p>
              </div>
            ) : pricingRules.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <Coins className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Chưa có quy tắc giá nào</p>
                <p className="text-[11px] text-slate-400">Nhập biểu mẫu ở trên để khởi tạo quy tắc tính giá theo loài & cân nặng đầu tiên.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                <div className="bg-slate-50 px-4 py-2.5 grid grid-cols-12 font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">
                  <span className="col-span-3">Loài & Cân nặng</span>
                  <span className="col-span-3">Mức giá</span>
                  <span className="col-span-2">Thời lượng</span>
                  <span className="col-span-2">Trạng thái</span>
                  <span className="col-span-2 text-right">Thao tác</span>
                </div>

                {pricingRules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`px-4 py-3 grid grid-cols-12 items-center font-semibold text-slate-700 transition-colors ${
                      editingRule?.id === rule.id ? 'bg-amber-50/60' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Species & Weight */}
                    <div className="col-span-3 space-y-0.5">
                      <span className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Dog className="w-3.5 h-3.5 text-amber-600" />
                        {rule.petSpecies === 'Dog' ? 'Chó' : rule.petSpecies === 'Cat' ? 'Mèo' : rule.petSpecies}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {rule.minWeight || 0}kg - {rule.maxWeight ? `${rule.maxWeight}kg` : 'Không giới hạn'}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="col-span-3 font-extrabold text-amber-600 text-sm">
                      {formatPrice(rule.price)}
                    </div>

                    {/* Duration */}
                    <div className="col-span-2 flex items-center gap-1 text-slate-500 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {rule.durationMinutes} phút
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      {rule.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3" /> Đang dùng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md text-[10px] font-bold border border-slate-200">
                          <XCircle className="w-3 h-3" /> Tạm dừng
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    {deletingRuleId === rule.id ? (
                      <div className="col-span-2 flex items-center justify-end gap-1">
                        <button
                          onClick={() => confirmDeleteRule(rule.id)}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-extrabold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          Xóa
                        </button>
                        <button
                          onClick={() => setDeletingRuleId(null)}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <div className="col-span-2 flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingRule(rule)}
                          className="p-1.5 hover:bg-amber-100/80 text-amber-700 rounded-lg transition-all cursor-pointer"
                          title="Chỉnh sửa quy tắc giá"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingRuleId(rule.id)}
                          className="p-1.5 hover:bg-rose-100/80 text-rose-600 rounded-lg transition-all cursor-pointer"
                          title="Xóa quy tắc giá"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-md"
          >
            Đóng Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
