import { useAuthStore } from '../stores/auth.store';

export function useLogin() {
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async (credentials: Record<string, any>) => {
    return await login(credentials);
  };

  return {
    login: handleLogin,
    isLoading,
    error,
    clearError,
  };
}
