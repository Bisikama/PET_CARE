import { create } from 'zustand';
import { ServiceArea, CreateAreaDto, UpdateAreaDto } from '../types';
import { areaService } from '../services/area.service';

interface AreaState {
  areas: ServiceArea[];
  isLoading: boolean;
  hasFetchedOnce: boolean;
  error: string | null;

  fetchAreas: (force?: boolean) => Promise<void>;
  addArea: (data: CreateAreaDto) => Promise<void>;
  updateArea: (id: string, data: UpdateAreaDto) => Promise<void>;
  deleteArea: (id: string) => Promise<void>;
}

export const useAreaStore = create<AreaState>((set, get) => ({
  areas: [],
  isLoading: false,
  hasFetchedOnce: false,
  error: null,

  fetchAreas: async (force = false) => {
    const { hasFetchedOnce, isLoading } = get();
    if (isLoading || (hasFetchedOnce && !force)) return;

    set({ isLoading: true, error: null });
    try {
      const data = await areaService.getAreas();
      const areas = Array.isArray(data) ? data : (data as any).data || [];
      set({ areas, isLoading: false, hasFetchedOnce: true });
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Lỗi khi tải danh sách khu vực' });
      console.error('Fetch areas failed', error);
    }
  },

  addArea: async (data) => {
    try {
      const newArea = await areaService.createArea(data);
      set((state) => ({
        areas: [...state.areas, newArea]
      }));
    } catch (error) {
      console.error('Add area failed', error);
      throw error;
    }
  },

  updateArea: async (id, data) => {
    try {
      const updatedArea = await areaService.updateArea(id, data);
      set((state) => ({
        areas: state.areas.map((a) => (a.id === id ? { ...a, ...updatedArea } : a))
      }));
    } catch (error) {
      console.error('Update area failed', error);
      throw error;
    }
  },

  deleteArea: async (id) => {
    try {
      await areaService.deleteArea(id);
      set((state) => ({
        areas: state.areas.filter((a) => a.id !== id)
      }));
    } catch (error) {
      console.error('Delete area failed', error);
      throw error;
    }
  }
}));
