import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function RootIndexRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FF' }}>
        <ActivityIndicator size="large" color="#0B2A4A" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user?.role === 'PROVIDER') {
    return <Redirect href={'/(provider)/(tabs)/jobs' as any} />;
  }

  return <Redirect href={'/(customer)/(tabs)/home' as any} />;
}
