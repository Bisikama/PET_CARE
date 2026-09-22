import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface ProviderAboutSectionProps {
  providerName: string;
  aboutBio: string;
  tags: string[];
}

export function ProviderAboutSection({
  providerName,
  aboutBio,
  tags,
}: ProviderAboutSectionProps) {
  const firstName = providerName.split(' ')[0] || providerName;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Heart size={15} color={theme.colors.secondary.onContainer} />
          </View>
          <Text style={styles.title}>About {firstName}</Text>
        </View>

        <Text style={styles.bioText}>{aboutBio}</Text>

        <View style={styles.tagsRow}>
          {tags.map((tag, idx) => (
            <View key={idx} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
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
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  bioText: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: theme.colors.surface.subdued,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
  },
  tagText: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
});
