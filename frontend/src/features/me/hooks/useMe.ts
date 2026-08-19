import { useEffect } from 'react';
import { useMeStore } from '../stores/me.store';

export function useMe() {
  const { isOpen, user, isLoading, error, openModal, closeModal, fetchMe } = useMeStore();

  useEffect(() => {
    if (isOpen) {
      fetchMe();
    }
  }, [isOpen, fetchMe]);

  return {
    isOpen,
    user,
    isLoading,
    error,
    openModal,
    closeModal,
    refresh: fetchMe,
  };
}
