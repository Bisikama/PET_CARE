import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface BookingCalendarProps {
  currentMonthName?: string;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

export function BookingCalendar({
  currentMonthName = 'September 2026',
  selectedDay,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
}: BookingCalendarProps) {
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Days 1-14 are past dates, 15-30 are available in current month
  const pastDays = Array.from({ length: 14 }, (_, i) => i + 1);
  const activeDays = Array.from({ length: 16 }, (_, i) => i + 15);
  const nextMonthPadding = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Month Header & Nav */}
        <View style={styles.headerRow}>
          <View style={styles.monthTitleGroup}>
            <CalendarIcon size={20} color={theme.colors.primary.navy} />
            <Text style={styles.monthTitle}>{currentMonthName}</Text>
          </View>

          <View style={styles.navButtons}>
            <TouchableOpacity
              style={styles.navBtn}
              activeOpacity={0.7}
              onPress={onPrevMonth}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronLeft size={18} color={theme.colors.primary.navy} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navBtn}
              activeOpacity={0.7}
              onPress={onNextMonth}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronRight size={18} color={theme.colors.primary.navy} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Days of Week */}
        <View style={styles.weekDaysRow}>
          {weekDays.map((d, index) => (
            <Text
              key={index}
              style={[
                styles.weekDayText,
                (index === 5 || index === 6) && styles.weekendText,
              ]}
            >
              {d}
            </Text>
          ))}
        </View>

        {/* Dates Grid */}
        <View style={styles.datesGrid}>
          {/* Past days */}
          {pastDays.map((d) => (
            <View key={`past-${d}`} style={styles.dateCell}>
              <Text style={styles.pastDateText}>{d}</Text>
            </View>
          ))}

          {/* Active days */}
          {activeDays.map((d) => {
            const isSelected = selectedDay === d;

            return (
              <TouchableOpacity
                key={`active-${d}`}
                style={styles.dateCell}
                activeOpacity={0.8}
                onPress={() => onSelectDay(d)}
              >
                <View
                  style={[
                    styles.dateCircle,
                    isSelected && styles.dateCircleSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.activeDateText,
                      isSelected && styles.selectedDateText,
                    ]}
                  >
                    {d}
                  </Text>
                </View>

                {/* Bottom indicator dot */}
                <View
                  style={[
                    styles.dotIndicator,
                    isSelected ? styles.dotSelected : styles.dotAvailable,
                  ]}
                />
              </TouchableOpacity>
            );
          })}

          {/* Next month preview padding */}
          {nextMonthPadding.map((d) => (
            <View key={`next-${d}`} style={styles.dateCell}>
              <Text style={styles.nextMonthDateText}>{d}</Text>
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
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
  },
  monthTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  monthTitle: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing[2],
  },
  weekDayText: {
    ...theme.typography.label,
    fontSize: 12,
    color: theme.colors.text.muted,
    width: 38,
    textAlign: 'center',
  },
  weekendText: {
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    rowGap: 4,
  },
  dateCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  pastDateText: {
    ...theme.typography.bodySm,
    color: theme.colors.text.light,
    opacity: 0.45,
  },
  nextMonthDateText: {
    ...theme.typography.bodySm,
    color: theme.colors.text.light,
    opacity: 0.3,
  },
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleSelected: {
    backgroundColor: theme.colors.secondary.container,
    ...theme.shadows.sm,
  },
  activeDateText: {
    ...theme.typography.label,
    fontSize: 13,
    color: theme.colors.primary.navy,
    fontWeight: '600',
  },
  selectedDateText: {
    color: theme.colors.secondary.onContainer,
    fontWeight: '800',
  },
  dotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  dotAvailable: {
    backgroundColor: theme.colors.secondary.container,
  },
  dotSelected: {
    backgroundColor: theme.colors.primary.navy,
  },
});
