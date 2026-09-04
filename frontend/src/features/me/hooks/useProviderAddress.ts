'use client';

import { useState } from 'react';
import { meService } from '../services/me.service';
import { useProvider } from '@/features/provider';

export function useProviderAddress() {
  const { closeModal, setStep } = useProvider();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveBaseAddress = async (data: {
    baseAddressLine: string;
    baseLatitude: number;
    baseLongitude: number;
    baseFormatted?: string;
    serviceRadiusKm?: number;
  }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await meService.updateBaseAddress(data);
      setIsSubmitting(false);
      setStep(3); // Move to Step 3 (eKYC verification)
      return true;
    } catch (err: any) {
      console.error('Error updating provider address:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể cập nhật địa chỉ cơ sở.';
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
    saveBaseAddress,
  };
}
