import { useBookingStore } from '../stores/booking.store';

export function useBooking() {
  const {
    currentStep,
    selectedPetId,
    selectedServiceId,
    petWeightClass,
    specialNeeds,
    notes,
    setSelectedPetId,
    setSelectedServiceId,
    setStep,
    resetBooking,
  } = useBookingStore();

  return {
    currentStep,
    selectedPetId,
    selectedServiceId,
    petWeightClass,
    specialNeeds,
    notes,
    setSelectedPetId,
    setSelectedServiceId,
    setStep,
    resetBooking,
  };
}
