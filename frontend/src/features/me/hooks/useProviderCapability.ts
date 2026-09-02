'use client';

import { useState } from 'react';
import { meService } from '../services/me.service';
import { useProvider } from '@/features/provider';

export function useProviderCapability() {
  const { closeModal, setStep } = useProvider();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerCapability = async (data: {
    serviceId: string;
    petSpecies: string;
    minWeight: number;
    maxWeight: number;
  }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await meService.registerCapability(data);
      setIsSubmitting(false);
      setStep(4); // Move to Step 4 (Documents/Verification)
      return true;
    } catch (err: any) {
      console.error('Error registering capability:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể đăng ký năng lực dịch vụ.';
      setError(errorMessage);
      setIsSubmitting(false);
      return false;
    }
  };

  const getActiveServices = async () => {
    setError(null);
    try {
      return await meService.getActiveServices();
    } catch (err: any) {
      console.error('Error fetching active services:', err);
      return [];
    }
  };

  return {
    isSubmitting,
    error,
    setError,
    closeModal,
    setStep,
    registerCapability,
    getActiveServices,
  };
}
