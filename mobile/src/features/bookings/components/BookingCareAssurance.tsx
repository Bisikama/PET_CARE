import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { theme } from '@/core/theme';

export function BookingCareAssurance() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ShieldCheck
          size={20}
          color={theme.colors.primary.navy}
          style={styles.icon}
        />
        <Text style={styles.text}>
          Each appointment is custom-matched with our certified handlers according
          to your pet's size, temperament, and medical profile.
        </Text>
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
    alignItems: 'flex-start',
    gap: theme.spacing[3],
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[4],
  },
  icon: {
    marginTop: 2,
    flexShrink: 0,
  },
  text: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    flex: 1,
  },
});
