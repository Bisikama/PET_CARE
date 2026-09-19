import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { BookingStepHeader } from '../components/BookingStepHeader';
import { BookingCalendar } from '../components/BookingCalendar';
import { TimeSlotGrid } from '../components/TimeSlotGrid';
import { BookingSummaryCard } from '../components/BookingSummaryCard';
import { BookingBottomActions } from '../components/BookingBottomActions';
import { useBookingFlow } from '../context/BookingContext';

export default function ScheduleTimeScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useBookingFlow();
  const params = useLocalSearchParams<{
    serviceId?: string;
    serviceTitle?: string;
    providerName?: string;
    price?: string;
    selectedSizeId?: string;
    selectedAddonIds?: string;
    petId?: string;
    petName?: string;
    petBreed?: string;
    petAvatarUrl?: string;
    petWeight?: string;
  }>();

  const today = new Date();
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('09:00 - 10:30');

  const petName = params.petName || draft.petName || 'Thú cưng';
  const petAvatar =
    params.petAvatarUrl ||
    draft.petAvatarUrl ||
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80';
  const providerName = params.providerName || draft.providerName || 'PetCare Partner';
  const serviceTitle = params.serviceTitle || draft.serviceTitle || 'Chăm sóc thú cưng';

  // Compute selected full date string (YYYY-MM-DD)
  const selectedDateStr = useMemo(() => {
    const d = new Date();
    // If selected day is in current month or next
    const targetDate = new Date(d.getFullYear(), d.getMonth(), selectedDay);
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, [selectedDay]);

  const monthName = useMemo(() => {
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    return `Tháng ${month}, ${year}`;
  }, []);

  const dateSlotText = useMemo(() => {
    return `Ngày ${selectedDay} · ${selectedSlotTime}`;
  }, [selectedDay, selectedSlotTime]);

  const handleContinue = () => {
    updateDraft({
      bookingDate: selectedDateStr,
      timeSlot: selectedSlotTime,
      slotStartTime: selectedSlotTime.split(' - ')[0] || selectedSlotTime,
      slotEndTime: selectedSlotTime.split(' - ')[1] || '',
    });

    router.push({
      pathname: '/(customer)/bookings/select-provider',
      params: {
        serviceId: params.serviceId || draft.serviceId,
        serviceTitle: serviceTitle,
        providerName: providerName,
        price: params.price || (draft.servicePrice ? String(draft.servicePrice) : undefined),
        selectedSizeId: params.selectedSizeId,
        selectedAddonIds: params.selectedAddonIds,
        petId: params.petId || draft.petId,
        petName: petName,
        petBreed: params.petBreed || draft.petBreed,
        petAvatarUrl: petAvatar,
        petWeight: params.petWeight || (draft.petWeight ? `${draft.petWeight} kg` : undefined),
        day: selectedDay.toString(),
        date: selectedDateStr,
        slotTime: selectedSlotTime,
      },
    });
  };

  return (
    <Screen
      withPadding={false}
      backgroundColor={theme.colors.background.default}
      edges={['top', 'left', 'right']}
      style={styles.screen}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.default} />

      {/* 1. Top Header Navigation */}
      <BookingStepHeader
        title="Chọn ngày & khung giờ"
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Stepper Progress Header */}
        <View style={styles.stepperSection}>
          <View style={styles.stepInfoRow}>
            <Text style={styles.stepCountText}>BƯỚC 2 / 4</Text>
            <View style={styles.stepBadge}>
              <View style={styles.goldDot} />
              <Text style={styles.stepBadgeText}>Lịch làm việc</Text>
            </View>
          </View>

          {/* Stepper Graphic with Completed Step 1 */}
          <View style={styles.progressBarRow}>
            {/* Step 1: Pet (Completed) */}
            <View style={styles.stepCol}>
              <View style={styles.barCompleted} />
              <View style={styles.stepLabelRow}>
                <CheckCircle2
                  size={13}
                  color={theme.colors.tertiary.onContainer}
                  fill={theme.colors.surface.lowest}
                />
                <Text style={styles.stepLabelCompleted}>Thú cưng</Text>
              </View>
            </View>

            {/* Step 2: Date & Time (Active) */}
            <View style={styles.stepCol}>
              <View style={styles.barActive} />
              <View style={styles.stepLabelRow}>
                <View style={styles.activeDot} />
                <Text style={styles.stepLabelActive}>Ngày & Giờ</Text>
              </View>
            </View>

            {/* Step 3: Details */}
            <View style={styles.stepCol}>
              <View style={styles.barInactive} />
              <Text style={styles.stepLabelInactive}>Đối tác</Text>
            </View>

            {/* Step 4: Payment */}
            <View style={styles.stepCol}>
              <View style={styles.barInactive} />
              <Text style={styles.stepLabelInactive}>Thanh toán</Text>
            </View>
          </View>

          {/* Screen Title & Pet Preview Pill */}
          <View style={styles.titleRow}>
            <View style={styles.titleCol}>
              <Text style={styles.screenTitle}>Chọn Ngày & Khung Giờ</Text>
              <Text style={styles.screenSubtitle}>
                Khung giờ thuận tiện nhất để chuyên viên chăm sóc bé {petName}
              </Text>
            </View>

            <View style={styles.petPill}>
              <Image source={{ uri: petAvatar }} style={styles.petAvatar} />
              <Text style={styles.petPillName}>{petName}</Text>
            </View>
          </View>
        </View>

        {/* 3. Monthly Calendar Picker */}
        <BookingCalendar
          currentMonthName={monthName}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />

        {/* 4. Available Times Slots */}
        <TimeSlotGrid
          selectedSlotTime={selectedSlotTime}
          onSelectSlot={setSelectedSlotTime}
          providerName={providerName}
        />

        {/* 5. Reservation Summary Card */}
        <BookingSummaryCard
          dateSlotText={dateSlotText}
          durationText="60–90 phút"
          providerName={providerName}
        />
      </ScrollView>

      {/* 6. Sticky Bottom Actions Bar */}
      <BookingBottomActions
        onBack={() => router.back()}
        onNext={handleContinue}
        nextLabel="Tiếp tục chọn Chuyên viên"
        disabled={!selectedSlotTime}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  stepperSection: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    gap: theme.spacing[2],
  },
  stepInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCountText: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.secondary.onContainer,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.surface.container,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.secondary.container,
  },
  stepBadgeText: {
    ...theme.typography.label,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.secondary.onContainer,
  },
  progressBarRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    paddingTop: 4,
  },
  stepCol: {
    flex: 1,
    gap: 4,
  },
  barCompleted: {
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.tertiary.onContainer,
  },
  barActive: {
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondary.container,
  },
  barInactive: {
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.containerHigh,
  },
  stepLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  stepLabelCompleted: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  stepLabelActive: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.primary.navy,
    fontWeight: '700',
  },
  stepLabelInactive: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.text.muted,
    fontWeight: '500',
    paddingLeft: 2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.secondary.container,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: theme.spacing[2],
    gap: theme.spacing[2],
  },
  titleCol: {
    flex: 1,
    gap: 2,
  },
  screenTitle: {
    ...theme.typography.h2,
    fontSize: 20,
    color: theme.colors.primary.navy,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
  },
  petPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surface.container,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.xl,
    ...theme.shadows.sm,
  },
  petAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  petPillName: {
    ...theme.typography.label,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
});
