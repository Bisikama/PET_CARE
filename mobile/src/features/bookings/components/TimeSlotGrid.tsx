import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { TimeSlotOption } from '../types/booking.types';

export function formatSlotPeriod(startTime?: string): string {
  if (!startTime) return 'Thời gian';
  const hour = parseInt(startTime.split(':')[0], 10);
  if (hour >= 6 && hour < 11) return 'Sáng';
  if (hour >= 11 && hour < 13) return 'Trưa';
  if (hour >= 13 && hour < 18) return 'Chiều';
  if (hour >= 18 && hour < 21) return 'Tối';
  return 'Đêm';
}

export const defaultTimeSlots: TimeSlotOption[] = [
  { id: 'b23b1234-abcd-4234-8f02-000000000001', name: 'Slot 1 (07:00 - 09:00)', time: '07:00 - 09:00', startTime: '07:00', endTime: '09:00', period: 'Sáng', slotOrder: 1, isAvailable: true },
  { id: 'b23b1234-abcd-4234-8f02-000000000002', name: 'Slot 2 (09:00 - 11:00)', time: '09:00 - 11:00', startTime: '09:00', endTime: '11:00', period: 'Sáng', slotOrder: 2, isAvailable: true },
  { id: 'b23b1234-abcd-4234-8f02-000000000003', name: 'Slot 3 (11:00 - 13:00)', time: '11:00 - 13:00', startTime: '11:00', endTime: '13:00', period: 'Trưa', slotOrder: 3, isAvailable: true },
  { id: 'b23b1234-abcd-4234-8f02-000000000004', name: 'Slot 4 (13:00 - 15:00)', time: '13:00 - 15:00', startTime: '13:00', endTime: '15:00', period: 'Chiều', slotOrder: 4, isAvailable: true },
  { id: 'b23b1234-abcd-4234-8f02-000000000005', name: 'Slot 5 (15:00 - 17:00)', time: '15:00 - 17:00', startTime: '15:00', endTime: '17:00', period: 'Chiều', slotOrder: 5, isAvailable: true },
  { id: 'b23b1234-abcd-4234-8f02-000000000006', name: 'Slot 6 (17:00 - 19:00)', time: '17:00 - 19:00', startTime: '17:00', endTime: '19:00', period: 'Tối', slotOrder: 6, isAvailable: true },
  { id: 'b23b1234-abcd-4234-8f02-000000000007', name: 'Slot 7 (19:00 - 21:00)', time: '19:00 - 21:00', startTime: '19:00', endTime: '21:00', period: 'Tối', slotOrder: 7, isAvailable: true },
  { id: 'b23b1234-abcd-4234-8f02-000000000008', name: 'Slot 8 (21:00 - 23:00)', time: '21:00 - 23:00', startTime: '21:00', endTime: '23:00', period: 'Đêm', slotOrder: 8, isAvailable: true },
];

interface TimeSlotGridProps {
  slots?: TimeSlotOption[];
  selectedSlotTime: string;
  onSelectSlot: (time: string, slot?: TimeSlotOption) => void;
  providerName?: string;
}

export function TimeSlotGrid({
  slots = defaultTimeSlots,
  selectedSlotTime,
  onSelectSlot,
  providerName = 'Chuyên viên PetCare',
}: TimeSlotGridProps) {
  return (
    <View style={styles.container}>
      {/* Title & Timezone */}
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Khung giờ khả dụng</Text>
        <View style={styles.tzPill}>
          <Text style={styles.tzText}>Giờ Việt Nam (GMT+7)</Text>
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
          <Text style={styles.boldProvider}>{providerName}</Text> có thể tiếp nhận trong ca này
        </Text>
      </View>

      {/* Slots 2-column Grid */}
      <View style={styles.grid}>
        {slots.map((slot) => {
          const isSelected = selectedSlotTime === slot.time;
          const isUnavailable = !slot.isAvailable || !!slot.isBooked;

          if (isUnavailable) {
            return (
              <View key={slot.id} style={[styles.slotCard, styles.slotCardBooked]}>
                <Text style={styles.slotTimeBooked}>{slot.time}</Text>
                <Text style={styles.slotSubBooked}>
                  {(slot as any).isPast ? 'Đã qua giờ' : 'Đã kín lịch'}
                </Text>
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
              onPress={() => onSelectSlot(slot.time, slot)}
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
                {isSelected ? 'Đã chọn' : slot.period || formatSlotPeriod(slot.startTime || slot.time.split(' - ')[0])}
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
    justifyContent: 'space-between',
    gap: theme.spacing[2] + 2,
    marginTop: theme.spacing[2],
  },
  slotCard: {
    width: '48%',
    borderRadius: theme.radius.xl,
    paddingVertical: 14,
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
