'use client';

import * as React from 'react';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, Scale 
} from 'lucide-react';
import { useBookingStore } from '../stores/booking.store';
import { useServicesStore } from '@/features/services/stores/services.store';
import { usePetStore } from '@/features/pet/stores/pet.store';
import { bookingService } from '../services/booking.service';

interface PricingRule {
  id: string;
  service_id: string;
  pet_species: string;
  min_weight: number | null;
  max_weight: number | null;
  price: string | number;
  duration_minutes: number;
}

export function ConditionSelection() {
  const { setStep, selectedPetId, selectedServiceId, setSelectedServiceId } = useBookingStore();
  const { services, fetchServices } = useServicesStore();
  const { pets } = usePetStore();

  const [activeService, setActiveService] = React.useState<any>(null);
  const [pricingRules, setPricingRules] = React.useState<PricingRule[]>([]);
  const [selectedWeightClassId, setSelectedWeightClassId] = React.useState<string | null>(null);
  const [apiLoading, setApiLoading] = React.useState<boolean>(false);

  // 1. Get service ID from query parameter if present on URL
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const serviceIdParam = params.get('serviceId');
      if (serviceIdParam) {
        setSelectedServiceId(serviceIdParam);
      }
    }
  }, [setSelectedServiceId]);

  // 2. Fetch all services on mount
  React.useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // 3. Resolve active service based on selectedServiceId or auto-discovery
  React.useEffect(() => {
    if (services.length > 0) {
      if (selectedServiceId) {
        const found = services.find(s => s.id === selectedServiceId);
        if (found) {
          setActiveService(found);
          return;
        }
      }
      
      // Auto-discovery fallback: find grooming/bathing service
      const matched = services.find(s => 
        s.name.toLowerCase().includes('tắm') || 
        s.name.toLowerCase().includes('cắt tỉa') ||
        s.name.toLowerCase().includes('grooming')
      );
      setActiveService(matched || services[0]);
    }
  }, [services, selectedServiceId]);

  // 4. Fetch pricing rules from the database API: GET /api/services/:id/pricing-rules
  React.useEffect(() => {
    if (activeService) {
      setApiLoading(true);
      bookingService.getPricingRules(activeService.id)
        .then((rules) => {
          if (rules) {
            setPricingRules(rules);
          }
        })
        .catch((err) => {
          console.error('Error fetching pricing rules from API:', err);
        })
        .finally(() => {
          setApiLoading(false);
        });
    }
  }, [activeService]);

  // Get selected pet's species to filter pricing rules (Dog or Cat)
  const selectedPet = pets.find(p => p.id === selectedPetId);
  const petSpecies = selectedPet?.species || 'Dog';

  // Filter pricing rules matching the selected pet's species
  const activeRules = React.useMemo(() => {
    return pricingRules.filter(r => 
      r.pet_species.toLowerCase() === petSpecies.toLowerCase()
    );
  }, [pricingRules, petSpecies]);

  // 5. Manage selected weight class ID based on available rules
  React.useEffect(() => {
    if (activeRules.length > 0) {
      const exists = activeRules.some(r => r.id === selectedWeightClassId);
      if (!exists) {
        setSelectedWeightClassId(activeRules[0].id);
      }
    } else {
      setSelectedWeightClassId(null);
    }
  }, [activeRules, selectedWeightClassId]);

  const basePrice = activeService ? Number(activeService.basePrice) : 0;
  const serviceName = activeService ? activeService.name : 'Dịch vụ cơ bản';

  // Find currently selected weight class rule
  const currentRule = activeRules.find(r => r.id === selectedWeightClassId);
  const weightSurcharge = currentRule ? Number(currentRule.price) : 0;
  const totalPrice = basePrice + weightSurcharge;

  const formatWeightClassLabel = (rule: PricingRule) => {
    const min = rule.min_weight !== null ? Number(rule.min_weight) : null;
    const max = rule.max_weight !== null ? Number(rule.max_weight) : null;

    if ((min === null || min === 0) && max !== null) {
      return {
        title: `Thú cưng nhỏ`,
        subtitle: `(Dưới ${max}kg)`
      };
    }
    if (min !== null && max === null) {
      return {
        title: `Thú cưng khổng lồ`,
        subtitle: `(Trên ${min}kg)`
      };
    }
    if (min !== null && max !== null) {
      return {
        title: `Thú cưng vừa/lớn`,
        subtitle: `(${min}kg - ${max}kg)`
      };
    }
    return {
      title: 'Mọi thể trạng',
      subtitle: ''
    };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price)
      .replace(/\s?₫/, ' đ');
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 md:p-8 space-y-8 select-none">
      {/* Header Section */}
      <div className="space-y-2 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
          Chọn Thể Trạng & Nhu Cầu Chăm Sóc Đặc Biệt
        </h2>
        <p className="text-slate-400 text-sm font-medium">
          Thiết lập cân nặng để tính toán phí bảo chứng Safe-Pay chính xác nhất.
        </p>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4.5 h-4.5 text-slate-400" />
            1. Phân khúc cân nặng (Weight Class)
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed font-medium">
            Chọn khoảng cân nặng hiện tại của bé. Phân khúc lớn hơn cần nhiều thời gian tắm sấy và lượng sữa tắm chuyên dụng gấp đôi.
          </p>
        </div>

        {apiLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-slate-400">Đang tải biểu phí cân nặng từ database...</span>
          </div>
        ) : activeRules.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[24px] py-12 text-center">
            <span className="text-4xl block mb-3">⚖️</span>
            <h3 className="text-base font-bold text-slate-800">Chưa có biểu phí cân nặng</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto font-medium">
              Không tìm thấy quy định phụ thu cân nặng nào cho loài{' '}
              <strong className="text-slate-600 font-bold">{petSpecies === 'Dog' ? 'Chó' : 'Mèo'}</strong> của dịch vụ này trong database.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeRules.map((w) => {
              const isSelected = selectedWeightClassId === w.id;
              const { title, subtitle } = formatWeightClassLabel(w);
              const surchargeVal = Number(w.price);
              
              return (
                <div
                  key={w.id}
                  onClick={() => setSelectedWeightClassId(w.id)}
                  className={`p-5 rounded-[24px] bg-white cursor-pointer transition-all duration-300 border-2 flex flex-col justify-between min-h-[140px] relative overflow-hidden group ${
                    isSelected 
                      ? 'border-[#f0c05a] shadow-md bg-amber-50/5' 
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5 relative z-10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs md:text-sm font-bold text-slate-800 leading-tight">
                        {title}
                      </h4>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-[#f0c05a] fill-current bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-extrabold tracking-wider block">
                      {subtitle}
                    </span>
                    <p className="text-slate-400 text-[10px] md:text-xs leading-relaxed font-semibold pt-1">
                      Áp dụng cho {petSpecies === 'Dog' ? 'chó' : 'mèo'} thuộc nhóm phân khúc cân nặng {subtitle}.
                    </p>
                  </div>

                  <div className="text-right text-[11px] md:text-xs font-extrabold text-slate-700 tracking-tight pt-2">
                    {surchargeVal === 0 ? 'Không phụ thu' : `+${surchargeVal.toLocaleString('vi-VN')} đ`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bill & Escrow Policy Box */}
      <div className="rounded-[24px] bg-[#091b29] text-white p-6 md:p-8 space-y-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl" />
        
        {/* Box Title */}
        <h4 className="text-xs font-bold text-[#f0c05a] uppercase tracking-wider flex items-center gap-2">
          <span>📋</span> Hóa đơn dự kiến & Thể thức bảo chứng Safe-Pay
        </h4>

        {/* Invoice Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-t border-slate-800 pt-6">
          {/* Base Service */}
          <div className="md:col-span-4 space-y-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Dịch vụ cơ bản</span>
            <h5 className="text-sm md:text-base font-extrabold text-slate-100 tracking-tight">{serviceName}</h5>
            <span className="text-base font-extrabold text-slate-100">{formatPrice(basePrice)}</span>
          </div>

          <div className="hidden md:block md:col-span-1 h-12 w-px bg-slate-800 mx-auto" />

          {/* Surcharge Options */}
          <div className="md:col-span-4 space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Phụ thu chọn thêm</span>
            <ul className="text-xs font-bold text-slate-300 space-y-1.5">
              {currentRule ? (
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>
                    Thể trạng: {formatWeightClassLabel(currentRule).title}{' '}
                    {formatWeightClassLabel(currentRule).subtitle} (+{Number(currentRule.price).toLocaleString('vi-VN')} đ)
                  </span>
                </li>
              ) : (
                <li className="text-slate-500 font-medium italic">Không có phụ thu nào được áp dụng</li>
              )}
            </ul>
          </div>

          {/* Safe-Pay Total */}
          <div className="md:col-span-3 bg-slate-950/45 border border-slate-800 rounded-2xl p-5 flex flex-col justify-center min-w-[200px] text-center md:text-left">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 block">Tổng phí an toàn Safe-Pay</span>
            <span className="text-2xl md:text-3.5xl font-extrabold text-[#f0c05a] tracking-tight mb-2">
              {formatPrice(totalPrice)}
            </span>
            <p className="text-[9px] text-slate-400 leading-normal font-semibold">
              Hệ thống cam kết tạm giữ an toàn 100% số tiền trên. Chỉ giải ngân sau khi bạn nghiệm thu hài lòng hoàn toàn.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setStep(4)}
          className="flex items-center gap-1.5 px-5 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs md:text-sm font-bold rounded-2xl transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Chọn chuyên viên
        </button>

        <button
          type="button"
          disabled={!currentRule}
          className="flex items-center gap-1.5 px-6 py-3 bg-[#031625] hover:bg-teal-600 text-[#f0c05a] hover:text-white text-xs md:text-sm font-bold rounded-2xl shadow-lg transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-[#031625] disabled:hover:text-[#f0c05a]"
        >
          Chọn dịch vụ Spa
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
