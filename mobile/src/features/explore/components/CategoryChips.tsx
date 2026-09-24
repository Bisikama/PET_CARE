import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  LayoutGrid,
  Scissors,
  Footprints,
  Home,
  Award,
  Stethoscope,
  Hotel,
} from 'lucide-react-native';
import { theme } from '@/core/theme';
import { ExploreCategory } from '../types/explore.types';

export const exploreCategories: (ExploreCategory & { IconComponent: any })[] = [
  { id: 'all', name: 'All', iconName: 'apps', IconComponent: LayoutGrid },
  { id: 'grooming', name: 'Grooming', iconName: 'scissors', IconComponent: Scissors },
  { id: 'walking', name: 'Walking', iconName: 'footprints', IconComponent: Footprints },
  { id: 'sitting', name: 'Sitting', iconName: 'home', IconComponent: Home },
  { id: 'training', name: 'Training', iconName: 'award', IconComponent: Award },
  { id: 'veterinary', name: 'Veterinary', iconName: 'stethoscope', IconComponent: Stethoscope },
  { id: 'hotel', name: 'Pet Hotel', iconName: 'hotel', IconComponent: Hotel },
];

interface CategoryChipsProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryChips({
  selectedCategory,
  onSelectCategory,
}: CategoryChipsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {exploreCategories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
          const Icon = cat.IconComponent;

          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
              activeOpacity={0.8}
              onPress={() => onSelectCategory(cat.id)}
            >
              <Icon
                size={16}
                color={
                  isSelected
                    ? theme.colors.text.inverse
                    : theme.colors.secondary.dim
                }
              />
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing[2],
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[5],
    gap: theme.spacing[2],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary.navy,
    borderColor: theme.colors.primary.navy,
    ...theme.shadows.sm,
  },
  chipUnselected: {
    backgroundColor: theme.colors.surface.lowest,
    borderColor: theme.colors.border.default,
  },
  chipText: {
    ...theme.typography.label,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: theme.colors.text.inverse,
  },
  chipTextUnselected: {
    color: theme.colors.text.secondary,
  },
});
