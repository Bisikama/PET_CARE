import { useEffect, useState } from 'react';
import { useProviderScheduleStore } from '../stores/useProviderScheduleStore';
import { ScheduleSlot } from '../types';

export const useProviderSchedule = (providerId?: string, startDate?: string, endDate?: string) => {
  const { schedules, isLoading, error, fetchSchedules, blockSlot, clearSchedules } = useProviderScheduleStore();
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);

  useEffect(() => {
    if (providerId && startDate && endDate) {
      fetchSchedules(providerId, startDate, endDate);
    }
  }, [providerId, startDate, endDate, fetchSchedules]);

  const handleBlockSlot = async (slot: ScheduleSlot, date: string) => {
    await blockSlot(slot.id, date);
    setSelectedSlot(slot);
    // You could also start a timer or additional logic here if needed
  };

  return {
    schedules,
    isLoading,
    error,
    selectedSlot,
    handleBlockSlot,
    clearSchedules,
  };
};
