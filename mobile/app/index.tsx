import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootIndexRoute() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FF' }}>
      <ActivityIndicator size="large" color="#0B2A4A" />
    </View>
  );
}
