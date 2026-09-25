import React from 'react';
import { Redirect } from 'expo-router';

export default function ProviderIndexRoute() {
  return <Redirect href={'/(provider)/(tabs)/jobs' as any} />;
}
