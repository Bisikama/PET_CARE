import { create } from 'zustand';
import { petService } from '../services/pet.service';
import { Pet } from '../types';

interface PetState {
  pets: Pet[];
  isLoading: boolean;
  isSubmitting: boolean;
  isOpen: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  fetchPets: () => Promise<void>;
  createPet: (formData: FormData) => Promise<boolean>;
}

export const usePetStore = create<PetState>((set) => ({
  pets: [],
  isLoading: false,
  isSubmitting: false,
  isOpen: false,
  error: null,

  openModal: () => set({ isOpen: true, error: null }),
  closeModal: () => set({ isOpen: false, error: null }),

  fetchPets: async () => {
    set({ isLoading: true, error: null });
    try {
      const pets = await petService.getPets();
      set({ pets, isLoading: false });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể tải danh sách thú cưng.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createPet: async (formData: FormData) => {
    set({ isSubmitting: true, error: null });
    try {
      await petService.createPet(formData);
      set({ isSubmitting: false, isOpen: false });
      // Fetch updated pet list after creation
      const updatedPets = await petService.getPets();
      set({ pets: updatedPets });
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể đăng ký thú cưng.';
      set({ error: errorMessage, isSubmitting: false });
      return false;
    }
  },
}));
