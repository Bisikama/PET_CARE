import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { theme } from '@/core/theme';

export function BookingSafetyBanner() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <ShieldCheck size={18} color={theme.colors.secondary.onContainer} />
        </View>

        <Text style={styles.text}>
          <Text style={styles.boldText}>PawCare Certified: </Text>
          All providers undergo background checks, tool sanitation audits & hands-on pet safety verification.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[2],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    backgroundColor: theme.colors.surface.container,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[3] + 2,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondary.container,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
    ...theme.typography.bodySm,
    fontSize: 11.5,
    color: theme.colors.primary.navy,
    flex: 1,
    lineHeight: 17,
  },
  boldText: {
    fontWeight: '700',
  },
});
