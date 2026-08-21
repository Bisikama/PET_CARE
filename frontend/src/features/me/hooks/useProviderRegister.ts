import { useState } from 'react';
import { meService } from '../services/me.service';
import { useProvider } from '@/features/provider';

export function useProviderRegister() {
  const { isOpen, closeModal, step, setStep } = useProvider();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerProvider = async (data: { providerType: 'SITTER' | 'GROOMER' | 'VET'; bio: string; experienceYears: number }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await meService.registerProvider(data);
      setIsSubmitting(false);
      setStep(2); // Go to service area step
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

  const addServiceArea = async (data: { city: string; district: string; ward: string }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await meService.addServiceArea(data);
      setIsSubmitting(false);
      setStep(3); // Go to capabilities step
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

  const registerCapability = async (data: { serviceId: string; petSpecies: string; minWeight: number; maxWeight: number }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await meService.registerCapability(data);
      setIsSubmitting(false);
      setStep(4); // Go to identity upload step
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
    isOpen,
    closeModal,
    step,
    setStep,
    isSubmitting,
    error,
    setError,
    registerProvider,
    addServiceArea,
    registerCapability,
    uploadDocument,
    getActiveServices,
  };
}
