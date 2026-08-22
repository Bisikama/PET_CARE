import { create } from 'zustand';
import { BookingStepState } from '../types';

interface BookingStore extends BookingStepState {
  setSelectedPetId: (id: string | null) => void;
  setSelectedServiceId: (id: string | null) => void;
  setStep: (step: number) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  currentStep: 1,
  selectedPetId: null,
  selectedServiceId: null,
  petWeightClass: undefined,
  specialNeeds: undefined,
  notes: undefined,

  setSelectedPetId: (id) => set({ selectedPetId: id }),
  setSelectedServiceId: (id) => set({ selectedServiceId: id }),
  setStep: (step) => set({ currentStep: step }),
  resetBooking: () => set({
    currentStep: 1,
    selectedPetId: null,
    selectedServiceId: null,
    petWeightClass: undefined,
    specialNeeds: undefined,
    notes: undefined,
  }),
}));
