import React from 'react';
import { Stack } from 'expo-router';
import { BookingProvider } from '@/features/bookings/context/BookingContext';

export default function CustomerLayout() {
  return (
    <BookingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </BookingProvider>
  );
}
