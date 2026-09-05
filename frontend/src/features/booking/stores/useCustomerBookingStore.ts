import { create } from 'zustand';
import { Booking } from '../types';

interface CustomerBookingState {
  bookings: Booking[];
  isLoading: boolean;
  isFetched: boolean;
  error: string | null;

  // Actions
  setBookings: (bookings: Booking[]) => void;
  updateBooking: (updated: Booking) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearStore: () => void;
}

export const useCustomerBookingStore = create<CustomerBookingState>((set) => ({
  bookings: [],
  isLoading: false,
  isFetched: false,
  error: null,

  setBookings: (bookings) => set({ bookings, isFetched: true, error: null }),

  // Cập nhật 1 booking trong list (ví dụ: sau khi hủy → status = CANCELLED)
  updateBooking: (updated) =>
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === updated.id ? updated : b)),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clearStore: () => set({ bookings: [], isFetched: false, error: null }),
}));
