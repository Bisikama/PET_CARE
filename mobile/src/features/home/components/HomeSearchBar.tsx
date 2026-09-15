import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface HomeSearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSearchPress?: () => void;
  onFilterPress?: () => void;
  placeholder?: string;
}

export function HomeSearchBar({
  value,
  onChangeText,
  onSearchPress,
  onFilterPress,
  placeholder = 'What does your pet need today?',
}: HomeSearchBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.searchBar}
        activeOpacity={0.9}
        onPress={onSearchPress}
      >
        <Search size={20} color={theme.colors.border.outline} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.light}
          value={value}
          onChangeText={onChangeText}
          editable={true}
        />
        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.8}
          onPress={onFilterPress}
          accessibilityLabel="Filters"
        >
          <SlidersHorizontal size={18} color={theme.colors.primary.navy} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing[4],
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: theme.spacing[2],
  },
  input: {
    flex: 1,
    ...theme.typography.bodyMd,
    color: theme.colors.text.primary,
    paddingVertical: 0,
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing[1],
  },
});
