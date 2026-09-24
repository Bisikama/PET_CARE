import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/core/theme';
import { Icon, IconName } from '../Icon';
import { StatusVariant } from '../StatusBadge';

export interface ToastProps {
  visible: boolean;
  message: string;
  variant?: StatusVariant;
  icon?: IconName;
  duration?: number;
  onHide?: () => void;
}

export function Toast({
  visible,
  message,
  variant = 'neutral',
  icon,
  duration = 3000,
  onHide,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible) return null;

  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: theme.colors.semantic.success, text: '#FFF' };
      case 'error':
        return { bg: theme.colors.semantic.error, text: '#FFF' };
      case 'warning':
        return { bg: theme.colors.semantic.warning, text: '#FFF' };
      case 'info':
        return { bg: theme.colors.semantic.info, text: '#FFF' };
      case 'neutral':
      default:
        return { bg: theme.colors.text.primary, text: '#FFF' };
    }
  };

  const colors = getColors();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + theme.spacing[4],
          opacity,
          transform: [{ translateY }],
          backgroundColor: colors.bg,
        },
      ]}
      pointerEvents="none"
    >
      {icon && (
        <Icon name={icon} size={16} color={colors.text} style={styles.icon} />
      )}
      <Text style={[theme.typography.bodyMdMedium, { color: colors.text }]}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: theme.spacing[4],
    right: theme.spacing[4],
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.lg,
    zIndex: 1000,
  },
  icon: {
    marginRight: theme.spacing[2],
  },
});
