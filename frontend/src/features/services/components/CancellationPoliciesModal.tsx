'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Shield,
  Plus,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Percent,
  Sparkles
} from 'lucide-react';
import { useCancellationPolicies } from '../hooks/useCancellationPolicies';
import { useCreateCancellationPolicy } from '../hooks/useCreateCancellationPolicy';
import { CreateCancellationPolicyData } from '../types';

interface CancellationPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CancellationPoliciesModal: React.FC<CancellationPoliciesModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mounted, setMounted] = React.useState(false);
  const { cancellationPolicies, isLoading, error: fetchError, refetch } = useCancellationPolicies(isOpen);
  const { createCancellationPolicy, submitting, error: createError } = useCreateCancellationPolicy();

  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    hoursBefore: '24',
    refundPercentage: '100',
    isActive: true,
  });

  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setFormError(null);
      setFormData({
        name: '',
        description: '',
        hoursBefore: '24',
        refundPercentage: '100',
        isActive: true,
      });
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Vui lòng nhập tên chính sách hủy.');
      return;
    }

    const hoursNum = Number(formData.hoursBefore);
    const refundNum = Number(formData.refundPercentage);

    if (isNaN(hoursNum) || hoursNum < 0) {
      setFormError('Số giờ báo trước hợp lệ tối thiểu là 0.');
      return;
    }

    if (isNaN(refundNum) || refundNum < 0 || refundNum > 100) {
      setFormError('Tỷ lệ hoàn tiền phải từ 0% đến 100%.');
      return;
    }

    try {
      const payload: CreateCancellationPolicyData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        rulesJson: {
          hoursBefore: hoursNum,
          refundPercentage: refundNum,
        },
        isActive: formData.isActive,
      };

      await createCancellationPolicy(payload);

      setFormData({
        name: '',
        description: '',
        hoursBefore: '24',
        refundPercentage: '100',
        isActive: true,
      });

      refetch();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setFormError(err.message || 'Không thể tạo chính sách hủy mới.');
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
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-[#041936] pt-7 pb-6 px-7 text-white flex items-center justify-between border-b border-blue-900/60 shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10 min-w-0 pr-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="text-xl font-black tracking-tight text-white truncate">
                Chính Sách Hủy Dịch Vụ (Cancellation Policies)
              </h3>
              <p className="text-xs text-blue-200/80 font-medium leading-normal truncate">
                Cấu hình quy định hủy đơn & tỷ lệ hoàn tiền khi khách hàng hoặc đối tác hủy lịch
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 w-9 h-9 flex items-center justify-center text-blue-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer shrink-0 active:scale-95"
            aria-label="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-7 space-y-6">
          {(fetchError || createError || formError) && (
            <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{formError || createError || fetchError}</span>
            </div>
          )}

          {/* Form to Create New Cancellation Policy */}
          <form onSubmit={handleSubmitForm} className="bg-blue-50/40 p-5 rounded-2xl border border-blue-200/60 space-y-4">
            <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              Thêm chính sách hủy dịch vụ mới
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Policy Name */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Tên chính sách <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="VD: Chính sách linh hoạt 24h hoàn 100%"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Refund Percentage */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Percent className="w-3 h-3 text-emerald-600" /> Tỷ lệ hoàn tiền (%)
                </label>
                <input
                  type="number"
                  name="refundPercentage"
                  min="0"
                  max="100"
                  value={formData.refundPercentage}
                  onChange={handleInputChange}
                  placeholder="100"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              {/* Hours Before */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" /> Hủy trước (Giờ)
                </label>
                <input
                  type="number"
                  name="hoursBefore"
                  min="0"
                  value={formData.hoursBefore}
                  onChange={handleInputChange}
                  placeholder="24"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-500" /> Mô tả vắn tắt
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Hoàn tiền 100% nếu khách hủy trước 24h khởi hành"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Toggle Active & Submit Button */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-700">Kích hoạt chính sách ngay sau khi tạo</span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 fill-current" /> Thêm Chính Sách
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Cancellation Policies List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Danh sách chính sách hủy hiện có ({cancellationPolicies.length})
              </h4>
            </div>

            {isLoading && cancellationPolicies.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-400">Đang tải danh sách chính sách hủy...</p>
              </div>
            ) : cancellationPolicies.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <Shield className="w-8 h-8 text-blue-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Chưa có chính sách hủy nào</p>
                <p className="text-[11px] text-slate-400">Tạo chính sách hủy ở biểu mẫu trên để liên kết cho các gói dịch vụ.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {cancellationPolicies.map((policy) => {
                  const rules = typeof policy.rulesJson === 'object' ? policy.rulesJson : {};
                  return (
                    <div
                      key={policy.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-800 text-sm">{policy.name}</span>
                          {policy.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold border border-emerald-100">
                              <CheckCircle2 className="w-3 h-3" /> Áp dụng
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold border border-slate-200">
                              <XCircle className="w-3 h-3" /> Tạm dừng
                            </span>
                          )}
                        </div>

                        {policy.description && (
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{policy.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center bg-blue-50/60 px-3 py-2 rounded-xl border border-blue-100/80">
                        <span className="text-[11px] font-extrabold text-blue-900">
                          Hủy trước {rules.hoursBefore ?? 24}h ➔ Hoàn {rules.refundPercentage ?? 100}%
                        </span>
                      </div>
                    </div>
                  );
                })}
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
