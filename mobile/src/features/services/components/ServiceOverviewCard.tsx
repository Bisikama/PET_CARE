import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Store, CheckCircle2, PawPrint } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface ServiceOverviewCardProps {
  categoryTag: string;
  completedCount: number;
  title: string;
  providerName: string;
  isVerified: boolean;
  overviewDescription: string;
}

export function ServiceOverviewCard({
  categoryTag,
  completedCount,
  title,
  providerName,
  isVerified,
  overviewDescription,
}: ServiceOverviewCardProps) {
  return (
    <View style={styles.container}>
      {/* Badges row */}
      <View style={styles.badgeRow}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{categoryTag}</Text>
        </View>

        <View style={styles.completedPill}>
          <PawPrint size={13} color={theme.colors.tertiary.onContainer} />
          <Text style={styles.completedText}>
            {completedCount.toLocaleString('vi-VN')}+ completed
          </Text>
        </View>
      </View>

      {/* Service Title */}
      <Text style={styles.serviceTitle}>{title}</Text>

      {/* Provider Row */}
      <View style={styles.providerRow}>
        <View style={styles.storeIconWrapper}>
          <Store size={15} color={theme.colors.primary.navy} />
        </View>
        <Text style={styles.providerName}>{providerName}</Text>
        {isVerified && (
          <CheckCircle2
            size={16}
            color={theme.colors.tertiary.onContainer}
            fill={theme.colors.surface.lowest}
          />
        )}
      </View>

      {/* Overview Card */}
      <View style={styles.overviewBox}>
        <Text style={styles.overviewTitle}>Service Overview</Text>
        <Text style={styles.overviewDescription}>{overviewDescription}</Text>
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  categoryPill: {
    backgroundColor: theme.colors.surface.containerHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  categoryPillText: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.primary.navy,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    ...theme.typography.label,
    fontSize: 12,
    color: theme.colors.tertiary.onContainer,
    fontWeight: '600',
  },
  serviceTitle: {
    ...theme.typography.h2,
    color: theme.colors.primary.navy,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  storeIconWrapper: {
    width: 26,
    height: 26,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerName: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  overviewBox: {
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[4],
    gap: theme.spacing[2],
    marginTop: theme.spacing[1],
  },
  overviewTitle: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  overviewDescription: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
});
