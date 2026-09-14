import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/core/theme';

export interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Loading({
  size = 'large',
  color = theme.colors.primary.default,
  fullScreen = false,
  style,
}: LoadingProps) {
  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        style,
      ]}
    >
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[4],
  },
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
});
