import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Map, List } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface MapViewPillProps {
  isMapView: boolean;
  onToggle: () => void;
}

export function MapViewPill({ isMapView, onToggle }: MapViewPillProps) {
  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.pillButton}
        activeOpacity={0.85}
        onPress={onToggle}
      >
        {isMapView ? (
          <List size={18} color={theme.colors.secondary.dim} />
        ) : (
          <Map size={18} color={theme.colors.secondary.dim} />
        )}
        <Text style={styles.pillText}>
          {isMapView ? 'List View' : 'Map View'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: theme.spacing[4],
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    backgroundColor: theme.colors.primary.navy,
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[3],
    borderRadius: theme.radius.full,
    ...theme.shadows.lg,
    elevation: 8,
  },
  pillText: {
    ...theme.typography.label,
    color: theme.colors.text.inverse,
    fontWeight: '700',
    fontSize: 14,
  },
});
