import { useState } from 'react';
import { providerBookingService } from '../services/provider-booking.service';
import { useProviderBookingStore } from '../stores/provider-booking.store';

export const useUpdateChecklist = () => {
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  const updateChecklistItem = async (bookingId: string, itemId: string, status: 'PENDING' | 'DONE' | 'SKIPPED', onSuccess?: () => void) => {
    setIsUpdating(prev => ({ ...prev, [itemId]: true }));
    try {
      await providerBookingService.updateChecklistItem(bookingId, itemId, { status });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to update checklist item:', error);
      alert('Không thể cập nhật trạng thái mục này. Vui lòng thử lại!');
    } finally {
      setIsUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  return { updateChecklistItem, isUpdating };
};
