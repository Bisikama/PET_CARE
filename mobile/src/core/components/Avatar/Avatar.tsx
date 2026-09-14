import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/core/theme';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarShape = 'circle' | 'square';

export interface AvatarProps {
  source?: { uri: string } | number; // React Native Image source
  initials?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  style?: StyleProp<any>;
}

export function Avatar({
  source,
  initials,
  size = 'md',
  shape = 'circle',
  style,
}: AvatarProps) {
  const dimension = theme.dimensions.avatar[size];
  const borderRadius = shape === 'circle' ? dimension / 2 : theme.radius.sm;

  const containerStyle = {
    width: dimension,
    height: dimension,
    borderRadius,
  };

  if (source) {
    return (
      <Image
        source={typeof source === 'string' ? { uri: source } : source}
        style={[styles.container, containerStyle, style]}
        accessibilityRole="image"
      />
    );
  }

  return (
    <View style={[styles.container, styles.placeholder, containerStyle, style]}>
      <Text
        style={[
          theme.typography.button,
          { color: theme.colors.primary.default },
        ]}
      >
        {initials ? initials.substring(0, 2).toUpperCase() : '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  placeholder: {
    backgroundColor: theme.colors.primary.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
