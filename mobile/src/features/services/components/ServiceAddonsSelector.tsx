import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { ServiceAddon } from '../types/service.types';

interface ServiceAddonsSelectorProps {
  addons: ServiceAddon[];
  selectedAddonIds: string[];
  onToggleAddon: (addonId: string) => void;
}

export function ServiceAddonsSelector({
  addons,
  selectedAddonIds,
  onToggleAddon,
}: ServiceAddonsSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Optional Add-ons</Text>
        <Text style={styles.subtitle}>Multiple choice</Text>
      </View>

      <View style={styles.addonsList}>
        {addons.map((addon) => {
          const isSelected = selectedAddonIds.includes(addon.id);

          return (
            <TouchableOpacity
              key={addon.id}
              style={[
                styles.addonCard,
                isSelected && styles.addonCardSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => onToggleAddon(addon.id)}
            >
              <View style={styles.leftGroup}>
                <View
                  style={[
                    styles.checkbox,
                    isSelected
                      ? styles.checkboxSelected
                      : styles.checkboxUnselected,
                  ]}
                >
                  {isSelected && (
                    <Check
                      size={13}
                      color={theme.colors.text.inverse}
                      strokeWidth={3}
                    />
                  )}
                </View>

                <View style={styles.infoCol}>
                  <Text style={styles.addonTitle}>{addon.label}</Text>
                  <Text style={styles.addonDesc}>{addon.description}</Text>
                </View>
              </View>

              <Text style={styles.addonPrice}>
                +{addon.price.toLocaleString('vi-VN')}₫
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
  addonsList: {
    gap: theme.spacing[2] + 2,
  },
  addonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[3] + 2,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface.lowest,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
  },
  addonCardSelected: {
    borderColor: theme.colors.primary.navy,
    backgroundColor: theme.colors.surface.subdued,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    flex: 1,
    paddingRight: theme.spacing[2],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary.navy,
  },
  checkboxUnselected: {
    backgroundColor: theme.colors.surface.containerHigh,
    borderWidth: 1,
    borderColor: theme.colors.border.outlineVariant,
  },
  infoCol: {
    flex: 1,
  },
  addonTitle: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  addonDesc: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 1,
  },
  addonPrice: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
});
