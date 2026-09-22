import { create } from 'zustand';
import { BookingStepState } from '../types';

interface BookingStore extends BookingStepState {
  bookingDetailsMap: Record<string, any>;
  checklistsMap: Record<string, any[]>;
  calculatedPrice: any | null;
  matchingProviders: any[];
  appliedDiscount: number;
  appliedPromoCode: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  setSelectedPetId: (id: string | null) => void;
  setSelectedServiceId: (id: string | null) => void;
  setSelectedAddressId: (id: string | null) => void;
  setSelectedProviderId: (id: string | null) => void;
  setSelectedSlotId: (id: string | null) => void;
  setCreatedBookingId: (id: string | null) => void;
  setAppliedDiscount: (discount: number, promoCode?: string | null) => void;
  setStep: (step: number) => void;
  resetBooking: () => void;
  fetchBookingDetail: (id: string, force?: boolean) => Promise<any>;
  fetchBookingChecklist: (bookingId: string, force?: boolean) => Promise<any[]>;
  calculatePrice: (dto: any) => Promise<any>;
  searchMatchingProviders: (dto: any) => Promise<any[]>;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  currentStep: 1,
  selectedPetId: null,
  selectedServiceId: null,
  selectedAddressId: null,
  selectedProviderId: null,
  selectedSlotId: null,
  createdBookingId: null,
  petWeightClass: undefined,
  specialNeeds: undefined,
  notes: undefined,
  bookingDetailsMap: {},
  checklistsMap: {},
  calculatedPrice: null,
  matchingProviders: [],
  appliedDiscount: 0,
  appliedPromoCode: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  setSelectedPetId: (id) => set({ selectedPetId: id }),
  setSelectedServiceId: (id) => set({ selectedServiceId: id }),
  setSelectedAddressId: (id) => set({ selectedAddressId: id }),
  setSelectedProviderId: (id) => set({ selectedProviderId: id }),
  setSelectedSlotId: (id) => set({ selectedSlotId: id }),
  setCreatedBookingId: (id) => set({ createdBookingId: id }),
  setAppliedDiscount: (discount, promoCode = null) => set({ appliedDiscount: discount, appliedPromoCode: promoCode }),
  setStep: (step) => set({ currentStep: step }),
  resetBooking: () => set({
    currentStep: 1,
    selectedPetId: null,
    selectedServiceId: null,
    selectedAddressId: null,
    selectedProviderId: null,
    selectedSlotId: null,
    createdBookingId: null,
    petWeightClass: undefined,
    specialNeeds: undefined,
    notes: undefined,
    calculatedPrice: null,
    matchingProviders: [],
    appliedDiscount: 0,
    appliedPromoCode: null,
  }),

  fetchBookingDetail: async (id: string, force = false) => {
    if (!force && get().bookingDetailsMap[id]) {
      return get().bookingDetailsMap[id];
    }
    set({ isLoading: true, error: null });
    try {
      const { bookingService } = await import('../services/booking.service');
      const data = await bookingService.getBooking(id);
      set((state) => ({
        bookingDetailsMap: { ...state.bookingDetailsMap, [id]: data },
        isLoading: false,
      }));
      return data;
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải thông tin booking', isLoading: false });
      return null;
    }
  },

  fetchBookingChecklist: async (bookingId: string, force = false) => {
    if (!force && get().checklistsMap[bookingId]) {
      return get().checklistsMap[bookingId];
    }
    set({ isLoading: true, error: null });
    try {
      const { bookingService } = await import('../services/booking.service');
      const res = await bookingService.getBookingChecklist(bookingId);
      const items = res?.data?.checklistItems || res?.checklistItems || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
      set((state) => ({
        checklistsMap: { ...state.checklistsMap, [bookingId]: items },
        isLoading: false,
      }));
      return items;
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải checklist', isLoading: false });
      return [];
    }
  },

  calculatePrice: async (dto: any) => {
    set({ isSubmitting: true, error: null });
    try {
      const { bookingService } = await import('../services/booking.service');
      const price = await bookingService.calculatePrice(dto);
      set({ calculatedPrice: price, isSubmitting: false });
      return price;
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tính giá dịch vụ', isSubmitting: false });
      return null;
    }
  },

  searchMatchingProviders: async (dto: any) => {
    set({ isLoading: true, error: null });
    try {
      const { bookingService } = await import('../services/booking.service');
      const providers = await bookingService.searchMatchingProviders(dto);
      set({ matchingProviders: providers, isLoading: false });
      return providers;
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tìm kiếm ghép cặp', isLoading: false });
      return [];
    }
  },
}));


