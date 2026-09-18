import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dog, ShieldAlert, CalendarCheck } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface ServicePolicyCardProps {
  suitablePets: string;
  healthRequirements: string;
  cancellationPolicy: string;
}

export function ServicePolicyCard({
  suitablePets,
  healthRequirements,
  cancellationPolicy,
}: ServicePolicyCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Important Information</Text>

        <View style={styles.itemsList}>
          {/* Suitable Pets */}
          <View style={styles.policyRow}>
            <View style={styles.iconCircle}>
              <Dog size={18} color={theme.colors.primary.navy} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.label}>Suitable Pet Types</Text>
              <Text style={styles.value}>{suitablePets}</Text>
            </View>
          </View>

          {/* Health Requirements */}
          <View style={styles.policyRow}>
            <View style={styles.iconCircle}>
              <ShieldAlert size={18} color={theme.colors.primary.navy} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.label}>Health Requirements</Text>
              <Text style={styles.value}>{healthRequirements}</Text>
            </View>
          </View>

          {/* Cancellation Policy */}
          <View style={styles.policyRow}>
            <View style={styles.iconCircle}>
              <CalendarCheck size={18} color={theme.colors.primary.navy} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.label}>Cancellation Policy</Text>
              <Text style={styles.value}>{cancellationPolicy}</Text>
            </View>
          </View>
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
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  cardTitle: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  itemsList: {
    gap: theme.spacing[3],
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.containerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  textCol: {
    flex: 1,
  },
  label: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  value: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 18,
    marginTop: 2,
  },
});
