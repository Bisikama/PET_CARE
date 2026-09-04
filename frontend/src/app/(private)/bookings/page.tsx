'use client';

import * as React from 'react';
import { PetSelection, ServiceSelection, DetailService, ProviderSelection, ProviderDetail, TimeSelection, ConditionSelection, BookingInvoice, PaymentGateway, useBookingStore } from '@/features/booking';

export default function BookingsPage() {
  const { currentStep } = useBookingStore();

  return (
    <div className="py-6 max-w-6xl mx-auto px-4 md:px-8">
      {currentStep === 1 && <PetSelection />}
      {currentStep === 2 && <ServiceSelection />}
      {currentStep === 3 && <DetailService />}
      {currentStep === 4 && <ProviderSelection />}
      {currentStep === 5 && <ProviderDetail />}
      {currentStep === 6 && <TimeSelection />}
      {currentStep === 7 && <ConditionSelection />}
      {currentStep === 8 && <BookingInvoice />}
      {currentStep === 9 && <PaymentGateway />}
    </div>
  );
}
