import { create } from 'zustand';
import { BookingStepState } from '../types';

interface BookingStore extends BookingStepState {
  setSelectedPetId: (id: string | null) => void;
  setSelectedServiceId: (id: string | null) => void;
  setSelectedAddressId: (id: string | null) => void;
  setSelectedProviderId: (id: string | null) => void;
  setSelectedSlotId: (id: string | null) => void;
  setCreatedBookingId: (id: string | null) => void;
  setStep: (step: number) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
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

  setSelectedPetId: (id) => set({ selectedPetId: id }),
  setSelectedServiceId: (id) => set({ selectedServiceId: id }),
  setSelectedAddressId: (id) => set({ selectedAddressId: id }),
  setSelectedProviderId: (id) => set({ selectedProviderId: id }),
  setSelectedSlotId: (id) => set({ selectedSlotId: id }),
  setCreatedBookingId: (id) => set({ createdBookingId: id }),
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
  }),
}));

