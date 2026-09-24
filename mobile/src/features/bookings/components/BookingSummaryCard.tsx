import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalendarCheck, Clock, Store, CheckCircle2 } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface BookingSummaryCardProps {
  dateSlotText: string;
  durationText?: string;
  providerName?: string;
  address?: string;
}

export function BookingSummaryCard({
  dateSlotText,
  durationText = '60–90 min',
  providerName = 'Happy Paws Care',
  address = '42 Tran Ngoc Dien, Thao Dien, D2, Ho Chi Minh City',
}: BookingSummaryCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Top Summary Row */}
        <View style={styles.topRow}>
          <View style={styles.iconCircle}>
            <CalendarCheck size={18} color={theme.colors.secondary.onContainer} />
          </View>

          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>RESERVATION SUMMARY</Text>
            <Text style={styles.summaryText}>{dateSlotText}</Text>
          </View>

          <View style={styles.durationPill}>
            <Clock size={12} color={theme.colors.primary.navy} />
            <Text style={styles.durationText}>{durationText}</Text>
          </View>
        </View>

        {/* Location / Salon info */}
        <View style={styles.locationBox}>
          <Store size={18} color={theme.colors.secondary.onContainer} style={styles.storeIcon} />
          <View style={styles.locationTextCol}>
            <Text style={styles.serviceMode} numberOfLines={1}>
              Salon Visit · {providerName}
            </Text>
            <Text style={styles.addressText} numberOfLines={1}>
              {address}
            </Text>
          </View>
        </View>
      </View>

      {/* Free Cancellation Note */}
      <View style={styles.reassuranceRow}>
        <CheckCircle2
          size={15}
          color={theme.colors.tertiary.onContainer}
          fill={theme.colors.surface.lowest}
        />
        <Text style={styles.reassuranceText}>
          Free cancellation up to 24 hours prior to appointment
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
    gap: theme.spacing[3],
  },
  card: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabel: {
    ...theme.typography.label,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.muted,
    letterSpacing: 0.5,
  },
  summaryText: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary.navy,
    marginTop: 1,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surface.container,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  durationText: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.primary.navy,
    fontWeight: '600',
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[3],
  },
  storeIcon: {
    flexShrink: 0,
  },
  locationTextCol: {
    flex: 1,
  },
  serviceMode: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  addressText: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
    marginTop: 1,
  },
  reassuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  reassuranceText: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
});
