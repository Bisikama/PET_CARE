import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarPlus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/core/theme';

interface ProviderBottomCtaBarProps {
  price: number;
  timeUnit?: string;
  nextSlotText?: string;
  onBook: () => void;
}

export function ProviderBottomCtaBar({
  price = 250000,
  timeUnit = '/ 60-min session',
  nextSlotText = 'Today, 2:30 PM',
  onBook,
}: ProviderBottomCtaBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 14) },
      ]}
    >
      <View style={styles.priceCol}>
        <View style={styles.priceRow}>
          <Text style={styles.priceNumber}>
            {price.toLocaleString('vi-VN')}₫
          </Text>
          <Text style={styles.unitText}>{timeUnit}</Text>
        </View>

        <View style={styles.nextSlotRow}>
          <View style={styles.greenDot} />
          <Text style={styles.nextSlotText}>{nextSlotText}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.bookBtn}
        activeOpacity={0.88}
        onPress={onBook}
      >
        <CalendarPlus
          size={18}
          color={theme.colors.secondary.onContainer}
          strokeWidth={2.5}
        />
        <Text style={styles.bookBtnText}>Book Now</Text>
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
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  priceNumber: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  unitText: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
  nextSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.tertiary.onContainer,
  },
  nextSlotText: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.tertiary.onContainer,
    fontWeight: '700',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    backgroundColor: theme.colors.secondary.container,
    paddingHorizontal: theme.spacing[6],
    height: 48,
    borderRadius: theme.radius.xl,
    ...theme.shadows.sm,
  },
  bookBtnText: {
    ...theme.typography.label,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.secondary.onContainer,
  },
});
