import { create } from 'zustand';
import { ProviderBookingDetail } from '../types/booking';

interface ProviderBookingStore {
  activeBookingId: string | null;
  bookingDetail: ProviderBookingDetail | null;
  isLoading: boolean;
  error: string | null;
  setActiveBookingId: (id: string | null) => void;
  setBookingDetail: (detail: ProviderBookingDetail) => void;
  updateChecklistItemStatus: (itemId: string, status: 'PENDING' | 'DONE' | 'SKIPPED') => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearBookingDetail: () => void;
}

export const useProviderBookingStore = create<ProviderBookingStore>((set) => ({
  activeBookingId: null,
  bookingDetail: null,
  isLoading: false,
  error: null,
  setActiveBookingId: (id) => set({ activeBookingId: id }),
  setBookingDetail: (detail) => set({ bookingDetail: detail, error: null }),
  updateChecklistItemStatus: (itemId, status) => set((state) => {
    if (!state.bookingDetail) return state;
    const updatedPets = state.bookingDetail.booking_pets?.map(pet => ({
      ...pet,
      booking_services: pet.booking_services?.map(service => ({
        ...service,
        booking_checklist_items: service.booking_checklist_items?.map(item =>
          item.id === itemId ? { ...item, status } : item
        )
      }))
    }));
    return {
      bookingDetail: {
        ...state.bookingDetail,
        booking_pets: updatedPets
      }
    };
  }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clearBookingDetail: () => set({ bookingDetail: null, error: null }),
}));
