import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ProviderDetailsScreen from '../../../src/features/providers/screens/ProviderDetailsScreen';

export default function ProviderDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  return <ProviderDetailsScreen providerId={id} />;
}
