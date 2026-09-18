import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/core/theme';

interface ProviderMetricsGridProps {
  yearsExperience?: number;
  completedJobs?: number;
  repeatRate?: number;
  avgReplyMinutes?: number;
}

export function ProviderMetricsGrid({
  yearsExperience = 5,
  completedJobs = 142,
  repeatRate = 100,
  avgReplyMinutes = 12,
}: ProviderMetricsGridProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Metric 1 */}
        <View style={styles.metricCol}>
          <Text style={[styles.metricValue, { color: theme.colors.primary.navy }]}>
            {yearsExperience}+
          </Text>
          <Text style={styles.metricLabel}>Years Exp</Text>
        </View>

        {/* Metric 2 */}
        <View style={styles.metricCol}>
          <Text style={styles.metricValue}>{completedJobs}</Text>
          <Text style={styles.metricLabel}>Walks Done</Text>
        </View>

        {/* Metric 3 */}
        <View style={styles.metricCol}>
          <Text style={[styles.metricValue, { color: theme.colors.tertiary.onContainer }]}>
            {repeatRate}%
          </Text>
          <Text style={styles.metricLabel}>Repeat Rate</Text>
        </View>

        {/* Metric 4 */}
        <View style={styles.metricCol}>
          <Text style={styles.metricValue}>{avgReplyMinutes}m</Text>
          <Text style={styles.metricLabel}>Avg Reply</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[2],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing[3] + 2,
    ...theme.shadows.sm,
  },
  metricCol: {
    alignItems: 'center',
    gap: 2,
  },
  metricValue: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  metricLabel: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
});
