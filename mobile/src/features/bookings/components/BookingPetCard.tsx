import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Check, CheckCircle2, Info } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { SelectablePet } from '../types/booking.types';

interface BookingPetCardProps {
  pet: SelectablePet;
  isSelected: boolean;
  onSelect: () => void;
}

export function BookingPetCard({
  pet,
  isSelected,
  onSelect,
}: BookingPetCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected ? styles.cardSelected : styles.cardUnselected,
      ]}
      activeOpacity={0.88}
      onPress={onSelect}
    >
      {/* Left Active Accent Bar */}
      <View
        style={[
          styles.leftAccentBar,
          isSelected ? styles.accentBarActive : styles.accentBarInactive,
        ]}
      />

      <View style={styles.cardInner}>
        {/* Avatar with Verified Badge */}
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: pet.avatarUrl }} style={styles.avatar} />
          {pet.isVerified && (
            <View style={styles.verifiedBadge}>
              <CheckCircle2
                size={14}
                color={theme.colors.surface.lowest}
                fill={theme.colors.primary.navy}
              />
            </View>
          )}
        </View>

        {/* Pet Details */}
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <View style={styles.nameGroup}>
              <Text style={styles.petName}>{pet.name}</Text>
              <View style={styles.genderPill}>
                <Text style={styles.genderText}>{pet.gender}</Text>
              </View>
            </View>

            {/* Checkmark indicator */}
            <View
              style={[
                styles.checkCircle,
                isSelected ? styles.checkCircleSelected : styles.checkCircleUnselected,
              ]}
            >
              {isSelected ? (
                <Check
                  size={14}
                  color={theme.colors.secondary.onContainer}
                  strokeWidth={3}
                />
              ) : (
                <View style={styles.uncheckedDot} />
              )}
            </View>
          </View>

          <Text style={styles.petMeta}>
            {pet.breed} · {pet.age} yrs · {pet.weight} kg
          </Text>

          {/* Tier or Warning Badge */}
          {pet.tierNote && (
            <View style={styles.tierBadge}>
              <View style={styles.goldDot} />
              <Text style={styles.tierText}>{pet.tierNote}</Text>
            </View>
          )}

          {pet.warningNote && (
            <View style={styles.warningBadge}>
              <Info size={13} color={theme.colors.text.muted} />
              <Text style={styles.warningText}>{pet.warningNote}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardSelected: {
    borderColor: theme.colors.primary.navy,
    ...theme.shadows.md,
  },
  cardUnselected: {
    borderColor: theme.colors.border.subdued,
    opacity: 0.9,
    ...theme.shadows.sm,
  },
  leftAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  accentBarActive: {
    backgroundColor: theme.colors.primary.navy,
  },
  accentBarInactive: {
    backgroundColor: 'transparent',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
    paddingLeft: 4,
  },
  avatarWrapper: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.container,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.full,
    padding: 1,
  },
  infoCol: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  petName: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  genderPill: {
    backgroundColor: theme.colors.surface.containerHigh,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  genderText: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: theme.colors.secondary.container,
  },
  checkCircleUnselected: {
    backgroundColor: theme.colors.surface.container,
  },
  uncheckedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.surface.containerHighest,
  },
  petMeta: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 3,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surface.container,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    marginTop: 8,
  },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.secondary.container,
  },
  tierText: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.primary.navy,
    fontWeight: '700',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.surface.subdued,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    marginTop: 8,
  },
  warningText: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
});
