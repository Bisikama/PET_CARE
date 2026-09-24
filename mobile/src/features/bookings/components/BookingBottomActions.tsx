import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/core/theme';

interface BookingBottomActionsProps {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  disabled?: boolean;
}

export function BookingBottomActions({
  onBack,
  onNext,
  nextLabel = 'Continue to Date & Time',
  disabled = false,
}: BookingBottomActionsProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 14) },
      ]}
    >
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.8}
        onPress={onBack}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ArrowLeft size={20} color={theme.colors.primary.navy} />
      </TouchableOpacity>

      {/* Next CTA button */}
      <TouchableOpacity
        style={[
          styles.nextButton,
          disabled && styles.nextButtonDisabled,
        ]}
        activeOpacity={0.88}
        onPress={onNext}
        disabled={disabled}
      >
        <Text
          style={[
            styles.nextButtonText,
            disabled && styles.nextButtonTextDisabled,
          ]}
        >
          {nextLabel}
        </Text>
        <ArrowRight
          size={18}
          color={
            disabled
              ? theme.colors.text.muted
              : theme.colors.secondary.onContainer
          }
          strokeWidth={2.5}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    backgroundColor: theme.colors.surface.lowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subdued,
    ...theme.shadows.lg,
    zIndex: 40,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    backgroundColor: theme.colors.secondary.container,
    borderRadius: theme.radius.lg,
    ...theme.shadows.sm,
  },
  nextButtonDisabled: {
    backgroundColor: theme.colors.surface.containerHigh,
  },
  nextButtonText: {
    ...theme.typography.label,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.secondary.onContainer,
  },
  nextButtonTextDisabled: {
    color: theme.colors.text.muted,
  },
});
