import { create } from 'zustand';
import { ProviderScheduleResponse, ScheduleSlot } from '../types';
import { providerScheduleService } from '../services/provider-schedule.service';

interface ProviderScheduleState {
  schedules: ProviderScheduleResponse[];
  isLoading: boolean;
  error: string | null;
  // Cache key could be a combination of providerId + startDate + endDate
  lastFetchedProviderId: string | null;
  
  fetchSchedules: (providerId: string, startDate: string, endDate: string) => Promise<void>;
  blockSlot: (slotId: string, date: string) => Promise<void>;
  clearSchedules: () => void;
}

export const useProviderScheduleStore = create<ProviderScheduleState>((set, get) => ({
  schedules: [],
  isLoading: false,
  error: null,
  lastFetchedProviderId: null,

  fetchSchedules: async (providerId: string, startDate: string, endDate: string) => {
    // Avoid re-fetching if we already have the data for this provider (simple cache)
    // For a more robust cache, we could map it by date ranges or use React Query.
    const { lastFetchedProviderId, schedules } = get();
    if (lastFetchedProviderId === providerId && schedules.length > 0) {
      return; 
    }

    set({ isLoading: true, error: null });
    try {
      const data = await providerScheduleService.getAvailableSlots(providerId, startDate, endDate);
      set({ schedules: data, lastFetchedProviderId: providerId, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch schedules', isLoading: false });
    }
  },

  blockSlot: async (slotId: string, date: string) => {
    try {
      // Optimistically update UI or wait for response
      const updatedSlot = await providerScheduleService.blockSlot(slotId);
      
      set((state) => ({
        schedules: state.schedules.map((schedule) => {
          if (schedule.date === date) {
            return {
              ...schedule,
              slots: schedule.slots.map((slot) => 
                slot.id === slotId ? { ...slot, status: 'PENDING' } : slot
              )
            };
          }
          return schedule;
        })
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to block slot' });
    }
  },

  clearSchedules: () => {
    set({ schedules: [], lastFetchedProviderId: null, error: null });
  }
}));
