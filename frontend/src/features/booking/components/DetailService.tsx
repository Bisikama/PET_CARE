'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Clock, Coins, CheckCircle2 } from 'lucide-react';
import { useBookingStore } from '../stores/booking.store';
import { useServiceDetail } from '@/features/services/hooks/useServiceDetail';
import { useChecklistTemplates } from '@/features/services/hooks/useChecklistTemplates';

export function DetailService() {
  const { setStep, selectedServiceId } = useBookingStore();
  const { service, isLoading, error, refetch } = useServiceDetail(selectedServiceId || null);
  const {
    checklistTemplates,
    isLoading: checklistLoading,
  } = useChecklistTemplates(selectedServiceId || null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-3xl p-6 md:p-8 flex items-center justify-center min-h-[300px] select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500">
            Đang tải chi tiết dịch vụ...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full bg-white rounded-3xl p-6 md:p-8 select-none">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <span className="text-4xl">⚠️</span>
          <h3 className="text-base font-bold text-slate-800">Không thể tải chi tiết dịch vụ</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto text-center font-medium">
            {error}
          </p>
          <button
            type="button"
            onClick={refetch}
            className="px-5 py-2.5 bg-[#0a1c2a] hover:bg-[#122e44] text-white text-xs font-bold rounded-2xl transition-all cursor-pointer"
          >
            Thử lại
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // No service found
  if (!service) {
    return (
      <div className="w-full bg-white rounded-3xl p-6 md:p-8 select-none">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <span className="text-4xl">🔍</span>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy dịch vụ</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto text-center font-medium">
            Vui lòng quay lại và chọn một dịch vụ.
          </p>
        </div>
        <div className="flex items-center pt-6 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl p-6 md:p-8 space-y-8 select-none">
      {/* Header */}
      <div className="space-y-3">
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest bg-[#0a1c2a] text-[#f0c05a] border border-[#1a3a52]">
          Chi tiết dịch vụ
        </span>
        <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
          {service.name}
        </h2>
      </div>

      {/* Service Detail Card */}
      <div className="rounded-[24px] border border-slate-100 bg-slate-50/30 p-6 md:p-8 space-y-6">
        {/* Main Description */}
        {service.description && (
          <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">
            {service.description}
          </p>
        )}

        {/* Duration & Price Row */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-12">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
              Thời lượng giao ca
            </span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-lg font-bold text-[#0f172a]">
                {service.durationMinutes} phút
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
              Bảng phí tạm tính (Escrow)
            </span>
            <div className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-slate-400" />
              <span className="text-lg font-bold text-[#0f172a]">
                {formatPrice(service.basePrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Checklist Templates */}
        {checklistLoading ? (
          <div className="flex items-center gap-2 py-4">
            <div className="w-5 h-5 border-2 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Đang tải quy trình...</span>
          </div>
        ) : checklistTemplates.length > 0 ? (
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
              Quy trình {checklistTemplates.length} bước an toàn chuẩn PetCare:
            </span>
            <ol className="space-y-2.5">
              {checklistTemplates.map((item, index) => (
                <li
                  key={item.id}
                  className="text-sm font-semibold text-slate-700 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-[10px] font-extrabold text-slate-500 shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <span className="font-bold text-slate-800">{item.title}</span>
                    {item.description && (
                      <p className="text-xs font-medium text-slate-400 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    {item.isRequired && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-extrabold text-teal-600 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        Bắt buộc
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </button>

        <button
          type="button"
          onClick={() => setStep(4)}
          className="inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-[#0a1c2a] hover:bg-[#122e44] text-white text-xs font-bold rounded-2xl shadow transition-all duration-150 cursor-pointer active:scale-[0.98]"
        >
          Tìm người chăm sóc phù hợp
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
