'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Star, Award, MapPin, Loader2, Sparkles, Building2, CheckCircle2, ShieldCheck, Plus } from 'lucide-react';
import { useBookingStore } from '../stores/booking.store';
import { usePetStore } from '@/features/pet/stores/pet.store';
import { useDiscoverProviders, DiscoveredProvider } from '../hooks/useDiscoverProviders';
import { useCustomerAddresses } from '@/features/me/hooks/useCustomerAddresses';
import { useMeStore } from '@/features/me/stores/me.store';

export function ProviderSelection() {
  const { 
    setStep, 
    selectedServiceId, 
    selectedPetId, 
    selectedAddressId, 
    setSelectedAddressId,
    selectedProviderId,
    setSelectedProviderId
  } = useBookingStore();

  const { pets } = usePetStore();
  const { openAddressModal } = useMeStore();
  const { addresses, isLoading: addressesLoading } = useCustomerAddresses({ autoFetch: true });

  // Fetch providers near customer address for this service
  const { providers, isLoading: providersLoading, error: providersError } = useDiscoverProviders({
    serviceId: selectedServiceId || null,
    petId: selectedPetId || null,
    addressId: selectedAddressId || null,
  });

  // Auto-select default address if none selected yet
  React.useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId, setSelectedAddressId]);

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const handleSelectProvider = (providerId: string) => {
    setSelectedProviderId(providerId);
  };

  const handleContinue = () => {
    if (selectedProviderId) {
      setStep(5); // Go to ConditionSelection
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const locationText = selectedAddress
    ? `${selectedAddress.district}, ${selectedAddress.city}`
    : 'Chưa chọn địa chỉ';

  return (
    <div className="w-full bg-white rounded-3xl p-6 md:p-8 space-y-8 select-none">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Chuyên Viên Đủ Tiêu Chuẩn
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            Khu vực {locationText} • Đã kiểm duyệt CCCD &amp; lý lịch chi tiết.
          </p>
        </div>

        {/* Address Selection Dropdown */}
        <div className="flex items-center gap-2">
          {addressesLoading ? (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          ) : addresses.length === 0 ? (
            <button
              onClick={openAddressModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-full border border-teal-200/50 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm địa chỉ để tìm đối tác
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <label htmlFor="addressSelect" className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Địa chỉ của bạn:
              </label>
              <select
                id="addressSelect"
                value={selectedAddressId || ''}
                onChange={(e) => setSelectedAddressId(e.target.value || null)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all"
              >
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label || 'Địa chỉ'} ({a.addressLine})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Matching Badge Indicator */}
      {selectedAddressId && !providersLoading && !providersError && providers.length > 0 && (
        <div className="flex justify-end">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            ✓ Khớp tìm kiếm: {providers.length} Chuyên viên
          </span>
        </div>
      )}

      {/* Loading & Error States */}
      {!selectedAddressId ? (
        <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[24px] py-12 text-center">
          <span className="text-4xl block mb-3">📍</span>
          <h3 className="text-base font-bold text-slate-800">Chưa chọn địa chỉ phục vụ</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto font-medium">
            Vui lòng thêm hoặc chọn địa chỉ nhận dịch vụ ở góc trên để tìm kiếm các chuyên viên chăm sóc gần bạn nhất.
          </p>
        </div>
      ) : providersLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[250px] gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500">Đang tìm chuyên viên phù hợp ở gần bạn...</span>
        </div>
      ) : providersError ? (
        <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[24px] py-12 text-center">
          <span className="text-4xl block mb-3">⚠️</span>
          <h3 className="text-base font-bold text-slate-800">Lỗi tìm kiếm đối tác</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto font-medium">
            {providersError}
          </p>
        </div>
      ) : providers.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[24px] py-12 text-center">
          <span className="text-4xl block mb-3">🔍</span>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy chuyên viên</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto font-medium leading-relaxed">
            Rất tiếc, hiện tại không có chuyên viên nào phục vụ loài vật của bạn ({selectedPet?.species}) ở khu vực {selectedAddress?.district}. Vui lòng kiểm tra lại địa chỉ hoặc thử dịch vụ khác.
          </p>
        </div>
      ) : (
        /* Provider Cards List */
        <div className="space-y-4">
          {providers.map((p, index) => {
            const isSelected = selectedProviderId === p.id;
            const isRecommended = index === 0; // First provider has highest score

            return (
              <div
                key={p.id}
                onClick={() => handleSelectProvider(p.id)}
                className={`relative overflow-hidden rounded-[24px] bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cursor-pointer transition-all duration-300 border-2 ${
                  isSelected 
                    ? 'border-[#f0c05a] shadow-md bg-amber-50/5' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Left Side: Avatar + Details */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className="relative shrink-0 w-16 h-16 rounded-full overflow-hidden border border-slate-100 shadow-inner bg-slate-50 flex items-center justify-center">
                    {p.avatarUrl ? (
                      <img
                        src={p.avatarUrl}
                        alt={p.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                  </div>

                  {/* Info details */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-850 tracking-tight leading-none">
                        {p.fullName}
                      </h3>
                      {p.experienceYears > 0 && (
                        <span className="inline-flex text-[9px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/50 uppercase">
                          {p.experienceYears} năm KN
                        </span>
                      )}
                      {p.kycStatus === 'APPROVED' && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/30 uppercase">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Đã xác minh
                        </span>
                      )}
                    </div>

                    {/* Bio/Description */}
                    {p.bio && (
                      <p className="text-slate-400 text-xs md:text-sm font-semibold line-clamp-2 pr-6">
                        {p.bio}
                      </p>
                    )}

                    {/* Stats: rating, reviews, completion */}
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 flex-wrap">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{p.ratingAvg.toFixed(2)}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span>{p.totalReviews} đánh giá</span>
                      {p.totalCompletedBookings > 0 && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-teal-600">{p.totalCompletedBookings} đơn hoàn thành</span>
                        </>
                      )}
                    </div>

                    {/* Recommendation reasons badges */}
                    {p.recommendationReasons && p.recommendationReasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {p.recommendationReasons.map((reason, idx) => (
                          <span key={idx} className="inline-flex text-[9px] font-bold text-slate-450 bg-slate-100 rounded px-1.5 py-0.5">
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Price & Action */}
                <div className="flex sm:flex-col items-end gap-3 sm:gap-1 text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 shrink-0">
                  <div className="flex-1 sm:flex-initial text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                      Phí dịch vụ đối tác
                    </span>
                    <span className="text-base font-extrabold text-[#0f172a]">
                      {formatPrice(p.price)}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#f0c05a] sm:mt-1 bg-[#031625] px-3.5 py-1.5 rounded-xl shadow">
                      Đã chọn đối tác
                      <CheckCircle2 className="w-4 h-4 text-[#f0c05a] fill-current" />
                    </span>
                  )}
                </div>

                {/* Tag / Badge positioning */}
                {isRecommended && (
                  <span className="absolute top-4 right-4 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 bg-amber-500 text-white rounded-md shadow-sm">
                    Đối tác gợi ý
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setStep(3)}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </button>

        <button
          type="button"
          disabled={!selectedProviderId}
          onClick={handleContinue}
          className="inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-[#0a1c2a] hover:bg-[#122e44] text-white text-xs font-bold rounded-2xl shadow transition-all duration-150 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Tiếp tục
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
