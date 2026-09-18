import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Bath,
  Wind,
  Scissors,
  Sparkles,
  HeartPulse,
  Brush,
} from 'lucide-react-native';
import { theme } from '@/core/theme';
import { ServiceIncludedItem } from '../types/service.types';

const defaultIncludedIcons: Record<string, any> = {
  bath: Bath,
  blow_dry: Wind,
  hair_trim: Scissors,
  nail_trim: Scissors,
  ear_clean: HeartPulse,
  brush: Brush,
};

interface ServiceIncludedGridProps {
  items: ServiceIncludedItem[];
}

export function ServiceIncludedGrid({ items }: ServiceIncludedGridProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>What's Included</Text>

      <View style={styles.grid}>
        {items.map((item) => {
          const Icon = defaultIncludedIcons[item.iconName] || Sparkles;

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.iconCircle}>
                <Icon size={18} color={theme.colors.primary.navy} />
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
          );
        })}
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
  sectionTitle: {
    ...theme.typography.h4,
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  card: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    backgroundColor: theme.colors.surface.lowest,
    padding: theme.spacing[3],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.containerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
});
