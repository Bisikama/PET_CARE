import { useProviderStore } from '../stores/provider.store';

export function useProvider() {
  const store = useProviderStore();

  return {
    providerData: store.providerData,
    isLoading: store.isLoading,
    error: store.error,
    isOpen: store.isOpen,
    step: store.step,
    fetchProviderMe: store.fetchProviderMe,
    openModal: store.openModal,
    closeModal: store.closeModal,
    setStep: store.setStep,
  };
}
