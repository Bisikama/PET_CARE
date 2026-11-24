'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Scissors, Home, Stethoscope, Package, AlertTriangle, Heart } from 'lucide-react';
import { useBookingStore } from '../stores/booking.store';
import { usePetStore } from '@/features/pet/stores/pet.store';
import { useServices } from '@/features/services/hooks/useServices';
import { usePetPackagePrices } from '@/features/services/hooks/usePetPackagePrices';

export function ServiceSelection() {
  const { setStep, selectedServiceId, setSelectedServiceId } = useBookingStore();
  const { pets } = usePetStore();
  const { selectedPetId } = useBookingStore();
  const { services, isLoading, error, refreshServices } = useServices();

  // Chỉ các gói đang mở bán
  const activeServices = React.useMemo(
    () => services.filter((s) => s.isActive && !s.deletedAt).sort((a, b) => a.basePrice - b.basePrice),
    [services],
  );

  // Tự chọn gói đầu tiên nếu chưa chọn, hoặc gói đã chọn không còn mở bán
  React.useEffect(() => {
    if (activeServices.length === 0) return;
    if (!selectedServiceId || !activeServices.some((s) => s.id === selectedServiceId)) {
      setSelectedServiceId(activeServices[0].id);
    }
  }, [activeServices, selectedServiceId, setSelectedServiceId]);

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const petName = selectedPet?.name || 'bé cưng';
  const prices = usePetPackagePrices(activeServices, selectedPet);
  const selectedPrice = selectedServiceId ? prices[selectedServiceId] : undefined;
  const petLabel = selectedPet
    ? `${petName} (${selectedPet.species === 'Cat' ? 'mèo' : 'chó'}${selectedPet.weight ? `, ${selectedPet.weight} kg` : ''})`
    : petName;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

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
          <AlertTriangle className="w-10 h-10 text-amber-500" />
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
          Chọn gói phù hợp cho {petLabel}. Giá hiển thị đã tính theo cân nặng của bé (chưa gồm phí di chuyển).
        </p>
      </div>

      {/* Service Cards */}
      {activeServices.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[24px] py-12 text-center flex flex-col items-center justify-center">
          <Heart className="w-10 h-10 text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800">Chưa có dịch vụ nào</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto font-medium">
            Hệ thống hiện chưa có gói dịch vụ nào được kích hoạt. Vui lòng quay lại sau.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {activeServices.map((service) => {
              const isSelected = selectedServiceId === service.id;
              const petPrice = prices[service.id];

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
                      <div className="shrink-0 mt-0.5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50/50 flex items-center justify-center border border-indigo-100/50 p-2 relative overflow-hidden">
                          <img 
                            src={service.image_url || '/icons/dog-walking.svg'} 
                            alt={service.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/icons/dog-walking.svg';
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base md:text-lg font-bold text-[#0f172a] tracking-tight leading-tight">
                            {service.name}
                          </h3>
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
                        Thời lượng: <em className="not-italic text-slate-600">{petPrice?.durationMinutes ?? service.durationMinutes} phút</em>
                      </span>
                    </div>

                    <span className="text-base md:text-lg font-extrabold text-[#0f172a] tracking-tight">
                      {!petPrice ? (
                        <span className="text-sm font-semibold text-slate-400">Đang tính giá…</span>
                      ) : petPrice.requiresQuote ? (
                        <span className="text-sm font-bold text-amber-700">Báo giá riêng</span>
                      ) : (
                        formatPrice(petPrice.price)
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {selectedPrice?.requiresQuote && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
          <p>
            Gói này chưa có giá niêm yết cho {petLabel}. Vui lòng liên hệ PetCare (mục Hỗ trợ) để được báo giá riêng,
            hoặc chọn gói khác.
          </p>
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
          disabled={!selectedServiceId || !selectedPrice || selectedPrice.requiresQuote}
          onClick={() => setStep(3)}
          className="inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-[#0a1c2a] hover:bg-[#122e44] text-white text-xs font-bold rounded-2xl shadow transition-all duration-150 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Tiếp tục →
        </button>
      </div>
    </div>
  );
}
