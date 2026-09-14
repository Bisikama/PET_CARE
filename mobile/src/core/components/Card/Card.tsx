import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/core/theme';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'default' | 'featured';
}

export function Card({
  children,
  style,
  variant = 'default',
  padding = 'default',
}: CardProps) {
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'featured':
        return theme.spacing.cardPaddingFeatured;
      case 'default':
      default:
        return theme.spacing.cardPadding;
    }
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.colors.surface.default,
          borderColor: 'transparent',
          borderWidth: 0,
          ...theme.shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.border.default,
          borderWidth: 1,
          ...theme.shadows.none,
        };
      case 'default':
      default:
        return {
          backgroundColor: theme.colors.surface.default,
          borderColor: theme.colors.border.default,
          borderWidth: 1,
          ...theme.shadows.sm,
        };
    }
  };

  return (
    <View
      style={[
        styles.container,
        { padding: getPadding() },
        getVariantStyles(),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.lg,
  },
});
