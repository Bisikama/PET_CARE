import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { theme } from '@/core/theme';

export interface ScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  withPadding?: boolean;
  backgroundColor?: string;
}

export function Screen({
  children,
  style,
  contentContainerStyle,
  edges = ['top', 'left', 'right'],
  withPadding = true,
  backgroundColor = theme.colors.background.default,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const safeAreaStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <View
        style={[
          styles.content,
          safeAreaStyle,
          withPadding && styles.withPadding,
          contentContainerStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  withPadding: {
    paddingHorizontal: theme.spacing.screenPadding,
  },
});
