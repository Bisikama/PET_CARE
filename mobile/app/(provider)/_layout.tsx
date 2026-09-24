import { Stack } from 'expo-router';

export default function ProviderLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="pending-approval" options={{ headerShown: false }} />
    </Stack>
  );
}
