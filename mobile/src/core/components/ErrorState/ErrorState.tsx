import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/core/theme';
import { Button } from '../Button';
import { Icon } from '../Icon';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error while trying to load this content. Please try again.',
  onRetry,
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Icon name="alert-triangle" size={32} color={theme.colors.semantic.error} />
      </View>
      
      <Text style={[theme.typography.h3, styles.title]}>{title}</Text>
      
      <Text style={[theme.typography.bodyMd, styles.description]}>
        {description}
      </Text>
      
      {onRetry && (
        <Button
          label="Try Again"
          variant="outline"
          onPress={onRetry}
          style={styles.actionButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[6],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.semantic.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[4],
  },
  title: {
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  description: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
  },
  actionButton: {
    minWidth: 160,
  },
});
