'use client';

import * as React from 'react';
import {
  PetSelection,
  ServiceSelection,
  DetailService,
  ProviderSelection,
  ProviderDetail,
  TimeSelection,
  BookingInvoice,
  PaymentGateway,
  useBookingStore,
  CustomerBookingList,
} from '@/features/booking';
import { CalendarDays, PlusCircle, Check, Sparkles } from 'lucide-react';

const FLOW_STEPS = [
  { id: 1, label: 'Thú cưng', match: [0, 1] },
  { id: 2, label: 'Gói dịch vụ', match: [2, 3] },
  { id: 3, label: 'Chuyên viên', match: [4, 5] },
  { id: 4, label: 'Ngày & Giờ', match: [6] },
  { id: 5, label: 'Thanh toán', match: [8, 9] },
];

export default function BookingsPage() {
  const { currentStep, resetBooking, setSelectedServiceId, setStep } = useBookingStore();
  const [view, setView] = React.useState<'list' | 'new'>('list');

  // Từ trang Dịch vụ (?serviceId=...) hoặc từ Hồ sơ thú cưng (?view=new)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get('serviceId');
    const viewParam = params.get('view');

    if (serviceId) {
      resetBooking();
      setSelectedServiceId(serviceId);
      setView('new');
      window.history.replaceState(null, '', window.location.pathname);
    } else if (viewParam === 'new') {
      setStep(1);
      setView('new');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [resetBooking, setSelectedServiceId, setStep]);

  const activeStepIdx = React.useMemo(() => {
    const idx = FLOW_STEPS.findIndex((s) => s.match.includes(currentStep));
    return idx === -1 ? 0 : idx;
  }, [currentStep]);

  const progressPercent = React.useMemo(() => {
    return Math.round(((activeStepIdx + 1) / FLOW_STEPS.length) * 100);
  }, [activeStepIdx]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Luxury Header Card with Segmented View Switcher */}
      <div className="relative overflow-hidden rounded-3xl bg-[#08243D] text-white p-6 md:p-7 shadow-sm border border-slate-800/80 animate-slide-down">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[radial-gradient(circle_at_top_right,rgba(247,201,72,0.14),transparent_65%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#F7C948]">
              <Sparkles className="w-3.5 h-3.5" />
              Dịch vụ chăm sóc tại nhà
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              {view === 'list' ? 'Quản lý Lịch hẹn của bạn' : 'Đặt lịch Chăm sóc Thú cưng'}
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              {view === 'list'
                ? 'Theo dõi trạng thái ca chăm sóc theo thời gian thực, nghiệm thu dịch vụ và bảo vệ thanh toán qua Escrow.'
                : 'Hoàn tất 5 bước đơn giản để chọn chuyên viên xác minh danh tính đến chăm sóc bé cưng tại nhà.'}
            </p>
          </div>

          {/* Segmented Control Switcher */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setView('list')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                view === 'list'
                  ? 'bg-[#F7C948] text-[#08243D] shadow-xs scale-[1.01]'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Lịch sử đặt lịch
            </button>
            <button
              type="button"
              onClick={() => setView('new')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                view === 'new'
                  ? 'bg-[#F7C948] text-[#08243D] shadow-xs scale-[1.01]'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Đặt lịch mới
            </button>
          </div>
        </div>

        {/* Animated 5-Step Progress Indicator when in 'new' */}
        {view === 'new' && (
          <div className="relative z-10 mt-6 pt-5 border-t border-white/10 animate-slide-up">
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
              {FLOW_STEPS.map((s, idx) => {
                const isDone = idx < activeStepIdx;
                const isCurrent = idx === activeStepIdx;
                return (
                  <React.Fragment key={s.id}>
                    <div className="flex items-center gap-2.5 whitespace-nowrap">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          isCurrent
                            ? 'bg-[#F7C948] text-[#08243D] shadow-sm scale-105 animate-gold-pulse'
                            : isDone
                              ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                              : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : s.id}
                      </span>
                      <div>
                        <span
                          className={`block text-xs transition-colors ${
                            isCurrent
                              ? 'text-[#F7C948] font-bold'
                              : isDone
                                ? 'text-white font-semibold'
                                : 'text-slate-400 font-medium'
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    </div>
                    {idx < FLOW_STEPS.length - 1 && (
                      <div className="flex-1 min-w-[24px] h-0.5 bg-white/10 rounded-full overflow-hidden mx-1">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isDone ? 'w-full bg-emerald-400' : isCurrent ? 'w-1/2 bg-[#F7C948]' : 'w-0'
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-3 sm:hidden">
              <div
                className="h-full bg-[#F7C948] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Lịch sử đặt lịch */}
      {view === 'list' && (
        <div key="view-list" className="animate-slide-up">
          <CustomerBookingList
            onPayBooking={() => setView('new')}
            onCreateNewBooking={() => {
              resetBooking();
              setView('new');
            }}
          />
        </div>
      )}

      {/* Flow đặt lịch mới (animated per step) */}
      {view === 'new' && (
        <div key={`step-${currentStep}`} className="animate-slide-up">
          {(currentStep === 0 || currentStep === 1) && <PetSelection />}
          {currentStep === 2 && <ServiceSelection />}
          {currentStep === 3 && <DetailService />}
          {currentStep === 4 && <ProviderSelection />}
          {currentStep === 5 && <ProviderDetail />}
          {currentStep === 6 && <TimeSelection />}
          {currentStep === 8 && <BookingInvoice />}
          {currentStep === 9 && <PaymentGateway />}
        </div>
      )}
    </div>
  );
}




