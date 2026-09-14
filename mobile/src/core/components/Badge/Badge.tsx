import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/core/theme';

export interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function Badge({
  label,
  color = theme.colors.text.primary,
  backgroundColor = theme.colors.surface.subdued,
  style,
}: BadgeProps) {
  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <Text style={[theme.typography.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 24,
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
