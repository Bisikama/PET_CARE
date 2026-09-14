import React from 'react';
import { Redirect } from 'expo-router';

export default function RootIndexRoute() {
  // TEMPORARY bootstrap route. 
  // Future implementation: verify auth and role state here, then redirect 
  // or conditionally render the appropriate navigator.
  return <Redirect href="/(customer)" />;
}
