import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, SlidersHorizontal, X, Sliders } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface ExploreSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onFilterPress?: () => void;
  onTunePress?: () => void;
  placeholder?: string;
  totalResults?: number;
}

export function ExploreSearchBar({
  value,
  onChangeText,
  onClear,
  onFilterPress,
  onTunePress,
  placeholder = 'Search services, sitters or clinics...',
  totalResults,
}: ExploreSearchBarProps) {
  return (
    <View style={styles.container}>
      {/* Title & Headline */}
      <View style={styles.titleRow}>
        <View style={styles.titleTextContainer}>
          <Text style={styles.title}>Explore Services</Text>
          <Text style={styles.subtitle}>
            Find trusted, certified pet specialists near you
          </Text>
        </View>
        <TouchableOpacity
          style={styles.tuneButton}
          activeOpacity={0.7}
          onPress={onTunePress || onFilterPress}
        >
          <Sliders size={20} color={theme.colors.primary.navy} />
        </TouchableOpacity>
      </View>

      {/* Input Row */}
      <View style={styles.searchRow}>
        <View style={styles.inputContainer}>
          <Search size={20} color={theme.colors.text.light} />
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.text.light}
            returnKeyType="search"
            clearButtonMode="never"
          />
          {value.length > 0 && (
            <TouchableOpacity
              onPress={onClear}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={18} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Toggle Button */}
        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.8}
          onPress={onFilterPress}
        >
          <SlidersHorizontal size={20} color={theme.colors.text.inverse} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[3],
    backgroundColor: theme.colors.background.default,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[4],
  },
  titleTextContainer: {
    flex: 1,
    paddingRight: theme.spacing[3],
  },
  title: {
    ...theme.typography.h2,
    fontWeight: '700',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  tuneButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.containerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  inputContainer: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[2],
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  input: {
    flex: 1,
    ...theme.typography.bodyMd,
    color: theme.colors.text.primary,
    paddingVertical: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary.navy,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
});
