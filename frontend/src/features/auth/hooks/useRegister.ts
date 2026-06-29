import { useAuthStore } from '../stores/auth.store';

export function useRegister() {
  const { registerUser, isLoading, error, clearError } = useAuthStore();

  const handleRegister = async (data: Record<string, any>) => {
    return await registerUser(data);
  };

  return {
    registerUser: handleRegister,
    isLoading,
    error,
    clearError,
  };
}
