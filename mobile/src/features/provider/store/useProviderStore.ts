import { create } from 'zustand';
import { providerApi } from '../api/providerApi';
import { ProviderProfileResponse, CreateProviderProfileDto } from '../types/provider.types';
import axios from 'axios';

interface ProviderState {
  profile: ProviderProfileResponse | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  createProfile: (data: CreateProviderProfileDto) => Promise<void>;
}

export const useProviderStore = create<ProviderState>((set) => ({
  profile: null,
  isLoading: true,
  isSubmitting: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await providerApi.getProfile();
      if (response.success && response.data) {
        set({ profile: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Error fetching profile', isLoading: false });
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        // Not found means no profile yet, which is a valid state
        set({ profile: null, isLoading: false });
      } else {
        set({ error: err.message || 'An error occurred', isLoading: false });
      }
    }
  },

  createProfile: async (data: CreateProviderProfileDto) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await providerApi.createProfile(data);
      if (response.success && response.data) {
        set({ profile: response.data, isSubmitting: false });
      } else {
        set({ error: response.message || 'Error creating profile', isSubmitting: false });
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        // Conflict means it was already created, we should fetch it again
        const profileResponse = await providerApi.getProfile();
        if (profileResponse.success) {
          set({ profile: profileResponse.data, isSubmitting: false });
        } else {
          set({ error: 'Profile conflict but failed to fetch', isSubmitting: false });
        }
      } else {
        set({ error: err.message || 'An error occurred', isSubmitting: false });
      }
    }
  }
}));
