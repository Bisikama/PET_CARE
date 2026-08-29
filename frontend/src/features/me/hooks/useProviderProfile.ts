'use client';

import { useState } from 'react';
import { meService } from '../services/me.service';
import { useProvider } from '@/features/provider';

export function useProviderProfile() {
  const { closeModal, setStep } = useProvider();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerProvider = async (data: {
    providerType: 'SITTER' | 'GROOMER' | 'VET';
    bio: string;
    experienceYears: number;
  }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await meService.registerProvider(data);
      setIsSubmitting(false);
      setStep(2); // Move to Step 2 (Service Area)
      return true;
    } catch (err: any) {
      console.error('Error registering provider profile:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể đăng ký hồ sơ đối tác.';
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
    registerProvider,
  };
}
