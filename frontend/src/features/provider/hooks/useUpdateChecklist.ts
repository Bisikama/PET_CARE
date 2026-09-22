import { useState } from 'react';
import { providerBookingService } from '../services/provider-booking.service';
import { useProviderBookingStore } from '../stores/provider-booking.store';

export const useUpdateChecklist = () => {
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const { updateChecklistItemStatus } = useProviderBookingStore();

  const updateChecklistItem = async (bookingId: string, itemId: string, status: 'PENDING' | 'DONE' | 'SKIPPED', onSuccess?: () => void) => {
    setIsUpdating(prev => ({ ...prev, [itemId]: true }));
    // Optimistically update store immediately for instant UI response
    updateChecklistItemStatus(itemId, status);
    try {
      await providerBookingService.updateChecklistItem(bookingId, itemId, { status });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to update checklist item:', error);
      // Revert status on failure
      const revertStatus = status === 'DONE' ? 'PENDING' : 'DONE';
      updateChecklistItemStatus(itemId, revertStatus);
    } finally {
      setIsUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  return { updateChecklistItem, isUpdating };
};
