import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Scissors } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface BookingServiceContextCardProps {
  serviceTitle?: string;
  providerName?: string;
  price?: number;
}

export function BookingServiceContextCard({
  serviceTitle = 'Premium Dog Grooming',
  providerName = 'Happy Paws Care Studio',
  price = 250000,
}: BookingServiceContextCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.leftGroup}>
          <View style={styles.iconCircle}>
            <Scissors size={20} color={theme.colors.primary.navy} />
          </View>

          <View style={styles.textCol}>
            <Text style={styles.badgeLabel}>SELECTED SERVICE</Text>
            <Text style={styles.serviceTitle} numberOfLines={1}>
              {serviceTitle}
            </Text>
            <Text style={styles.providerName} numberOfLines={1}>
              {providerName}
            </Text>
          </View>
        </View>

        <View style={styles.priceCol}>
          <Text style={styles.fromLabel}>From</Text>
          <Text style={styles.priceText}>
            {price.toLocaleString('vi-VN')}₫
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    flex: 1,
    paddingRight: theme.spacing[2],
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  badgeLabel: {
    ...theme.typography.label,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.secondary.onContainer,
    letterSpacing: 0.5,
  },
  serviceTitle: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: 1,
  },
  providerName: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  fromLabel: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
  priceText: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
});
