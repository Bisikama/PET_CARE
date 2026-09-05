import { create } from 'zustand';
import { ProviderBookingDetail } from '../types/booking';

interface ProviderBookingStore {
  activeBookingId: string | null;
  bookingDetail: ProviderBookingDetail | null;
  isLoading: boolean;
  error: string | null;
  setActiveBookingId: (id: string | null) => void;
  setBookingDetail: (detail: ProviderBookingDetail) => void;
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
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clearBookingDetail: () => set({ bookingDetail: null, error: null }),
}));
