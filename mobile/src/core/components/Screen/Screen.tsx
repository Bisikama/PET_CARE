import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { theme } from '@/core/theme';

export interface ScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  withPadding?: boolean;
  backgroundColor?: string;
  preset?: 'fixed' | 'scroll';
}

export function Screen({
  children,
  style,
  contentContainerStyle,
  edges = ['top', 'left', 'right'],
  withPadding = true,
  backgroundColor = theme.colors.background.default,
  preset = 'fixed',
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const safeAreaStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  const content = (
    <View
      style={[
        preset === 'fixed' && styles.content,
        safeAreaStyle,
        withPadding && styles.withPadding,
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {preset === 'scroll' ? (
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView 
            style={styles.container}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {content}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        content
      )}
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
