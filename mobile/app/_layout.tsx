import 'react-native-gesture-handler';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Core routing layout
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Set initial route to the root index.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

import { AuthProvider, useAuth } from '../src/features/auth/context/AuthContext';
import { useRouter, useSegments } from 'expo-router';

function RootLayoutNav() {
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MainLayout />
      </GestureHandlerRootView>
    </AuthProvider>
  );
}

function MainLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inCustomerGroup = segments[0] === '(customer)';
    const inProviderGroup = segments[0] === '(provider)';
    
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated) {
      const isProvider = user?.role === 'PROVIDER';

      if (inAuthGroup) {
        // Redirect to appropriate landing screen after login
        if (isProvider) {
          router.replace('/(provider)/(tabs)/jobs' as any);
        } else {
          router.replace('/(customer)/(tabs)/home' as any);
        }
      } else if (isProvider && inCustomerGroup) {
        // Redirect provider away from customer screens
        router.replace('/(provider)/(tabs)/jobs' as any);
      } else if (!isProvider && inProviderGroup) {
        // Redirect customer away from provider screens
        router.replace('/(customer)/(tabs)/home' as any);
      }
    }
  }, [isAuthenticated, isLoading, user, segments, router]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(customer)" options={{ headerShown: false }} />
      <Stack.Screen name="(provider)" options={{ headerShown: false }} />
    </Stack>
  );
}
