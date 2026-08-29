'use client';

import { useState } from 'react';
import { meService } from '../services/me.service';
import { useProvider } from '@/features/provider';

export function useProviderArea() {
  const { closeModal, setStep } = useProvider();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addServiceArea = async (data: { city: string; district: string; ward: string }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await meService.addServiceArea(data);
      setIsSubmitting(false);
      setStep(3); // Move to Step 3 (Capabilities)
      return true;
    } catch (err: any) {
      console.error('Error adding service area:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể thêm khu vực phục vụ.';
      setError(errorMessage);
      setIsSubmitting(false);
      return false;
    }
  };

  return {
    isSubmitting,
    error,
    setError,
    closeModal,
    setStep,
    addServiceArea,
  };
}
