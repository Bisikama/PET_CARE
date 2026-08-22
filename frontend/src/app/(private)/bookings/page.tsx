'use client';

import * as React from 'react';
import { PetSelection, ConditionSelection, useBookingStore } from '@/features/booking';

export default function BookingsPage() {
  const { currentStep } = useBookingStore();

  return (
    <div className="py-6 max-w-6xl mx-auto px-4 md:px-8">
      {currentStep === 1 && <PetSelection />}
      {currentStep === 2 && <ConditionSelection />}
    </div>
  );
}
