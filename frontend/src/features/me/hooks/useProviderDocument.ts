'use client';

import { useState } from 'react';
import { meService } from '../services/me.service';
import { useProvider } from '@/features/provider';

export function useProviderDocument() {
  const { closeModal, setStep } = useProvider();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = async (documentType: string, file: File) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await meService.uploadDocument(documentType, file);
      setIsSubmitting(false);
      return true;
    } catch (err: any) {
      console.error('Error uploading document:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể tải lên tài liệu xác minh.';
      setError(errorMessage);
      setIsSubmitting(false);
      return false;
    }
  };

  const submitKyc = async (
    data: { idNumber: string; fullName: string; dob: string; issueDate: string },
    files: { frontImage: File; backImage: File; faceImage: File }
  ) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await meService.submitKyc(data, files);
      setIsSubmitting(false);
      return true;
    } catch (err: any) {
      console.error('Error submitting KYC:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể gửi hồ sơ eKYC xác minh.';
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
    uploadDocument,
    submitKyc,
  };
}
