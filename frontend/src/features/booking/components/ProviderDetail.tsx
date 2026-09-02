'use client';

import * as React from 'react';
import { ChevronLeft, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useBookingStore } from '../stores/booking.store';
import { useDiscoverProviders } from '../hooks/useDiscoverProviders';

export function ProviderDetail() {
  const { setStep, selectedProviderId, selectedServiceId, selectedPetId, selectedAddressId } = useBookingStore();

  const { providers } = useDiscoverProviders({
    serviceId: selectedServiceId || null,
    petId: selectedPetId || null,
    addressId: selectedAddressId || null,
  });

  const provider = providers.find((p) => p.id === selectedProviderId);

  if (!provider) {
    return (
      <div className="w-full bg-white rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-slate-500 font-medium mb-4">Không tìm thấy thông tin đối tác.</p>
        <button
          onClick={() => setStep(4)}
          className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // Derive some rank label based on rating
  const getRank = (rating: number) => {
    if (rating >= 4.9) return { label: 'HẠNG ELITE', color: 'bg-amber-400 text-amber-950' };
    if (rating >= 4.8) return { label: 'HẠNG PRO', color: 'bg-indigo-400 text-white' };
    return { label: 'TIÊU CHUẨN', color: 'bg-slate-200 text-slate-700' };
  };

  const rank = getRank(provider.ratingAvg);

  const skills = provider.recommendationReasons && provider.recommendationReasons.length > 0
    ? provider.recommendationReasons
    : [];

  return (
    <div className="w-full bg-white rounded-3xl p-6 md:p-8 space-y-8 select-none border border-slate-100 shadow-sm animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-amber-100 shadow-md">
            {provider.avatarUrl ? (
              <img src={provider.avatarUrl} alt={provider.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-300">
                {provider.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{provider.fullName}</h2>
              <span className={`px-2.5 py-1 text-[10px] font-black rounded-md tracking-wider ${rank.color}`}>
                {rank.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span>{provider.ratingAvg.toFixed(2)} ({provider.totalReviews} đánh giá)</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-600">{provider.totalCompletedBookings}+ ca thành công</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setStep(6)}
          className="w-full md:w-auto px-8 py-3.5 bg-[#f0c05a] hover:bg-[#e0b04a] text-slate-900 text-sm font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-200 active:scale-95 uppercase tracking-wide"
        >
          Chọn khung giờ làm việc
        </button>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bio & Badges */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3">Tiểu sử chuyên môn:</h3>
            <div className="bg-slate-50 rounded-2xl p-5 text-sm font-semibold text-slate-600 leading-relaxed border border-slate-100">
              {provider.bio || 'Chuyên viên chưa cập nhật tiểu sử chuyên môn.'}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3">Bảo chứng năng lực đã xác minh:</h3>
            <div className="flex flex-wrap gap-3">
              {provider.trustBadges?.length > 0 ? (
                provider.trustBadges.map((badge, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/60">
                    <ShieldCheck className="w-4 h-4" />
                    {badge.name}
                  </span>
                ))
              ) : (
                <span className="text-sm font-semibold text-slate-500 italic">
                  Chưa có bảo chứng năng lực.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Skills */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-center text-sm font-black text-slate-800 uppercase tracking-widest mb-6">
            Kỹ năng chuyên sâu
          </h3>
          <ul className="space-y-3">
            {skills.length > 0 ? (
              skills.map((skill, idx) => (
                <li key={idx} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-sm font-bold text-slate-700">{skill}</span>
                </li>
              ))
            ) : (
              <li className="text-center text-sm font-semibold text-slate-500 italic p-3">
                Chuyên viên chưa cập nhật kỹ năng.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-slate-100 mt-4">
        <button
          onClick={() => setStep(4)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </button>
      </div>
    </div>
  );
}
