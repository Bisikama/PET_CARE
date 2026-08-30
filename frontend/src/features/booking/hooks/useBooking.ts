import { useBookingStore } from '../stores/booking.store';

export function useBooking() {
  const {
    currentStep,
    selectedPetId,
    selectedServiceId,
    selectedAddressId,
    selectedProviderId,
    petWeightClass,
    specialNeeds,
    notes,
    setSelectedPetId,
    setSelectedServiceId,
    setSelectedAddressId,
    setSelectedProviderId,
    setStep,
    resetBooking,
  } = useBookingStore();

  return {
    currentStep,
    selectedPetId,
    selectedServiceId,
    selectedAddressId,
    selectedProviderId,
    petWeightClass,
    specialNeeds,
    notes,
    setSelectedPetId,
    setSelectedServiceId,
    setSelectedAddressId,
    setSelectedProviderId,
    setStep,
    resetBooking,
  };
}

