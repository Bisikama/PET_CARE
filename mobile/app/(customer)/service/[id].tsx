import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ServiceDetailsScreen from '../../../src/features/services/screens/ServiceDetailsScreen';

export default function ServiceDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  return <ServiceDetailsScreen serviceId={id} />;
}
