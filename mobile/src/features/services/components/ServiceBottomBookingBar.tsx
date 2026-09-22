import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/core/theme';

interface ServiceBottomBookingBarProps {
  totalPrice: number;
  onBook: () => void;
  buttonText?: string;
}

export function ServiceBottomBookingBar({
  totalPrice,
  onBook,
  buttonText = 'Book This Service',
}: ServiceBottomBookingBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 14) },
      ]}
    >
      <View style={styles.priceCol}>
        <Text style={styles.priceLabel}>Total Estimated</Text>
        <Text style={styles.priceValue}>
          {totalPrice.toLocaleString('vi-VN')}₫
        </Text>
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        activeOpacity={0.88}
        onPress={onBook}
      >
        <Text style={styles.bookButtonText}>{buttonText}</Text>
        <ArrowRight
          size={18}
          color={theme.colors.secondary.onContainer}
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
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    backgroundColor: theme.colors.surface.lowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subdued,
    ...theme.shadows.lg,
    zIndex: 40,
  },
  priceCol: {
    flex: 1,
    paddingRight: theme.spacing[3],
  },
  priceLabel: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  priceValue: {
    ...theme.typography.h3,
    color: theme.colors.primary.navy,
    fontWeight: '800',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    backgroundColor: theme.colors.secondary.container,
    paddingHorizontal: theme.spacing[5],
    height: 48,
    borderRadius: theme.radius.xl,
    ...theme.shadows.sm,
  },
  bookButtonText: {
    ...theme.typography.label,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.secondary.onContainer,
  },
});
