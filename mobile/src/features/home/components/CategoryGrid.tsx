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
  services?: ServiceCategory[];
  onSelectCategory?: (categoryId: string) => void;
  onSeeAll?: () => void;
}

const defaultIcons: Record<string, any> = {
  grooming: Scissors,
  bathing: Bath,
  sitting: HomeIcon,
  walking: Footprints,
  training: Award,
  veterinary: Stethoscope,
  hotel: Hotel,
};

export function CategoryGrid({ services = [], onSelectCategory, onSeeAll }: CategoryGridProps) {
  // Take up to 7 services, then add 'More'
  const displayCategories = services.slice(0, 7).map(s => {
    // Map based on category enum from backend
    let iconKey = 'grooming';
    const categoryUpper = s.category?.toUpperCase() || '';
    if (categoryUpper === 'WALKING') iconKey = 'walking';
    else if (categoryUpper === 'SITTING') iconKey = 'sitting';
    else if (categoryUpper === 'GROOMING') iconKey = 'grooming';
    else if (categoryUpper === 'VET') iconKey = 'veterinary';
    else {
      // Fallback heuristics based on name if category is null/unknown
      const nameLower = s.name.toLowerCase();
      if (nameLower.includes('bath') || nameLower.includes('tắm')) iconKey = 'bathing';
      else if (nameLower.includes('sit') || nameLower.includes('giữ')) iconKey = 'sitting';
      else if (nameLower.includes('walk') || nameLower.includes('dạo')) iconKey = 'walking';
      else if (nameLower.includes('train')) iconKey = 'training';
      else if (nameLower.includes('vet') || nameLower.includes('thú y')) iconKey = 'veterinary';
      else if (nameLower.includes('hotel') || nameLower.includes('board')) iconKey = 'hotel';
    }

    return {
      id: s.id,
      name: s.name,
      iconName: iconKey,
      hasAccent: true,
      IconComponent: defaultIcons[iconKey] || Scissors,
    };
  });

  if (services.length > 7) {
    displayCategories.push({
      id: 'more',
      name: 'More',
      iconName: 'grid',
      hasAccent: false,
      IconComponent: LayoutGrid,
    });
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Services</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Grid of items */}
      <View style={styles.grid}>
        {displayCategories.length === 0 ? (
          <Text style={{ color: theme.colors.text.secondary }}>No services available.</Text>
        ) : (
          displayCategories.map((cat) => {
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
          })
        )}
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
