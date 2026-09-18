import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { PetSizeOption } from '../types/service.types';

interface PetSizeSelectorProps {
  sizes: PetSizeOption[];
  selectedSizeId: string;
  onSelectSize: (sizeId: string) => void;
}

export function PetSizeSelector({
  sizes,
  selectedSizeId,
  onSelectSize,
}: PetSizeSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Select Pet Size</Text>
        <Text style={styles.subtitle}>Choose one</Text>
      </View>

      <View style={styles.cardsList}>
        {sizes.map((size) => {
          const isSelected = selectedSizeId === size.id;

          return (
            <TouchableOpacity
              key={size.id}
              style={[
                styles.sizeCard,
                isSelected ? styles.sizeCardSelected : styles.sizeCardUnselected,
              ]}
              activeOpacity={0.85}
              onPress={() => onSelectSize(size.id)}
            >
              <View style={styles.leftGroup}>
                <View
                  style={[
                    styles.radioIndicator,
                    isSelected
                      ? styles.radioIndicatorSelected
                      : styles.radioIndicatorUnselected,
                  ]}
                >
                  {isSelected && (
                    <Check
                      size={13}
                      color={theme.colors.secondary.onContainer}
                      strokeWidth={3}
                    />
                  )}
                </View>

                <View>
                  <Text
                    style={[
                      styles.sizeLabel,
                      isSelected
                        ? styles.sizeLabelSelected
                        : styles.sizeLabelUnselected,
                    ]}
                  >
                    {size.label}
                  </Text>
                  <Text
                    style={[
                      styles.weightRange,
                      isSelected
                        ? styles.weightRangeSelected
                        : styles.weightRangeUnselected,
                    ]}
                  >
                    {size.weightRange}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.priceText,
                  isSelected ? styles.priceTextSelected : styles.priceTextUnselected,
                ]}
              >
                {size.price.toLocaleString('vi-VN')}₫
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
    paddingTop: theme.spacing[4],
    gap: theme.spacing[3],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...theme.typography.h4,
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  subtitle: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
  },
  cardsList: {
    gap: theme.spacing[2] + 2,
  },
  sizeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[4],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  sizeCardSelected: {
    backgroundColor: theme.colors.primary.navy,
    borderColor: theme.colors.primary.navy,
  },
  sizeCardUnselected: {
    backgroundColor: theme.colors.surface.lowest,
    borderColor: theme.colors.border.subdued,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  radioIndicator: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioIndicatorSelected: {
    backgroundColor: theme.colors.secondary.container,
  },
  radioIndicatorUnselected: {
    backgroundColor: theme.colors.surface.containerHigh,
  },
  sizeLabel: {
    ...theme.typography.label,
    fontSize: 15,
    fontWeight: '700',
  },
  sizeLabelSelected: {
    color: theme.colors.text.inverse,
  },
  sizeLabelUnselected: {
    color: theme.colors.text.primary,
  },
  weightRange: {
    ...theme.typography.bodySm,
    fontSize: 12,
    marginTop: 1,
  },
  weightRangeSelected: {
    color: theme.colors.primary.surface,
  },
  weightRangeUnselected: {
    color: theme.colors.text.secondary,
  },
  priceText: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '700',
  },
  priceTextSelected: {
    color: theme.colors.secondary.dim,
  },
  priceTextUnselected: {
    color: theme.colors.primary.navy,
  },
});
