import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/core/theme';

export interface Segment {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  segments: Segment[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function SegmentedControl({
  segments,
  selectedValue,
  onValueChange,
  style,
}: SegmentedControlProps) {
  return (
    <View style={[styles.container, style]}>
      {segments.map((segment) => {
        const isSelected = segment.value === selectedValue;
        return (
          <TouchableOpacity
            key={segment.value}
            activeOpacity={0.8}
            onPress={() => onValueChange(segment.value)}
            style={[
              styles.segment,
              isSelected && styles.segmentSelected,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              style={[
                theme.typography.button,
                { color: isSelected ? '#FFF' : theme.colors.text.secondary },
              ]}
            >
              {segment.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.full,
    padding: 4,
    width: '100%',
  },
  segment: {
    flex: 1,
    paddingVertical: theme.spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.full,
  },
  segmentSelected: {
    backgroundColor: theme.colors.primary.default,
    ...theme.shadows.sm,
  },
});
