import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface ProviderWeeklyScheduleProps {
  nextSlotTime?: string;
  schedule?: { day: string; hours: string; isOff?: boolean }[];
  onSelectSlot?: () => void;
}

const defaultSchedule = [
  { day: 'Mon', hours: '9-5' },
  { day: 'Tue', hours: '9-5' },
  { day: 'Wed', hours: '9-5' },
  { day: 'Thu', hours: '9-5' },
  { day: 'Fri', hours: '9-5' },
  { day: 'Sat', hours: '10-3' },
  { day: 'Sun', hours: 'Off', isOff: true },
];

export function ProviderWeeklySchedule({
  nextSlotTime = '02:30 PM – 03:30 PM',
  schedule = defaultSchedule,
  onSelectSlot,
}: ProviderWeeklyScheduleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Calendar size={15} color={theme.colors.secondary.onContainer} />
          </View>
          <Text style={styles.title}>Availability</Text>
        </View>

        {/* Next Available Box */}
        <View style={styles.nextSlotBox}>
          <View style={styles.slotLeft}>
            <View style={styles.pulseDot} />
            <View>
              <Text style={styles.nextSlotLabel}>Next Available Today</Text>
              <Text style={styles.nextSlotTime}>{nextSlotTime}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.selectSlotBtn}
            activeOpacity={0.8}
            onPress={onSelectSlot}
          >
            <Text style={styles.selectSlotText}>Select Slot</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Schedule Days */}
        <View style={styles.weeklyDaysRow}>
          {schedule.map((item, idx) => (
            <View
              key={idx}
              style={[styles.dayCol, item.isOff && styles.dayColOff]}
            >
              <Text style={styles.dayName}>{item.day}</Text>
              <View
                style={[
                  styles.hoursCircle,
                  item.isOff ? styles.hoursCircleOff : styles.hoursCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.hoursText,
                    item.isOff ? styles.hoursTextOff : styles.hoursTextActive,
                  ]}
                >
                  {item.hours}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
  },
  card: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  nextSlotBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface.container,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[3],
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    flex: 1,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.tertiary.onContainer,
  },
  nextSlotLabel: {
    ...theme.typography.label,
    fontSize: 10.5,
    fontWeight: '700',
    color: theme.colors.secondary.onContainer,
  },
  nextSlotTime: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary.navy,
    marginTop: 1,
  },
  selectSlotBtn: {
    backgroundColor: theme.colors.primary.navy,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
  },
  selectSlotText: {
    ...theme.typography.label,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text.inverse,
  },
  weeklyDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing[1],
  },
  dayCol: {
    alignItems: 'center',
    gap: 4,
  },
  dayColOff: {
    opacity: 0.45,
  },
  dayName: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
  hoursCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoursCircleActive: {
    backgroundColor: theme.colors.surface.container,
  },
  hoursCircleOff: {
    backgroundColor: theme.colors.surface.subdued,
  },
  hoursText: {
    ...theme.typography.label,
    fontSize: 10,
    fontWeight: '700',
  },
  hoursTextActive: {
    color: theme.colors.primary.navy,
  },
  hoursTextOff: {
    color: theme.colors.text.muted,
  },
});
