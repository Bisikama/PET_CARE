import { useState } from 'react';
import { meService } from '../services/me.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useMeStore } from '../stores/me.store';

export const useUpdateProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const setUser = useAuthStore(state => state.setUser);
  const user = useAuthStore(state => state.user);

  const updateProfile = async (data: { fullName?: string; phone?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await meService.updateProfile(data);
      
      // Update local state if successful
      if (user) {
        setUser({ ...user, ...data });
      }
      
      return res;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Cập nhật thông tin thất bại';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvatar = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await meService.updateAvatar(file);
      
      // Assuming response contains the new avatar URL in data field, e.g. { success: true, data: { avatarUrl: '...' } }
      // Or we can just re-fetch the user info.
      // We will re-fetch user info from API to be safe.
      const updatedUser = await meService.getMe();
      setUser(updatedUser);
      
      return res;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Cập nhật ảnh đại diện thất bại';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateProfile,
    updateAvatar,
    isLoading,
    error,
  };
};
