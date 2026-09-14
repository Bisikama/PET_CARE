import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { theme } from '@/core/theme';
import { Button } from '../Button';

export interface ModalProps {
  visible: boolean;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  primaryAction?: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'danger';
    isLoading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  onDismiss?: () => void;
  dismissable?: boolean;
}

export function Modal({
  visible,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  onDismiss,
  dismissable = true,
}: ModalProps) {
  const handleBackdropPress = () => {
    if (dismissable && onDismiss) {
      onDismiss();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleBackdropPress}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleBackdropPress}
          accessible={false}
        />
        
        <View style={styles.content}>
          {title && (
            <Text style={[theme.typography.h3, styles.title]}>{title}</Text>
          )}
          {description && (
            <Text style={[theme.typography.bodyMd, styles.description]}>
              {description}
            </Text>
          )}
          
          {children}

          {(primaryAction || secondaryAction) && (
            <View style={styles.footer}>
              {secondaryAction && (
                <Button
                  label={secondaryAction.label}
                  variant="ghost"
                  onPress={secondaryAction.onPress}
                  style={styles.actionButton}
                />
              )}
              {primaryAction && (
                <Button
                  label={primaryAction.label}
                  variant={primaryAction.variant || 'primary'}
                  isLoading={primaryAction.isLoading}
                  onPress={primaryAction.onPress}
                  style={styles.actionButton}
                />
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 22, 19, 0.4)', // dark overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[4],
  },
  content: {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[6],
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.lg,
  },
  title: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  description: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[6],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing[6],
    gap: theme.spacing[3],
  },
  actionButton: {
    minWidth: 100,
  },
});
