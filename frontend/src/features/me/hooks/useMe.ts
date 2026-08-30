import { useEffect } from 'react';
import { useMeStore } from '../stores/me.store';

export function useMe() {
  const {
    isOpen,
    isAddressModalOpen,
    user,
    isLoading,
    error,
    openModal,
    closeModal,
    openAddressModal,
    closeAddressModal,
    fetchMe,
  } = useMeStore();

  useEffect(() => {
    if (isOpen) {
      fetchMe();
    }
  }, [isOpen, fetchMe]);

  return {
    isOpen,
    isAddressModalOpen,
    user,
    isLoading,
    error,
    openModal,
    closeModal,
    openAddressModal,
    closeAddressModal,
    refresh: fetchMe,
  };
}
