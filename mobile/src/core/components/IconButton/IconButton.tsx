import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TouchableOpacityProps,
  ActivityIndicator,
} from 'react-native';
import { theme } from '@/core/theme';
import { Icon, IconName } from '../Icon';

export interface IconButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  icon: IconName;
  size?: number;
  color?: string;
  variant?: 'ghost' | 'surface' | 'primary' | 'fab';
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon,
  size = theme.dimensions.icon.md,
  color,
  variant = 'ghost',
  isLoading = false,
  disabled,
  style,
  onPress,
  ...props
}: IconButtonProps) {
  const getContainerStyles = (): ViewStyle => {
    switch (variant) {
      case 'surface':
        return {
          backgroundColor: theme.colors.surface.default,
          borderColor: theme.colors.border.default,
          borderWidth: 1,
        };
      case 'primary':
        return {
          backgroundColor: disabled ? theme.colors.surface.subdued : theme.colors.primary.default,
        };
      case 'fab':
        return {
          backgroundColor: disabled ? theme.colors.surface.subdued : theme.colors.primary.default,
          width: 56,
          height: 56,
          borderRadius: 28,
          ...theme.shadows.lg,
        };
      case 'ghost':
      default:
        return {
          backgroundColor: 'transparent',
        };
    }
  };

  const getIconColor = (): string => {
    if (disabled) return theme.colors.text.muted;
    if (color) return color;
    switch (variant) {
      case 'primary':
      case 'fab':
        return '#FFF';
      case 'surface':
      case 'ghost':
      default:
        return theme.colors.text.primary;
    }
  };

  const containerSize = variant === 'fab' ? 56 : Math.max(theme.dimensions.minTouchTarget, size + 16);
  const isInteractive = !disabled && !isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!isInteractive}
      onPress={isInteractive ? onPress : undefined}
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
        },
        getContainerStyles(),
        style,
      ]}
      accessibilityRole="button"
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getIconColor()} size="small" />
      ) : (
        <Icon name={icon} size={size} color={getIconColor()} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
