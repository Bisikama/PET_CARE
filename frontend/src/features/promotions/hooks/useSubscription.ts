import { useEffect } from 'react';
import { useSubscriptionStore } from '../stores/subscription.store';

export const useSubscription = () => {
  const {
    mySubscription,
    isLoading,
    isSubmitting,
    isOpen,
    error,
    openModal,
    closeModal,
    fetchMySubscription,
    checkoutVnPay,
    checkoutWallet,
  } = useSubscriptionStore();

  useEffect(() => {
    fetchMySubscription();
  }, [fetchMySubscription]);

  return {
    mySubscription,
    isLoading,
    isSubmitting,
    isOpen,
    error,
    openModal,
    closeModal,
    checkoutVnPay,
    checkoutWallet,
    refetch: () => fetchMySubscription(true),
  };
};
