import React, { forwardRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '@/core/theme';
import { Icon, IconName } from '../Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  label?: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  isFullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button = forwardRef<any, ButtonProps>(
  (
    {
      label,
      variant = 'primary',
      isLoading = false,
      leftIcon,
      rightIcon,
      isFullWidth = false,
      disabled,
      style,
      textStyle,
      onPress,
      ...props
    },
    ref
  ) => {
    const getContainerStyles = (): ViewStyle => {
      let variantStyles: ViewStyle = {};
      switch (variant) {
        case 'primary':
          variantStyles = {
            backgroundColor: disabled ? theme.colors.surface.subdued : theme.colors.primary.default,
            borderColor: 'transparent',
            borderWidth: 0,
            ...(!disabled && theme.shadows.sm),
          };
          break;
        case 'secondary':
          variantStyles = {
            backgroundColor: disabled ? theme.colors.surface.subdued : theme.colors.secondary.default,
            borderColor: 'transparent',
            borderWidth: 0,
          };
          break;
        case 'outline':
          variantStyles = {
            backgroundColor: 'transparent',
            borderColor: disabled ? theme.colors.border.subdued : theme.colors.border.default,
            borderWidth: 1.5,
          };
          break;
        case 'danger':
          variantStyles = {
            backgroundColor: disabled ? theme.colors.surface.subdued : theme.colors.semantic.error,
            borderColor: 'transparent',
            borderWidth: 0,
          };
          break;
        case 'ghost':
          variantStyles = {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderWidth: 0,
          };
          break;
      }

      return {
        ...variantStyles,
        width: isFullWidth ? '100%' : undefined,
      };
    };

    const getTextColor = (): string => {
      if (disabled) return theme.colors.text.muted;
      switch (variant) {
        case 'primary':
        case 'secondary':
        case 'danger':
          return '#FFF';
        case 'outline':
        case 'ghost':
          return theme.colors.text.primary;
        default:
          return theme.colors.text.primary;
      }
    };

    const textColor = getTextColor();
    const isInteractive = !disabled && !isLoading;

    const handlePress = (e: any) => {
      if (isInteractive && onPress) {
        onPress(e);
      }
    };

    return (
      <TouchableOpacity
        ref={ref}
        activeOpacity={0.7}
        disabled={!isInteractive}
        onPress={handlePress}
        style={[styles.container, getContainerStyles(), style]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !isInteractive, busy: isLoading }}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            {leftIcon && (
              <Icon name={leftIcon} size={theme.dimensions.icon.md} color={textColor} style={styles.leftIcon} />
            )}
            {label && (
              <Text style={[theme.typography.button, { color: textColor }, textStyle]}>
                {label}
              </Text>
            )}
            {rightIcon && (
              <Icon name={rightIcon} size={theme.dimensions.icon.md} color={textColor} style={styles.rightIcon} />
            )}
          </>
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  container: {
    height: theme.dimensions.buttonHeight,
    borderRadius: theme.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[6],
  },
  leftIcon: {
    marginRight: theme.spacing[2],
  },
  rightIcon: {
    marginLeft: theme.spacing[2],
  },
});
