import { usePetStore } from '../stores/pet.store';

export function usePet() {
  const store = usePetStore();

  return {
    pets: store.pets,
    selectedPet: store.selectedPet,
    isLoading: store.isLoading,
    isSubmitting: store.isSubmitting,
    isOpen: store.isOpen,
    error: store.error,
    openModal: store.openModal,
    closeModal: store.closeModal,
    setSelectedPet: store.setSelectedPet,
    fetchPets: store.fetchPets,
    fetchPetById: store.fetchPetById,
    createPet: store.createPet,
    updatePet: store.updatePet,
    deletePet: store.deletePet,
  };
}
