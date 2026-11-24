import { useState } from 'react';
import { providerBookingService } from '../services/provider-booking.service';
import { systemAlert } from '@/components/ui/SystemDialogProvider';

export const useStartService = () => {
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startService = async (bookingId: string, onSuccess?: () => void) => {
    setIsStarting(true);
    setError(null);
    try {
      await providerBookingService.startService(bookingId);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi bắt đầu dịch vụ';
      setError(msg);
      systemAlert(msg, { title: 'Không thể bắt đầu dịch vụ', type: 'error' });
    } finally {
      setIsStarting(false);
    }
  };

  return { startService, isStarting, error };
};
