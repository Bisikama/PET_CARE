import React from 'react';
import { Redirect } from 'expo-router';

export default function RootIndexRoute() {
  return <Redirect href="/(customer)/(tabs)/home" />;
}
