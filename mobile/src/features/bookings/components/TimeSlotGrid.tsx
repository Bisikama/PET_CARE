import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { TimeSlotOption } from '../types/booking.types';

export const defaultTimeSlots: TimeSlotOption[] = [
  { id: 'slot-1', time: '09:00 AM', period: 'Morning', isAvailable: true },
  { id: 'slot-2', time: '10:30 AM', period: 'Morning', isAvailable: true },
  { id: 'slot-3', time: '11:30 AM', period: 'Midday', isAvailable: true },
  { id: 'slot-4', time: '01:00 PM', period: 'Booked', isAvailable: false, isBooked: true },
  { id: 'slot-5', time: '02:30 PM', period: 'Afternoon', isAvailable: true },
  { id: 'slot-6', time: '04:00 PM', period: 'Evening', isAvailable: true },
];

interface TimeSlotGridProps {
  slots?: TimeSlotOption[];
  selectedSlotTime: string;
  onSelectSlot: (time: string) => void;
  providerName?: string;
}

export function TimeSlotGrid({
  slots = defaultTimeSlots,
  selectedSlotTime,
  onSelectSlot,
  providerName = 'Happy Paws Care',
}: TimeSlotGridProps) {
  return (
    <View style={styles.container}>
      {/* Title & Timezone */}
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Available Times</Text>
        <View style={styles.tzPill}>
          <Text style={styles.tzText}>Vietnam Time (GMT+7)</Text>
        </View>
      </View>

      {/* Provider Availability Bar */}
      <View style={styles.availabilityBar}>
        <CheckCircle2
          size={16}
          color={theme.colors.tertiary.onContainer}
          fill={theme.colors.surface.lowest}
        />
        <Text style={styles.availabilityText} numberOfLines={1}>
          <Text style={styles.boldProvider}>{providerName}</Text> is available at this time
        </Text>
      </View>

      {/* Slots 3-column Grid */}
      <View style={styles.grid}>
        {slots.map((slot) => {
          const isSelected = selectedSlotTime === slot.time;
          const isBooked = !!slot.isBooked;

          if (isBooked) {
            return (
              <View key={slot.id} style={[styles.slotCard, styles.slotCardBooked]}>
                <Text style={styles.slotTimeBooked}>{slot.time}</Text>
                <Text style={styles.slotSubBooked}>Booked</Text>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.slotCard,
                isSelected ? styles.slotCardSelected : styles.slotCardAvailable,
              ]}
              activeOpacity={0.8}
              onPress={() => onSelectSlot(slot.time)}
            >
              {isSelected && <View style={styles.selectedCornerDot} />}
              <Text
                style={[
                  styles.slotTime,
                  isSelected ? styles.slotTimeSelected : styles.slotTimeAvailable,
                ]}
              >
                {slot.time}
              </Text>
              <Text
                style={[
                  styles.slotSub,
                  isSelected ? styles.slotSubSelected : styles.slotSubAvailable,
                ]}
              >
                {isSelected ? 'Selected' : slot.period}
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
    gap: theme.spacing[2],
  },
  titleRow: {
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
  tzPill: {
    backgroundColor: theme.colors.surface.container,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  tzText: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.secondary.onContainer,
    fontWeight: '600',
  },
  availabilityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    backgroundColor: theme.colors.surface.subdued,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 8,
    borderRadius: theme.radius.lg,
    marginTop: 2,
  },
  availabilityText: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.primary,
    flex: 1,
  },
  boldProvider: {
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2] + 2,
    marginTop: theme.spacing[2],
  },
  slotCard: {
    width: '31%',
    borderRadius: theme.radius.xl,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  slotCardAvailable: {
    backgroundColor: theme.colors.surface.lowest,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
  },
  slotCardSelected: {
    backgroundColor: theme.colors.primary.navy,
    borderColor: theme.colors.primary.navy,
    ...theme.shadows.md,
  },
  slotCardBooked: {
    backgroundColor: theme.colors.surface.subdued,
    borderColor: 'transparent',
    opacity: 0.55,
  },
  selectedCornerDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.secondary.container,
  },
  slotTime: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
  },
  slotTimeAvailable: {
    color: theme.colors.primary.navy,
  },
  slotTimeSelected: {
    color: theme.colors.text.inverse,
  },
  slotTimeBooked: {
    ...theme.typography.label,
    fontSize: 14,
    color: theme.colors.text.muted,
    textDecorationLine: 'line-through',
  },
  slotSub: {
    ...theme.typography.label,
    fontSize: 11,
    marginTop: 2,
  },
  slotSubAvailable: {
    color: theme.colors.text.secondary,
  },
  slotSubSelected: {
    color: theme.colors.secondary.container,
    fontWeight: '700',
  },
  slotSubBooked: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.semantic.error,
    marginTop: 2,
  },
});
