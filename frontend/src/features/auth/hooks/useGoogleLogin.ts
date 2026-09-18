import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export function useGoogleLogin() {
  const { loginWithGoogle, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleGoogleLogin = async (idToken: string, nonce?: string) => {
    clearError();
    const success = await loginWithGoogle(idToken, nonce);
    if (success) {
      router.push(ROUTES.DASHBOARD);
    }
    return success;
  };

  return {
    loginWithGoogle: handleGoogleLogin,
    isLoading,
    error,
    clearError,
  };
}
