import { create } from 'zustand';
import { medicalRecordService } from '../services/medical-record.service';
import { CreateMedicalRecordDto, PetMedicalRecord, UpdateMedicalRecordDto } from '../types/medical-record.types';

interface MedicalRecordState {
  recordsByPetId: Record<string, PetMedicalRecord[]>;
  selectedRecord: PetMedicalRecord | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isOpen: boolean;
  error: string | null;
  activePetId: string | null;
  
  setActivePetId: (petId: string | null) => void;
  openModal: (record?: PetMedicalRecord | null) => void;
  closeModal: () => void;
  fetchMedicalRecords: (petId: string, forceFetch?: boolean) => Promise<void>;
  createMedicalRecord: (petId: string, dto: CreateMedicalRecordDto) => Promise<boolean>;
  updateMedicalRecord: (recordId: string, dto: UpdateMedicalRecordDto) => Promise<boolean>;
  deleteMedicalRecord: (recordId: string, petId: string) => Promise<boolean>;
}

export const useMedicalRecordStore = create<MedicalRecordState>((set, get) => ({
  recordsByPetId: {},
  selectedRecord: null,
  isLoading: false,
  isSubmitting: false,
  isOpen: false,
  error: null,
  activePetId: null,

  setActivePetId: (petId) => set({ activePetId: petId }),
  openModal: (record = null) => set({ isOpen: true, selectedRecord: record, error: null }),
  closeModal: () => set({ isOpen: false, selectedRecord: null, error: null }),

  fetchMedicalRecords: async (petId: string, forceFetch = false) => {
    // Cache check: Avoid redundant GET requests unless forced
    if (!forceFetch && get().recordsByPetId[petId]) {
      return;
    }

    set({ isLoading: true, error: null, activePetId: petId });
    try {
      const records = await medicalRecordService.getMedicalRecords(petId);
      set((state) => ({
        recordsByPetId: { ...state.recordsByPetId, [petId]: records },
        isLoading: false,
      }));
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể tải sổ y tế của thú cưng.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createMedicalRecord: async (petId: string, dto: CreateMedicalRecordDto) => {
    set({ isSubmitting: true, error: null });
    try {
      await medicalRecordService.createMedicalRecord(petId, dto);
      set({ isSubmitting: false, isOpen: false, selectedRecord: null });
      // Re-fetch to update cache
      await get().fetchMedicalRecords(petId, true);
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể tạo hồ sơ y tế.';
      set({ error: errorMessage, isSubmitting: false });
      return false;
    }
  },

  updateMedicalRecord: async (recordId: string, dto: UpdateMedicalRecordDto) => {
    set({ isSubmitting: true, error: null });
    const { activePetId } = get();
    try {
      await medicalRecordService.updateMedicalRecord(recordId, dto);
      set({ isSubmitting: false, isOpen: false, selectedRecord: null });
      if (activePetId) {
        await get().fetchMedicalRecords(activePetId, true);
      }
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể cập nhật hồ sơ y tế.';
      set({ error: errorMessage, isSubmitting: false });
      return false;
    }
  },

  deleteMedicalRecord: async (recordId: string, petId: string) => {
    set({ isLoading: true, error: null });
    try {
      await medicalRecordService.deleteMedicalRecord(recordId);
      set({ isLoading: false });
      await get().fetchMedicalRecords(petId, true);
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể xóa hồ sơ y tế.';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
}));
