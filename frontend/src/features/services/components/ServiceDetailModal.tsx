'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  DollarSign, 
  Clock, 
  Tag, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ListChecks, 
  Coins,
  ShieldCheck,
  Dog
} from 'lucide-react';
import { useServiceDetail } from '../hooks/useServiceDetail';

interface ServiceDetailModalProps {
  serviceId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  serviceId,
  isOpen,
  onClose,
}) => {
  const [mounted, setMounted] = React.useState(false);
  const { service, checklistTemplates, pricingRules, isLoading, error, refetch } = useServiceDetail(
    isOpen ? serviceId : null
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen || !serviceId) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Dark Gradient */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#031625] pt-7 pb-6 px-7 text-white flex items-center justify-between border-b border-slate-800 shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10 min-w-0 pr-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-6 h-6 fill-teal-400/20" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black tracking-tight text-white truncate">
                  {service?.name || 'Chi Tiết Dịch Vụ'}
                </h3>
                {service && (
                  service.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-extrabold">
                      <CheckCircle2 className="w-3 h-3" /> Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-[10px] font-extrabold">
                      <XCircle className="w-3 h-3" /> Tạm dừng
                    </span>
                  )
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium leading-normal">
                Thông tin cấu hình gói dịch vụ hệ thống PET CARE
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
        <div className="flex-1 overflow-y-auto p-6 md:p-7 space-y-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              <p className="text-xs font-bold text-slate-400">Đang tải thông tin chi tiết dịch vụ...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          ) : service ? (
            <>
              {/* Overview Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Giá gốc cơ bản
                  </span>
                  <p className="text-lg font-black text-teal-600">{formatPrice(service.basePrice)}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Thời lượng thực hiện
                  </span>
                  <p className="text-lg font-black text-slate-800">{service.durationMinutes} phút</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" /> Danh mục
                  </span>
                  <p className="text-sm font-bold text-indigo-600 uppercase mt-1">{service.category || 'Chung'}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Mô tả chi tiết gói dịch vụ
                </h4>
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs font-medium text-slate-600 leading-relaxed">
                  {service.description || 'Chưa có thông tin mô tả chi tiết cho dịch vụ này.'}
                </div>
              </div>

              {/* Pricing Rules Section (if rules exist) */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  Bảng giá theo loài & Cân nặng ({pricingRules.length})
                </h4>

                {pricingRules.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-400 text-center font-medium">
                    Chưa có cấu hình bảng giá riêng theo cân nặng. Dịch vụ áp dụng giá cơ bản chuẩn.
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                    <div className="bg-slate-50 px-4 py-2.5 grid grid-cols-4 font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">
                      <span>Loài thú cưng</span>
                      <span>Khung cân nặng</span>
                      <span>Thời lượng</span>
                      <span className="text-right">Mức giá</span>
                    </div>
                    {pricingRules.map((rule) => (
                      <div key={rule.id} className="px-4 py-3 grid grid-cols-4 items-center font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Dog className="w-3.5 h-3.5 text-teal-600" />
                          {rule.petSpecies === 'Dog' ? 'Chó' : rule.petSpecies === 'Cat' ? 'Mèo' : rule.petSpecies}
                        </span>
                        <span className="text-slate-500">
                          {rule.minWeight || 0}kg - {rule.maxWeight ? `${rule.maxWeight}kg` : 'Không giới hạn'}
                        </span>
                        <span className="text-slate-500">{rule.durationMinutes} phút</span>
                        <span className="text-right font-bold text-teal-600">{formatPrice(rule.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checklist Templates Section (if templates exist) */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-indigo-600" />
                  Danh sách kiểm tra thực địa (Checklist Templates - {checklistTemplates.length})
                </h4>

                {checklistTemplates.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-400 text-center font-medium">
                    Chưa có quy trình checklist chuẩn cho gói dịch vụ này.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {checklistTemplates.map((template, idx) => (
                      <div key={template.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3 text-xs">
                        <div className="w-6 h-6 rounded-xl bg-indigo-50 text-indigo-600 font-extrabold flex items-center justify-center shrink-0 text-[11px]">
                          {idx + 1}
                        </div>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{template.title}</span>
                            {template.isRequired && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                                Bắt buộc
                              </span>
                            )}
                          </div>
                          {template.description && (
                            <p className="text-[11px] text-slate-400 font-medium">{template.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-[#031625] hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-md"
          >
            Đóng Chi Tiết
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
