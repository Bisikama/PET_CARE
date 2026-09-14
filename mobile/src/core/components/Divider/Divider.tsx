import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/core/theme';

export interface DividerProps {
  style?: StyleProp<ViewStyle>;
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  marginVertical?: number;
  marginHorizontal?: number;
}

export function Divider({
  style,
  orientation = 'horizontal',
  thickness = 1,
  color = theme.colors.border.default,
  marginVertical = 0,
  marginHorizontal = 0,
}: DividerProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <View
      style={[
        {
          backgroundColor: color,
          ...(isHorizontal
            ? { height: thickness, width: '100%', marginVertical }
            : { width: thickness, height: '100%', marginHorizontal }),
        },
        style,
      ]}
    />
  );
}
