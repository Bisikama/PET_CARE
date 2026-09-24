import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface AddNewPetButtonProps {
  onPress: () => void;
}

export function AddNewPetButton({ onPress }: AddNewPetButtonProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.plusCircle}>
        <Plus size={20} color={theme.colors.primary.navy} />
      </View>

      <View style={styles.textCol}>
        <Text style={styles.title}>Add a new pet profile</Text>
        <Text style={styles.subtitle}>Quick 1-minute registration</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    borderStyle: 'dashed',
  },
  plusCircle: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.lowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  textCol: {
    flex: 1,
  },
  title: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  subtitle: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 1,
  },
});
