import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/core/theme';
import { Icon, IconName } from '../Icon';

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}

export function StatusBadge({
  label,
  variant = 'neutral',
  icon,
  style,
}: StatusBadgeProps) {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: theme.colors.semantic.successContainer,
          text: theme.colors.semantic.success,
        };
      case 'warning':
        return {
          bg: theme.colors.semantic.warningContainer,
          text: theme.colors.semantic.warning,
        };
      case 'error':
        return {
          bg: theme.colors.semantic.errorContainer,
          text: theme.colors.semantic.error,
        };
      case 'info':
        return {
          bg: theme.colors.semantic.infoContainer,
          text: theme.colors.semantic.info,
        };
      case 'neutral':
      default:
        return {
          bg: theme.colors.surface.subdued,
          text: theme.colors.text.secondary,
        };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }, style]}>
      {icon && (
        <Icon
          name={icon}
          size={12}
          color={colors.text}
          style={styles.icon}
        />
      )}
      <Text style={[theme.typography.label, { color: colors.text }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 24,
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: theme.spacing[1],
  },
});
