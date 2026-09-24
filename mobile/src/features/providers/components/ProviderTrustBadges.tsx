import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ShieldCheck, BadgeCheck, HeartPulse, Shield } from 'lucide-react-native';
import { theme } from '@/core/theme';

export function ProviderTrustBadges() {
  const badges = [
    {
      id: 'verified_safe',
      label: 'Verified Safe',
      Icon: ShieldCheck,
      isPrimary: true,
    },
    {
      id: 'gov_id',
      label: 'Gov ID & Facial Match',
      Icon: BadgeCheck,
      isPrimary: false,
    },
    {
      id: 'first_aid',
      label: 'Pet First Aid Certified',
      Icon: HeartPulse,
      isPrimary: false,
    },
    {
      id: 'background_check',
      label: 'Background Checked 2026',
      Icon: Shield,
      isPrimary: false,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {badges.map((b) => {
          const Icon = b.Icon;

          return (
            <View
              key={b.id}
              style={[
                styles.badgePill,
                b.isPrimary ? styles.pillPrimary : styles.pillSecondary,
              ]}
            >
              <Icon
                size={14}
                color={
                  b.isPrimary
                    ? theme.colors.tertiary.onContainer
                    : theme.colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.badgeText,
                  b.isPrimary ? styles.textPrimary : styles.textSecondary,
                ]}
              >
                {b.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing[2] + 2,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[5],
    gap: theme.spacing[2],
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
  },
  pillPrimary: {
    backgroundColor: theme.colors.surface.container,
  },
  pillSecondary: {
    backgroundColor: theme.colors.surface.subdued,
  },
  badgeText: {
    ...theme.typography.label,
    fontSize: 11,
  },
  textPrimary: {
    color: theme.colors.primary.navy,
    fontWeight: '700',
  },
  textSecondary: {
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
});
