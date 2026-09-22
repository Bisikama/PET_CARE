import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BookingDraft } from '../types/booking.types';

interface BookingContextType {
  draft: BookingDraft;
  updateDraft: (updates: Partial<BookingDraft>) => void;
  resetDraft: () => void;
  initBookingForService: (service: {
    id: string;
    title: string;
    price?: number;
    duration?: number;
    category?: string;
  }) => void;
}

const initialDraft: BookingDraft = {
  paymentMethod: 'WALLET',
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<BookingDraft>(initialDraft);

  const updateDraft = useCallback((updates: Partial<BookingDraft>) => {
    setDraft((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(initialDraft);
  }, []);

  const initBookingForService = useCallback(
    (service: {
      id: string;
      title: string;
      price?: number;
      duration?: number;
      category?: string;
    }) => {
      setDraft({
        ...initialDraft,
        serviceId: service.id,
        serviceTitle: service.title,
        basePrice: service.price,
        servicePrice: service.price,
        serviceDurationMinutes: service.duration,
        serviceCategory: service.category,
      });
    },
    []
  );

  return (
    <BookingContext.Provider
      value={{
        draft,
        updateDraft,
        resetDraft,
        initBookingForService,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingFlow() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingFlow must be used within a BookingProvider');
  }
  return context;
}
