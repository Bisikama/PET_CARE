import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Scissors,
  Bath,
  Home as HomeIcon,
  Footprints,
  Award,
  Stethoscope,
  Hotel,
  LayoutGrid,
} from 'lucide-react-native';
import { theme } from '@/core/theme';
import { ServiceCategory } from '../types/home.types';

interface CategoryGridProps {
  onSelectCategory?: (categoryId: string) => void;
  onSeeAll?: () => void;
}

const categories: (ServiceCategory & { IconComponent: any })[] = [
  { id: 'grooming', name: 'Grooming', iconName: 'scissors', hasAccent: true, IconComponent: Scissors },
  { id: 'bathing', name: 'Bathing', iconName: 'bath', hasAccent: true, IconComponent: Bath },
  { id: 'sitting', name: 'Pet Sitting', iconName: 'home', hasAccent: true, IconComponent: HomeIcon },
  { id: 'walking', name: 'Dog Walking', iconName: 'footprints', hasAccent: true, IconComponent: Footprints },
  { id: 'training', name: 'Training', iconName: 'award', hasAccent: true, IconComponent: Award },
  { id: 'veterinary', name: 'Veterinary', iconName: 'stethoscope', hasAccent: true, IconComponent: Stethoscope },
  { id: 'hotel', name: 'Pet Hotel', iconName: 'hotel', hasAccent: true, IconComponent: Hotel },
  { id: 'more', name: 'More', iconName: 'grid', hasAccent: false, IconComponent: LayoutGrid },
];

export function CategoryGrid({ onSelectCategory, onSeeAll }: CategoryGridProps) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Services</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Grid of 8 items (4 columns x 2 rows) */}
      <View style={styles.grid}>
        {categories.map((cat) => {
          const Icon = cat.IconComponent;
          const isMore = cat.id === 'more';

          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.card}
              activeOpacity={0.75}
              onPress={() => (isMore ? onSeeAll?.() : onSelectCategory?.(cat.id))}
            >
              <View
                style={[
                  styles.iconWrapper,
                  isMore && { backgroundColor: theme.colors.surface.container },
                ]}
              >
                <Icon
                  size={24}
                  color={isMore ? theme.colors.text.secondary : theme.colors.primary.navy}
                />
                {cat.hasAccent && <View style={styles.accentDot} />}
              </View>
              <Text
                style={[
                  styles.categoryName,
                  isMore && { color: theme.colors.text.secondary },
                ]}
                numberOfLines={1}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[5],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  seeAllText: {
    ...theme.typography.bodySm,
    color: theme.colors.secondary.container,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    justifyContent: 'space-between',
  },
  card: {
    width: '22.5%',
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
    paddingHorizontal: 4,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.lowest,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    ...theme.shadows.sm,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.subdued,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: theme.spacing[1],
  },
  accentDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.secondary.container,
  },
  categoryName: {
    ...theme.typography.label,
    color: theme.colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 2,
  },
});
