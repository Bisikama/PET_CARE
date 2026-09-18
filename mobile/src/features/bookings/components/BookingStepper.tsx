import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PawPrint } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface BookingStepperProps {
  currentStep?: number;
  totalSteps?: number;
  stepName?: string;
  title?: string;
  subtitle?: string;
}

export function BookingStepper({
  currentStep = 1,
  totalSteps = 4,
  stepName = 'Pet Selection',
  title = 'Who is this booking for?',
  subtitle = 'Choose the pet receiving the care service.',
}: BookingStepperProps) {
  const steps = [
    { number: 1, label: '1. Pet' },
    { number: 2, label: '2. Time' },
    { number: 3, label: '3. Details' },
    { number: 4, label: '4. Pay' },
  ];

  return (
    <View style={styles.container}>
      {/* Step Info Row */}
      <View style={styles.stepInfoRow}>
        <Text style={styles.stepCountText}>
          STEP {currentStep} OF {totalSteps}
        </Text>
        <View style={styles.stepBadge}>
          <PawPrint size={13} color={theme.colors.secondary.onContainer} />
          <Text style={styles.stepBadgeText}>{stepName}</Text>
        </View>
      </View>

      {/* Progress Bars (4 columns) */}
      <View style={styles.progressBarRow}>
        {[1, 2, 3, 4].map((stepNum) => {
          const isCompletedOrActive = stepNum <= currentStep;
          return (
            <View
              key={stepNum}
              style={[
                styles.barSegment,
                isCompletedOrActive
                  ? styles.barActive
                  : styles.barInactive,
              ]}
            />
          );
        })}
      </View>

      {/* Step Breadcrumbs Labels */}
      <View style={styles.labelsRow}>
        {steps.map((step) => {
          const isActive = step.number === currentStep;
          return (
            <Text
              key={step.number}
              style={[
                styles.stepLabelText,
                isActive ? styles.stepLabelActive : styles.stepLabelInactive,
              ]}
            >
              {step.label}
            </Text>
          );
        })}
      </View>

      {/* Title & Subtitle */}
      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>{title}</Text>
        <Text style={styles.screenSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    gap: theme.spacing[2],
  },
  stepInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCountText: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepBadgeText: {
    ...theme.typography.label,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.secondary.onContainer,
  },
  progressBarRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    paddingTop: 4,
  },
  barSegment: {
    flex: 1,
    height: 6,
    borderRadius: theme.radius.full,
  },
  barActive: {
    backgroundColor: theme.colors.secondary.container,
  },
  barInactive: {
    backgroundColor: theme.colors.surface.containerHigh,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  stepLabelText: {
    ...theme.typography.label,
    fontSize: 11,
    flex: 1,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: theme.colors.primary.navy,
    fontWeight: '700',
  },
  stepLabelInactive: {
    color: theme.colors.text.muted,
    fontWeight: '500',
  },
  titleSection: {
    paddingTop: theme.spacing[2],
    gap: 3,
  },
  screenTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
  },
});
