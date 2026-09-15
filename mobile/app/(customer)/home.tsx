import React from 'react';
import { Redirect } from 'expo-router';

export default function CustomerHomeRedirect() {
  return <Redirect href="/(customer)/(tabs)/home" />;
}
