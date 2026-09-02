import { create } from 'zustand';
import { petService } from '../services/pet.service';
import { Pet } from '../types';

interface PetState {
  pets: Pet[];
  selectedPet: Pet | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isOpen: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  setSelectedPet: (pet: Pet | null) => void;
  fetchPets: () => Promise<void>;
  fetchPetById: (id: string) => Promise<void>;
  createPet: (formData: FormData) => Promise<boolean>;
  updatePet: (id: string, formData: FormData) => Promise<boolean>;
  deletePet: (id: string) => Promise<boolean>;
}

export const usePetStore = create<PetState>((set) => ({
  pets: [],
  selectedPet: null,
  isLoading: false,
  isSubmitting: false,
  isOpen: false,
  error: null,

  openModal: () => set({ isOpen: true, error: null }),
  closeModal: () => set({ isOpen: false, error: null, selectedPet: null }),
  setSelectedPet: (pet: Pet | null) => set({ selectedPet: pet }),

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

  fetchPetById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const pet = await petService.getPetById(id);
      set({ selectedPet: pet, isLoading: false });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể tải thông tin thú cưng.';
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

  updatePet: async (id: string, formData: FormData) => {
    set({ isSubmitting: true, error: null });
    try {
      await petService.updatePet(id, formData);
      set({ isSubmitting: false, isOpen: false, selectedPet: null });
      // Fetch updated pet list after update
      const updatedPets = await petService.getPets();
      set({ pets: updatedPets });
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể cập nhật thông tin thú cưng.';
      set({ error: errorMessage, isSubmitting: false });
      return false;
    }
  },

  deletePet: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await petService.deletePet(id);
      // Fetch updated pet list after deletion
      const updatedPets = await petService.getPets();
      set({ pets: updatedPets, isLoading: false });
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể xóa thú cưng.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
}));
