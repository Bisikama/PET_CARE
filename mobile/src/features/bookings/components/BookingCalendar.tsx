import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info } from 'lucide-react-native';
import { theme } from '@/core/theme';

export interface BookingCalendarProps {
  currentMonthName?: string;
  selectedDay?: number;
  onSelectDay?: (day: number) => void;
  viewDate?: Date;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  canPrevMonth?: boolean;
  canNextMonth?: boolean;
}

export function BookingCalendar({
  currentMonthName,
  selectedDay,
  onSelectDay,
  viewDate = new Date(),
  selectedDate = new Date(),
  onSelectDate,
  minDate = new Date(),
  maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  onPrevMonth,
  onNextMonth,
  canPrevMonth = true,
  canNextMonth = true,
}: BookingCalendarProps) {
  // Thứ 2 đến Chủ nhật
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed

  // Month header text
  const displayMonthName =
    currentMonthName || `Tháng ${month + 1}, ${year}`;

  // Start & End of normalized min & max dates
  const minDateMidnight = new Date(
    minDate.getFullYear(),
    minDate.getMonth(),
    minDate.getDate(),
    0,
    0,
    0,
    0
  );
  const maxDateMidnight = new Date(
    maxDate.getFullYear(),
    maxDate.getMonth(),
    maxDate.getDate(),
    23,
    59,
    59,
    999
  );

  // Number of days in current viewing month
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

  // Day of week of the 1st day of the month (Monday = 0, Sunday = 6)
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;

  // Days in previous month for leading padding
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const leadingDays = Array.from(
    { length: firstDayOfWeek },
    (_, i) => daysInPrevMonth - firstDayOfWeek + 1 + i
  );

  // Current month days
  const currentMonthDays = Array.from(
    { length: daysInCurrentMonth },
    (_, i) => i + 1
  );

  // Trailing padding to make full 7-col rows
  const totalOccupied = leadingDays.length + currentMonthDays.length;
  const trailingCount = (7 - (totalOccupied % 7)) % 7;
  const trailingDays = Array.from({ length: trailingCount }, (_, i) => i + 1);

  const handleSelectDayNumber = (d: number) => {
    const target = new Date(year, month, d, 0, 0, 0, 0);
    if (onSelectDate) {
      onSelectDate(target);
    } else if (onSelectDay) {
      onSelectDay(d);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Month Header & Nav */}
        <View style={styles.headerRow}>
          <View style={styles.monthTitleGroup}>
            <CalendarIcon size={20} color={theme.colors.primary.navy} />
            <Text style={styles.monthTitle}>{displayMonthName}</Text>
          </View>

          <View style={styles.navButtons}>
            <TouchableOpacity
              style={[styles.navBtn, !canPrevMonth && styles.navBtnDisabled]}
              activeOpacity={canPrevMonth ? 0.7 : 1}
              onPress={canPrevMonth ? onPrevMonth : undefined}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={!canPrevMonth}
            >
              <ChevronLeft
                size={18}
                color={
                  canPrevMonth
                    ? theme.colors.primary.navy
                    : theme.colors.text.light
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navBtn, !canNextMonth && styles.navBtnDisabled]}
              activeOpacity={canNextMonth ? 0.7 : 1}
              onPress={canNextMonth ? onNextMonth : undefined}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={!canNextMonth}
            >
              <ChevronRight
                size={18}
                color={
                  canNextMonth
                    ? theme.colors.primary.navy
                    : theme.colors.text.light
                }
              />
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
          {/* Leading days from previous month */}
          {leadingDays.map((d) => (
            <View key={`prev-${d}`} style={styles.dateCell}>
              <Text style={styles.pastDateText}>{d}</Text>
            </View>
          ))}

          {/* Current Month Active & Inactive Days */}
          {currentMonthDays.map((d) => {
            const thisDate = new Date(year, month, d, 0, 0, 0, 0);
            const isPast = thisDate < minDateMidnight;
            const isBeyond30Days = thisDate > maxDateMidnight;
            const isAvailable = !isPast && !isBeyond30Days;

            const isSelected =
              selectedDate.getFullYear() === year &&
              selectedDate.getMonth() === month &&
              selectedDate.getDate() === d;

            if (!isAvailable) {
              return (
                <View key={`day-${d}`} style={styles.dateCell}>
                  <Text style={styles.pastDateText}>{d}</Text>
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={`day-${d}`}
                style={styles.dateCell}
                activeOpacity={0.8}
                onPress={() => handleSelectDayNumber(d)}
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

          {/* Trailing days for next month */}
          {trailingDays.map((d) => (
            <View key={`next-${d}`} style={styles.dateCell}>
              <Text style={styles.nextMonthDateText}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Bottom Booking Window Hint */}
        <View style={styles.windowHintRow}>
          <Info size={13} color="#64748B" />
          <Text style={styles.windowHintText}>
            Hỗ trợ đặt lịch linh hoạt trong vòng 30 ngày tới
          </Text>
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
    width: 34,
    height: 34,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    opacity: 0.35,
    backgroundColor: '#F1F5F9',
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
    opacity: 0.35,
  },
  nextMonthDateText: {
    ...theme.typography.bodySm,
    color: theme.colors.text.light,
    opacity: 0.25,
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
  windowHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  windowHintText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});
