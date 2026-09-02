'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, Edit3, AlertCircle, Loader2, DollarSign, Clock, Tag, FileText, Shield } from 'lucide-react';
import { servicesService } from '../services/services.service';
import { useUpdateService } from '../hooks/useUpdateService';
import { Service, UpdateServiceData } from '../types';

interface EditServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'GROOMING', label: '✂️ Tắm & Cắt tỉa (Grooming)' },
  { value: 'PET_SITTING', label: '🏠 Chăm sóc tại nhà (Pet Sitting)' },
  { value: 'BOARDING', label: '🏨 Lưu trú thú cưng (Boarding)' },
  { value: 'DOG_WALKING', label: '🦮 Dắt chó đi dạo (Dog Walking)' },
  { value: 'VET', label: '🏥 Khám thú y & Y tế (Vet Care)' },
  { value: 'TRAINING', label: '🎾 Huấn luyện thú cưng (Training)' },
  { value: 'OTHER', label: '✨ Dịch vụ khác' },
];

export const EditServiceModal: React.FC<EditServiceModalProps> = ({
  service,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mounted, setMounted] = React.useState(false);
  const { updateService, submitting } = useUpdateService();


  const [formData, setFormData] = React.useState<UpdateServiceData>({
    name: '',
    category: 'GROOMING',
    description: '',
    basePrice: 0,
    durationMinutes: 60,
    isActive: true,
    cancellationPolicyId: '',
  });

  const [cancellationPolicies, setCancellationPolicies] = React.useState<any[]>([]);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Update form values when selected service changes
  React.useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        category: service.category || 'GROOMING',
        description: service.description || '',
        basePrice: service.basePrice || 0,
        durationMinutes: service.durationMinutes || 60,
        isActive: service.isActive ?? true,
        cancellationPolicyId: service.cancellationPolicyId || '',
      });
    }
  }, [service]);

  React.useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      servicesService
        .getCancellationPolicies()
        .then((policies) => setCancellationPolicies(policies || []))
        .catch(() => setCancellationPolicies([]));
    }
  }, [isOpen]);

  if (!mounted || !isOpen || !service) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name?.trim()) {
      setErrorMsg('Vui lòng nhập tên gói dịch vụ.');
      return;
    }

    if (formData.basePrice !== undefined && formData.basePrice < 0) {
      setErrorMsg('Giá dịch vụ không được nhỏ hơn 0.');
      return;
    }

    if (formData.durationMinutes !== undefined && formData.durationMinutes < 1) {
      setErrorMsg('Thời lượng dịch vụ tối thiểu là 1 phút.');
      return;
    }

    try {
      const payload: UpdateServiceData = {
        name: formData.name.trim(),
        category: formData.category || undefined,
        description: formData.description?.trim() || undefined,
        basePrice: Number(formData.basePrice),
        durationMinutes: Number(formData.durationMinutes),
        isActive: Boolean(formData.isActive),
        cancellationPolicyId: formData.cancellationPolicyId || undefined,
      };

      await updateService(service.id, payload);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể cập nhật gói dịch vụ này.');
    }
  };


  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[88vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#031625] pt-7 pb-6 px-7 text-white flex items-center justify-between border-b border-slate-800 shrink-0 select-none relative overflow-hidden">
          <div className="absolute right-0 top-0 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10 min-w-0 pr-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
              <Edit3 className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="text-xl font-black tracking-tight text-white truncate">
                Chỉnh Sửa Gói Dịch Vụ
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-normal">
                Cập nhật thông tin dịch vụ <span className="text-teal-400 font-semibold">{service.name}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer shrink-0 active:scale-95"
            aria-label="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 md:p-7 space-y-5">
            {errorMsg && (
              <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Tên dịch vụ */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-teal-600" />
                Tên gói dịch vụ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Tên gói dịch vụ..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white transition-all"
                required
              />
            </div>

            {/* Danh mục */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                Danh mục dịch vụ
              </label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white transition-all cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Giá cơ bản & Thời lượng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Giá cơ bản */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Giá cơ bản (VND) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice ?? ''}
                    onChange={handleChange}
                    min={0}
                    step={10000}
                    placeholder="200000"
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white transition-all"
                    required
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-extrabold text-slate-400 select-none">
                    đ
                  </span>
                </div>
              </div>

              {/* Thời lượng */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Thời lượng (Phút) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="durationMinutes"
                    value={formData.durationMinutes ?? ''}
                    onChange={handleChange}
                    min={1}
                    step={15}
                    placeholder="60"
                    className="w-full pl-4 pr-14 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white transition-all"
                    required
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-extrabold text-slate-400 select-none">
                    phút
                  </span>
                </div>
              </div>
            </div>

            {/* Mô tả dịch vụ */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Mô tả chi tiết gói dịch vụ
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Nhập mô tả chi tiết..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Chính sách hủy */}
            {cancellationPolicies.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  Chính sách hủy dịch vụ
                </label>
                <select
                  name="cancellationPolicyId"
                  value={formData.cancellationPolicyId || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="">-- Mặc định hệ thống --</option>
                  {cancellationPolicies.map((pol) => (
                    <option key={pol.id} value={pol.id}>
                      {pol.name || pol.title || `Chính sách ${pol.id.slice(0, 8)}...`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Trạng thái Kích hoạt */}
            <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <div className="space-y-0.5">
                <span className="text-xs font-extrabold text-slate-800 block">Kích hoạt gói dịch vụ</span>
                <span className="text-[11px] text-slate-400 font-medium block">
                  Cho phép hiển thị để đối tác đăng ký và khách hàng đặt lịch ngay lập tức.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive ?? true}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
          </div>

          {/* Sticky Modal Footer */}
          <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/20 transition-all duration-150 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  Lưu Thay Đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
