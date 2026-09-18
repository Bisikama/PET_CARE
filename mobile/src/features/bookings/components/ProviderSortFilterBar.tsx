import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, CheckCircle2, Car } from 'lucide-react-native';
import { theme } from '@/core/theme';

export interface ProviderFilterOption {
  id: string;
  label: string;
  icon?: string;
}

const filterOptions: ProviderFilterOption[] = [
  { id: 'best_match', label: 'Best Match', icon: 'star' },
  { id: 'earliest', label: 'Earliest Available' },
  { id: 'highest_rated', label: 'Highest Rated' },
  { id: 'lowest_price', label: 'Lowest Price' },
  { id: 'verified_only', label: 'Verified Only', icon: 'verified' },
  { id: 'home_visit', label: 'Home Visit', icon: 'car' },
];

interface ProviderSortFilterBarProps {
  selectedFilterId: string;
  onSelectFilter: (filterId: string) => void;
}

export function ProviderSortFilterBar({
  selectedFilterId,
  onSelectFilter,
}: ProviderSortFilterBarProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filterOptions.map((opt) => {
          const isSelected = selectedFilterId === opt.id;

          return (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
              activeOpacity={0.8}
              onPress={() => onSelectFilter(opt.id)}
            >
              {opt.icon === 'star' && (
                <Star
                  size={14}
                  color={theme.colors.secondary.container}
                  fill={theme.colors.secondary.container}
                />
              )}
              {opt.icon === 'verified' && (
                <CheckCircle2
                  size={14}
                  color={theme.colors.tertiary.onContainer}
                  fill={theme.colors.surface.lowest}
                />
              )}
              {opt.icon === 'car' && (
                <Car size={14} color={theme.colors.text.secondary} />
              )}
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {opt.label}
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
    gap: 5,
    paddingHorizontal: theme.spacing[3] + 2,
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
    borderColor: theme.colors.border.subdued,
  },
  chipText: {
    ...theme.typography.label,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: theme.colors.text.inverse,
    fontWeight: '700',
  },
  chipTextUnselected: {
    color: theme.colors.text.primary,
  },
});
