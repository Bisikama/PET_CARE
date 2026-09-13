import { useBookingStore } from '../stores/booking.store';

export const useBookingMatching = () => {
  const {
    calculatedPrice,
    matchingProviders,
    isLoading,
    isSubmitting,
    error,
    calculatePrice,
    searchMatchingProviders,
  } = useBookingStore();

  return {
    calculatedPrice,
    matchingProviders,
    isLoading,
    isSubmitting,
    error,
    calculatePrice,
    searchMatchingProviders,
  };
};
