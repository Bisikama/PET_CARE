import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/core/theme';
import { Icon, IconName } from '../Icon';

export interface FilterChipProps {
  label: string;
  selected?: boolean;
  icon?: IconName;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function FilterChip({
  label,
  selected = false,
  icon,
  onPress,
  style,
}: FilterChipProps) {
  const getContainerStyle = () => {
    if (selected) {
      return {
        backgroundColor: theme.colors.primary.container,
        borderColor: theme.colors.primary.default,
      };
    }
    return {
      backgroundColor: theme.colors.surface.default,
      borderColor: theme.colors.border.default,
    };
  };

  const getTextColor = () => {
    return selected ? theme.colors.primary.active : theme.colors.text.primary;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, getContainerStyle(), style]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {icon && (
        <Icon
          name={icon}
          size={16}
          color={getTextColor()}
          style={styles.icon}
        />
      )}
      <Text style={[theme.typography.bodyMdMedium, { color: getTextColor() }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 32,
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: theme.spacing[1],
  },
});
