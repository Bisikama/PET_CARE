'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { useBookingStore } from '../stores/booking.store';
import { usePetStore } from '@/features/pet/stores/pet.store';
import { useServices } from '@/features/services/hooks/useServices';
import { Service } from '@/features/services/types';

export function ServiceSelection() {
  const { setStep, selectedServiceId, setSelectedServiceId } = useBookingStore();
  const { pets } = usePetStore();
  const { selectedPetId } = useBookingStore();
  const { services, isLoading, error, refreshServices } = useServices();

  // Auto-select the first service if none is selected
  React.useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [services, selectedServiceId, setSelectedServiceId]);

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const petName = selectedPet?.name || 'bé cưng';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  // Determine if a service is considered the "primary/recommended" one
  const getPrimaryIndex = (servicesList: Service[]) => {
    // First grooming/bathing service is considered primary
    const idx = servicesList.findIndex(
      (s) =>
        s.name.toLowerCase().includes('tắm') ||
        s.name.toLowerCase().includes('cắt tỉa') ||
        s.name.toLowerCase().includes('grooming') ||
        s.name.toLowerCase().includes('vệ sinh')
    );
    return idx >= 0 ? idx : 0;
  };

  const primaryIndex = services.length > 0 ? getPrimaryIndex(services) : -1;

  // Loading state
  if (isLoading && services.length === 0) {
    return (
      <div className="w-full bg-white rounded-3xl p-6 md:p-8 flex items-center justify-center min-h-[300px] select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500">
            Đang tải danh sách dịch vụ...
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
          <h3 className="text-base font-bold text-slate-800">Không thể tải dịch vụ</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto text-center font-medium">
            {error}
          </p>
          <button
            type="button"
            onClick={refreshServices}
            className="px-5 py-2.5 bg-[#0a1c2a] hover:bg-[#122e44] text-white text-xs font-bold rounded-2xl transition-all cursor-pointer"
          >
            Thử lại
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={() => setStep(1)}
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
      {/* Header Section */}
      <div className="space-y-2 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
          Danh Mục Dịch Vụ Chăm Sóc Thú Cưng
        </h2>
        <p className="text-slate-400 text-sm font-medium">
          Lựa chọn dịch vụ thích hợp cho {petName}. Chúng tôi khuyên dùng dịch vụ tắm rửa &amp; cắt tỉa tạo hình.
        </p>
      </div>

      {/* Service Cards */}
      {services.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[24px] py-12 text-center">
          <span className="text-4xl block mb-3">🐾</span>
          <h3 className="text-base font-bold text-slate-800">Chưa có dịch vụ nào</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto font-medium">
            Hệ thống hiện chưa có gói dịch vụ nào được kích hoạt. Vui lòng quay lại sau.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {services
            .filter((s) => s.isActive)
            .map((service, index) => {
              const isSelected = selectedServiceId === service.id;
              const isPrimary = index === primaryIndex;

              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`relative p-5 md:p-6 rounded-[24px] bg-white cursor-pointer transition-all duration-300 border-2 flex flex-col justify-between min-h-[180px] group ${
                    isSelected
                      ? 'border-[#f0c05a] shadow-md'
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  {/* Selected check indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2 className="w-5 h-5 text-[#f0c05a] fill-current" />
                    </div>
                  )}

                  {/* Top: Title + Badge */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 pr-8">
                      {/* Service Icon */}
                      <span className="text-2xl shrink-0 mt-0.5">
                        {service.category?.toUpperCase() === 'GROOMER'
                          ? '✂️'
                          : service.category?.toUpperCase() === 'SITTER'
                          ? '🏠'
                          : service.category?.toUpperCase() === 'VET'
                          ? '🩺'
                          : '✨'}
                      </span>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base md:text-lg font-bold text-[#0f172a] tracking-tight leading-tight">
                            {service.name}
                          </h3>
                          {isPrimary && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-[#0a1c2a] text-[#f0c05a] border border-[#1a3a52] whitespace-nowrap">
                              Kịch bản chính
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed line-clamp-3 pl-[44px]">
                      {service.description || 'Chưa có thông tin mô tả chi tiết cho dịch vụ này.'}
                    </p>
                  </div>

                  {/* Bottom: Duration + Price */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50 pl-[44px]">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Thời lượng: <em className="not-italic text-slate-600">{service.durationMinutes} phút</em>
                      </span>
                    </div>

                    <span className="text-base md:text-lg font-extrabold text-[#0f172a] tracking-tight">
                      {formatPrice(service.basePrice)}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </button>

        <button
          type="button"
          disabled={!selectedServiceId}
          onClick={() => setStep(3)}
          className="inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-[#0a1c2a] hover:bg-[#122e44] text-white text-xs font-bold rounded-2xl shadow transition-all duration-150 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Tiếp tục →
        </button>
      </div>
    </div>
  );
}
