import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Navigation,
  CheckCircle2,
  Star,
  Banknote,
} from 'lucide-react-native';
import { theme } from '@/core/theme';

export interface QuickFilter {
  id: string;
  label: string;
  IconComponent: any;
  iconColor: string;
}

const quickFilters: QuickFilter[] = [
  {
    id: 'near_me',
    label: 'Near Me (< 5km)',
    IconComponent: Navigation,
    iconColor: theme.colors.primary.navy,
  },
  {
    id: 'available_today',
    label: 'Available Today',
    IconComponent: CheckCircle2,
    iconColor: theme.colors.tertiary.onContainer,
  },
  {
    id: 'top_rated',
    label: 'Top Rated (4.8+)',
    IconComponent: Star,
    iconColor: theme.colors.secondary.container,
  },
  {
    id: 'price_range',
    label: 'Best Price',
    IconComponent: Banknote,
    iconColor: theme.colors.text.muted,
  },
];

interface QuickFilterPillsProps {
  activeFilters: string[];
  onToggleFilter: (filterId: string) => void;
}

export function QuickFilterPills({
  activeFilters,
  onToggleFilter,
}: QuickFilterPillsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {quickFilters.map((filter) => {
          const isActive = activeFilters.includes(filter.id);
          const Icon = filter.IconComponent;

          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.pill,
                isActive ? styles.pillActive : styles.pillInactive,
              ]}
              activeOpacity={0.75}
              onPress={() => onToggleFilter(filter.id)}
            >
              <Icon
                size={14}
                color={isActive ? theme.colors.text.inverse : filter.iconColor}
                fill={
                  filter.id === 'top_rated' && !isActive
                    ? theme.colors.secondary.container
                    : isActive
                    ? theme.colors.text.inverse
                    : 'transparent'
                }
              />
              <Text
                style={[
                  styles.pillText,
                  isActive ? styles.pillTextActive : styles.pillTextInactive,
                ]}
              >
                {filter.label}
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
    paddingBottom: theme.spacing[3],
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[5],
    gap: theme.spacing[2],
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1] + 2,
    borderRadius: theme.radius.md,
  },
  pillActive: {
    backgroundColor: theme.colors.primary.navy,
  },
  pillInactive: {
    backgroundColor: theme.colors.surface.container,
  },
  pillText: {
    ...theme.typography.bodySm,
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: theme.colors.text.inverse,
  },
  pillTextInactive: {
    color: theme.colors.text.primary,
  },
});
