'use client';

import * as React from 'react';
import { PetSelection, ServiceSelection, DetailService, ProviderSelection, ProviderDetail, TimeSelection, ConditionSelection, BookingInvoice, PaymentGateway, useBookingStore, CustomerBookingList } from '@/features/booking';
import { CalendarDays, PlusCircle } from 'lucide-react';

export default function BookingsPage() {
  const { currentStep } = useBookingStore();
  const [view, setView] = React.useState<'list' | 'new'>('list');

  return (
    <div className="py-6 max-w-6xl mx-auto px-4 md:px-8">
      {/* Tab switcher */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setView('list')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            view === 'list'
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Lịch sử đặt lịch
        </button>
        <button
          onClick={() => setView('new')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            view === 'new'
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Đặt lịch mới
        </button>
      </div>

      {/* Lịch sử đặt lịch */}
      {view === 'list' && <CustomerBookingList />}

      {/* Flow đặt lịch mới */}
      {view === 'new' && (
        <>
          {(currentStep === 0 || currentStep === 1) && <PetSelection />}
          {currentStep === 2 && <ServiceSelection />}
          {currentStep === 3 && <DetailService />}
          {currentStep === 4 && <ProviderSelection />}
          {currentStep === 5 && <ProviderDetail />}
          {currentStep === 6 && <TimeSelection />}
          {currentStep === 7 && <ConditionSelection />}
          {currentStep === 8 && <BookingInvoice />}
          {currentStep === 9 && <PaymentGateway />}
        </>
      )}
    </div>
  );
}
