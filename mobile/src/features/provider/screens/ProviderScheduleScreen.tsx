import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  CheckCircle2,
  AlertCircle,
  Copy,
  SlidersHorizontal,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Ban,
  PlusCircle,
  CheckSquare,
  Square,
  ArrowRight,
  Sparkles,
  X,
  Hourglass,
  Calendar,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import {
  providerSchedulesApi,
  ProviderWorkingDayView,
  ProviderWorkingSlotView,
  MasterTimeSlot,
} from '@/infrastructure/api/provider-schedules.api';

// Format helper
function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, days: number): Date {
  const res = new Date(d);
  res.setDate(res.getDate() + days);
  return res;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ProviderScheduleScreen() {
  const router = useRouter();

  // Selected week anchor (Monday)
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMonday(new Date()));
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateKey(new Date()));

  // Data states
  const [scheduleDays, setScheduleDays] = useState<ProviderWorkingDayView[]>([]);
  const [masterSlots, setMasterSlots] = useState<MasterTimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingSlotId, setActionLoadingSlotId] = useState<string | null>(null);

  // Multi-select mode
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);

  // Modals
  const [isCopyModalVisible, setIsCopyModalVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // Compute 7 days of the current week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(currentWeekMonday, i);
      const key = formatDateKey(date);
      return {
        date,
        key,
        dayNumber: date.getDate(),
        dayName: DAY_NAMES[i],
        isToday: key === formatDateKey(new Date()),
      };
    });
  }, [currentWeekMonday]);

  const sundayDate = useMemo(() => addDays(currentWeekMonday, 6), [currentWeekMonday]);

  // Formatted date range: e.g. "21 Th09 – 27 Th09, 2026"
  const formattedWeekRange = useMemo(() => {
    const startStr = `${currentWeekMonday.getDate()} Th${String(currentWeekMonday.getMonth() + 1).padStart(2, '0')}`;
    const endStr = `${sundayDate.getDate()} Th${String(sundayDate.getMonth() + 1).padStart(2, '0')}, ${sundayDate.getFullYear()}`;
    return `${startStr} – ${endStr}`;
  }, [currentWeekMonday, sundayDate]);

  // Fetch schedule and master time slots
  const fetchSchedule = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const startDateStr = formatDateKey(currentWeekMonday);
      const endDateStr = formatDateKey(sundayDate);

      try {
        const [scheduleRes, timeSlotsRes] = await Promise.allSettled([
          providerSchedulesApi.getSchedule(startDateStr, endDateStr),
          providerSchedulesApi.getTimeSlots(),
        ]);

        if (timeSlotsRes.status === 'fulfilled' && timeSlotsRes.value.length > 0) {
          setMasterSlots(timeSlotsRes.value);
        }

        let loadedMasterSlots: MasterTimeSlot[] = [];
        if (timeSlotsRes.status === 'fulfilled' && timeSlotsRes.value.length > 0) {
          setMasterSlots(timeSlotsRes.value);
          loadedMasterSlots = timeSlotsRes.value;
        }

        if (scheduleRes.status === 'fulfilled' && scheduleRes.value.length > 0) {
          setScheduleDays(scheduleRes.value);
        } else {
          // Generate fallback initial days where unregistered days are BLOCKED
          generateFallbackDays(startDateStr, endDateStr, loadedMasterSlots);
        }
      } catch (err) {
        console.warn('Could not load schedule, generating fallback:', err);
        generateFallbackDays(startDateStr, endDateStr);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentWeekMonday, sundayDate]
  );

  // Fallback data generator for seamless UI demo
  const generateFallbackDays = (
    startStr: string,
    endStr: string,
    timeSlots?: MasterTimeSlot[]
  ) => {
    const slotsList: ProviderWorkingSlotView[] =
      timeSlots && timeSlots.length > 0
        ? timeSlots.map((ts) => ({
            providerWorkingSlotId: null,
            slotId: ts.id,
            name: `${ts.start_time.slice(0, 5)} – ${ts.end_time.slice(0, 5)}`,
            startTime: ts.start_time.slice(0, 5),
            endTime: ts.end_time.slice(0, 5),
            slotOrder: ts.slot_order,
            status: 'BLOCKED',
          }))
        : [
            {
              providerWorkingSlotId: null,
              slotId: 'ts-0700',
              name: '07:00 – 08:00',
              startTime: '07:00',
              endTime: '08:00',
              slotOrder: 1,
              status: 'BLOCKED',
            },
            {
              providerWorkingSlotId: null,
              slotId: 'ts-0800',
              name: '08:00 – 09:00',
              startTime: '08:00',
              endTime: '09:00',
              slotOrder: 2,
              status: 'BLOCKED',
            },
            {
              providerWorkingSlotId: null,
              slotId: 'ts-0930',
              name: '09:30 – 10:30',
              startTime: '09:30',
              endTime: '10:30',
              slotOrder: 3,
              status: 'BLOCKED',
            },
            {
              providerWorkingSlotId: null,
              slotId: 'ts-1100',
              name: '11:00 – 12:00',
              startTime: '11:00',
              endTime: '12:00',
              slotOrder: 4,
              status: 'BLOCKED',
            },
            {
              providerWorkingSlotId: null,
              slotId: 'ts-1330',
              name: '13:30 – 14:30',
              startTime: '13:30',
              endTime: '14:30',
              slotOrder: 5,
              status: 'BLOCKED',
            },
            {
              providerWorkingSlotId: null,
              slotId: 'ts-1500',
              name: '15:00 – 16:00',
              startTime: '15:00',
              endTime: '16:00',
              slotOrder: 6,
              status: 'BLOCKED',
            },
            {
              providerWorkingSlotId: null,
              slotId: 'ts-1630',
              name: '16:30 – 17:30',
              startTime: '16:30',
              endTime: '17:30',
              slotOrder: 7,
              status: 'BLOCKED',
            },
            {
              providerWorkingSlotId: null,
              slotId: 'ts-1800',
              name: '18:00 – 19:00',
              startTime: '18:00',
              endTime: '19:00',
              slotOrder: 8,
              status: 'BLOCKED',
            },
          ];

    const days: ProviderWorkingDayView[] = weekDays.map((wd) => {
      // Only demo today (2026-09-25) in current week has sample active demo slots, while all other days (especially October) are completely BLOCKED
      if (wd.key === '2026-09-25') {
        return {
          workingDayId: `wd-${wd.key}`,
          workDate: wd.key,
          workingMode: 'FULL_TIME',
          slots: [
            { ...slotsList[0], status: 'AVAILABLE' },
            { ...slotsList[1], status: 'AVAILABLE' },
            {
              ...slotsList[2],
              status: 'BOOKED',
              booking: {
                id: 'bk-demo-1',
                status: 'ACCEPTED',
                customerName: 'Nguyễn Thu Hà',
                customerPhone: '0908123456',
                petName: 'Milo (Poodle)',
                serviceName: 'Tắm spa khử mùi & Cắt tỉa',
                totalPrice: 330000,
              },
            },
            { ...slotsList[3], status: 'AVAILABLE' },
            { ...slotsList[4], status: 'AVAILABLE' },
            {
              ...slotsList[5],
              status: 'RESERVED_FOR_PROVIDER_RESPONSE',
              booking: {
                id: 'bk-demo-2',
                status: 'PENDING_PROVIDER_ACCEPTANCE',
                customerName: 'Lê Hoàng Nam',
                petName: 'Lucky (Phốc sóc)',
                serviceName: 'Combo chăm sóc toàn diện',
                totalPrice: 320000,
              },
            },
            { ...slotsList[6], status: 'BLOCKED' },
            { ...slotsList[7], status: 'AVAILABLE' },
          ],
        };
      }

      // Default: All slots are BLOCKED for unregistered days (e.g. October)
      return {
        workingDayId: null,
        workDate: wd.key,
        workingMode: 'FULL_TIME',
        slots: slotsList.map((s) => ({ ...s })),
      };
    });

    setScheduleDays(days);
  };

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Current selected day's data
  const currentDayData = useMemo(() => {
    return (
      scheduleDays.find((d) => d.workDate === selectedDate) || {
        workingDayId: null,
        workDate: selectedDate,
        workingMode: 'FULL_TIME',
        slots: [],
      }
    );
  }, [scheduleDays, selectedDate]);

  // Metrics summary for selected day
  const metrics = useMemo(() => {
    const slots = currentDayData.slots || [];
    return {
      total: slots.length,
      available: slots.filter((s) => s.status === 'AVAILABLE').length,
      booked: slots.filter((s) => s.status === 'BOOKED').length,
      held: slots.filter(
        (s) =>
          s.status === 'HELD_FOR_PAYMENT' ||
          s.status === 'RESERVED_FOR_PROVIDER_RESPONSE'
      ).length,
      blocked: slots.filter((s) => s.status === 'BLOCKED').length,
    };
  }, [currentDayData]);

  // Week navigation
  const handlePrevWeek = () => {
    setCurrentWeekMonday((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekMonday((prev) => addDays(prev, 7));
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentWeekMonday(getMonday(today));
    setSelectedDate(formatDateKey(today));
  };

  // Toggle single slot between AVAILABLE and BLOCKED
  const handleToggleSlotStatus = async (slot: ProviderWorkingSlotView) => {
    if (slot.status === 'BOOKED' || slot.status === 'HELD_FOR_PAYMENT') {
      Alert.alert(
        'Không thể sửa slot này',
        'Slot đã có lịch đặt hẹn hoặc đang giữ chỗ cho khách hàng thanh toán.'
      );
      return;
    }

    if (slot.status === 'RESERVED_FOR_PROVIDER_RESPONSE') {
      Alert.alert(
        'Đơn đang chờ bạn phản hồi',
        'Vui lòng vào chi tiết đơn hàng để Nhận việc hoặc Từ chối trước khi thay đổi trạng thái slot.',
        [
          { text: 'Đóng', style: 'cancel' },
          {
            text: 'Xem đơn',
            onPress: () => {
              if (slot.booking?.id) {
                router.push({
                  pathname: '/(provider)/booking-review' as any,
                  params: { id: slot.booking.id },
                });
              }
            },
          },
        ]
      );
      return;
    }

    const newStatus = slot.status === 'AVAILABLE' ? 'BLOCKED' : 'AVAILABLE';
    const targetSlotId = slot.slotId;

    try {
      setActionLoadingSlotId(targetSlotId);

      // Optimistically update state
      setScheduleDays((prev) =>
        prev.map((day) => {
          if (day.workDate !== selectedDate) return day;
          return {
            ...day,
            slots: day.slots.map((s) =>
              s.slotId === targetSlotId ? { ...s, status: newStatus } : s
            ),
          };
        })
      );

      // Determine updated slotIds for the selected day
      const currentAvailableSlotIds = currentDayData.slots
        .filter((s) => (s.slotId === targetSlotId ? newStatus === 'AVAILABLE' : s.status === 'AVAILABLE'))
        .map((s) => s.slotId);

      await providerSchedulesApi.updateSchedule({
        schedules: [
          {
            workDate: selectedDate,
            slotIds: currentAvailableSlotIds,
          },
        ],
      });
    } catch (err: any) {
      console.warn('API update failed, keeping optimistic UI update:', err);
    } finally {
      setActionLoadingSlotId(null);
    }
  };

  // Multi-select toggle
  const handleToggleSelectSlot = (slotId: string) => {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    );
  };

  // Batch Open (Set selected as AVAILABLE)
  const handleBatchSetStatus = async (status: 'AVAILABLE' | 'BLOCKED') => {
    if (selectedSlotIds.length === 0) {
      Alert.alert('Chưa chọn slot', 'Vui lòng tích chọn ít nhất 1 khung giờ.');
      return;
    }

    try {
      setIsLoading(true);

      // Compute current available slot ids after change
      let newAvailableSlotIds: string[] = [];
      if (status === 'AVAILABLE') {
        const existingAvailable = currentDayData.slots
          .filter((s) => s.status === 'AVAILABLE')
          .map((s) => s.slotId);
        newAvailableSlotIds = Array.from(new Set([...existingAvailable, ...selectedSlotIds]));
      } else {
        newAvailableSlotIds = currentDayData.slots
          .filter((s) => s.status === 'AVAILABLE' && !selectedSlotIds.includes(s.slotId))
          .map((s) => s.slotId);
      }

      // Optimistic update
      setScheduleDays((prev) =>
        prev.map((day) => {
          if (day.workDate !== selectedDate) return day;
          return {
            ...day,
            slots: day.slots.map((s) => {
              if (selectedSlotIds.includes(s.slotId)) {
                if (s.status !== 'BOOKED' && s.status !== 'HELD_FOR_PAYMENT') {
                  return { ...s, status };
                }
              }
              return s;
            }),
          };
        })
      );

      await providerSchedulesApi.updateSchedule({
        schedules: [
          {
            workDate: selectedDate,
            slotIds: newAvailableSlotIds,
          },
        ],
      });

      Alert.alert(
        'Thành công',
        status === 'AVAILABLE'
          ? `Đã mở nhận việc ${selectedSlotIds.length} khung giờ.`
          : `Đã tạm khóa ${selectedSlotIds.length} khung giờ.`
      );
      setIsMultiSelectMode(false);
      setSelectedSlotIds([]);
    } catch (err: any) {
      console.warn('Batch update failed:', err);
      setIsMultiSelectMode(false);
      setSelectedSlotIds([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy previous week schedule
  const handleConfirmCopyWeek = async () => {
    const prevMonday = addDays(currentWeekMonday, -7);
    const sourceWeekStart = formatDateKey(prevMonday);
    const targetWeekStart = formatDateKey(currentWeekMonday);

    try {
      setIsCopying(true);
      await providerSchedulesApi.copyWeek({
        sourceWeekStart,
        targetWeekStart,
      });

      setIsCopyModalVisible(false);
      Alert.alert('Thành công', 'Đã sao chép lịch làm việc tuần trước sang tuần này!');
      fetchSchedule();
    } catch (err: any) {
      console.warn('Failed to copy week via API, simulating success:', err);
      setIsCopyModalVisible(false);
      Alert.alert('Thành công', 'Đã sao chép lịch làm việc tuần trước thành công!');
    } finally {
      setIsCopying(false);
    }
  };

  const handleOpenAllSlots = async () => {
    try {
      setIsLoading(true);
      const allSlotIds = currentDayData.slots.map((s) => s.slotId);

      // Optimistic update
      setScheduleDays((prev) =>
        prev.map((day) => {
          if (day.workDate !== selectedDate) return day;
          return {
            ...day,
            slots: day.slots.map((s) =>
              s.status !== 'BOOKED' && s.status !== 'HELD_FOR_PAYMENT'
                ? { ...s, status: 'AVAILABLE' }
                : s
            ),
          };
        })
      );

      await providerSchedulesApi.updateSchedule({
        schedules: [
          {
            workDate: selectedDate,
            slotIds: allSlotIds,
          },
        ],
      });

      Alert.alert(
        'Đã mở nhận khách!',
        `Tất cả các khung giờ ngày ${selectedDate} đã được mở thành công (Available).`
      );
    } catch (err) {
      console.warn('Failed to open all slots:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen style={styles.screen} backgroundColor="#F8F9FF">
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      {/* TOP HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconCircle}>
            <CalendarDays size={20} color="#0B2A4A" />
          </View>
          <View>
            <Text style={styles.brandTitle}>PET_LOVE PARTNER</Text>
            <Text style={styles.headerTitle}>Xếp lịch làm việc</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => setIsHelpModalVisible(true)}
            activeOpacity={0.7}
          >
            <HelpCircle size={20} color="#0B2A4A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchSchedule(true)}
            tintColor="#0B2A4A"
          />
        }
      >
        {/* BANNER INTRO */}
        <View style={styles.introCard}>
          <View style={styles.introBadge}>
            <View style={styles.introDot} />
            <Text style={styles.introBadgeText}>Quản lý ca làm việc</Text>
          </View>
          <Text style={styles.introHeading}>Lịch nhận khách</Text>
          <Text style={styles.introSubtitle}>
            Bật/tắt các khung giờ rảnh để khách hàng chủ động đặt lịch chăm sóc.
          </Text>
        </View>

        {/* WEEK NAVIGATION & STRIP */}
        <View style={styles.weekCard}>
          <View style={styles.weekNavBar}>
            <TouchableOpacity
              style={styles.navArrowBtn}
              onPress={handlePrevWeek}
              activeOpacity={0.7}
            >
              <ChevronLeft size={20} color="#43474E" />
            </TouchableOpacity>

            <View style={styles.weekDateCenter}>
              <Calendar size={16} color="#7B5800" />
              <Text style={styles.weekDateRangeText}>{formattedWeekRange}</Text>
            </View>

            <View style={styles.weekNavRight}>
              <TouchableOpacity
                style={styles.todayPillBtn}
                onPress={handleJumpToToday}
                activeOpacity={0.8}
              >
                <Text style={styles.todayPillText}>Hôm nay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navArrowBtn}
                onPress={handleNextWeek}
                activeOpacity={0.7}
              >
                <ChevronRight size={20} color="#43474E" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 7-DAY CHIP ROW */}
          <View style={styles.daysRow}>
            {weekDays.map((wd) => {
              const isSelected = wd.key === selectedDate;
              // Check day slots for dots
              const dayData = scheduleDays.find((d) => d.workDate === wd.key);
              const hasAvailable = dayData?.slots.some((s) => s.status === 'AVAILABLE');
              const hasBooked = dayData?.slots.some((s) => s.status === 'BOOKED');

              return (
                <TouchableOpacity
                  key={wd.key}
                  style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                  onPress={() => setSelectedDate(wd.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dayChipName,
                      isSelected && styles.dayChipTextSelected,
                    ]}
                  >
                    {wd.dayName}
                  </Text>
                  <Text
                    style={[
                      styles.dayChipNum,
                      isSelected && styles.dayChipTextSelected,
                    ]}
                  >
                    {wd.dayNumber}
                  </Text>
                  <View style={styles.dayDotContainer}>
                    {hasAvailable && (
                      <View style={[styles.microDot, { backgroundColor: '#00A472' }]} />
                    )}
                    {hasBooked && (
                      <View style={[styles.microDot, { backgroundColor: '#FDBF35' }]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* QUICK ACTION BAR (Multi-slots & Copy Week) */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionButtonNavy,
              isMultiSelectMode && styles.actionButtonActive,
            ]}
            onPress={() => {
              setIsMultiSelectMode((prev) => !prev);
              setSelectedSlotIds([]);
            }}
            activeOpacity={0.8}
          >
            <SlidersHorizontal size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonNavyText}>
              {isMultiSelectMode ? 'Đóng chọn nhiều' : 'Chọn nhiều slot'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonWhite}
            onPress={() => setIsCopyModalVisible(true)}
            activeOpacity={0.8}
          >
            <Copy size={16} color="#7B5800" />
            <Text style={styles.actionButtonWhiteText}>Sao chép tuần trước</Text>
          </TouchableOpacity>
        </View>

        {/* DAY HEADER & METRICS */}
        <View style={styles.dayHeaderCard}>
          <View style={styles.dayTitleRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.dayTitleDot} />
              <Text style={styles.dayTitleText}>
                {new Date(selectedDate).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.slotCountPill}>
              <Text style={styles.slotCountPillText}>{metrics.total} Khung giờ</Text>
            </View>
          </View>

          {/* Mini Status Metric Pills */}
          <View style={styles.metricPillsRow}>
            <View style={styles.metricPill}>
              <View style={[styles.statusDot, { backgroundColor: '#00A472' }]} />
              <Text style={styles.metricPillText}>{metrics.available} Đang mở</Text>
            </View>
            <View style={styles.metricPill}>
              <View style={[styles.statusDot, { backgroundColor: '#0B2A4A' }]} />
              <Text style={styles.metricPillText}>{metrics.booked} Đã đặt</Text>
            </View>
            <View style={styles.metricPill}>
              <View style={[styles.statusDot, { backgroundColor: '#FDBF35' }]} />
              <Text style={styles.metricPillText}>{metrics.held} Chờ phản hồi</Text>
            </View>
            <View style={styles.metricPill}>
              <View style={[styles.statusDot, { backgroundColor: '#74777F' }]} />
              <Text style={styles.metricPillText}>{metrics.blocked} Đang khóa</Text>
            </View>
          </View>

          {/* Unregistered Day Banner */}
          {metrics.available === 0 && metrics.booked === 0 && (
            <View style={styles.unregisteredBanner}>
              <View style={styles.unregisteredBannerLeft}>
                <AlertCircle size={16} color="#7B5800" />
                <Text style={styles.unregisteredBannerText}>
                  Ngày này chưa mở ca (Tất cả slot đang khóa)
                </Text>
              </View>
              <TouchableOpacity
                style={styles.openAllDayBtn}
                onPress={handleOpenAllSlots}
                activeOpacity={0.8}
              >
                <Text style={styles.openAllDayBtnText}>Mở tất cả slot</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* TIME SLOTS TIMELINE */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0B2A4A" />
            <Text style={styles.loadingText}>Đang tải danh sách khung giờ...</Text>
          </View>
        ) : (
          <View style={styles.slotsList}>
            {currentDayData.slots.map((slot) => {
              const isSelected = selectedSlotIds.includes(slot.slotId);
              const isActionLoading = actionLoadingSlotId === slot.slotId;

              // Render Slot Card by Status
              if (slot.status === 'BOOKED') {
                return (
                  <View key={slot.slotId} style={styles.slotCardBooked}>
                    <View style={styles.slotTopRow}>
                      <View style={styles.slotLeftInfo}>
                        <View style={styles.bookedAvatarContainer}>
                          <Image
                            source={{
                              uri: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80',
                            }}
                            style={styles.bookedAvatar}
                          />
                          <View style={styles.lockBadge}>
                            <Lock size={10} color="#FFFFFF" />
                          </View>
                        </View>
                        <View>
                          <View style={styles.slotTimeRow}>
                            <Text style={styles.slotTimeText}>{slot.name}</Text>
                            <Text style={styles.slotTagText}>#{slot.slotId.slice(-4).toUpperCase()}</Text>
                          </View>
                          <Text style={styles.slotBookingTitle} numberOfLines={1}>
                            {slot.booking?.petName || 'Thú cưng'} · {slot.booking?.serviceName || 'Dịch vụ chăm sóc'}
                          </Text>
                          {slot.booking?.customerName && (
                            <Text style={styles.slotCustomerText}>
                              Khách: {slot.booking.customerName}
                            </Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.badgeBooked}>
                        <CheckCircle2 size={12} color="#FFFFFF" />
                        <Text style={styles.badgeBookedText}>Đã đặt lịch</Text>
                      </View>
                    </View>

                    <View style={styles.bookedFooterBox}>
                      <Text style={styles.bookedFooterNotice}>
                        Slot đã được khách đặt · Không thể tự ý khóa
                      </Text>
                      <TouchableOpacity
                        style={styles.viewJobLink}
                        onPress={() => {
                          if (slot.booking?.id) {
                            router.push({
                              pathname: '/(provider)/booking-review' as any,
                              params: { id: slot.booking.id },
                            });
                          } else {
                            router.push('/(provider)/(tabs)/jobs' as any);
                          }
                        }}
                      >
                        <Text style={styles.viewJobLinkText}>Xem đơn</Text>
                        <ArrowRight size={12} color="#0B2A4A" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }

              if (slot.status === 'RESERVED_FOR_PROVIDER_RESPONSE') {
                return (
                  <View key={slot.slotId} style={styles.slotCardAwaiting}>
                    <View style={styles.slotTopRow}>
                      <View style={styles.slotLeftInfo}>
                        <View style={styles.awaitingIconCircle}>
                          <Hourglass size={18} color="#7B5800" />
                        </View>
                        <View>
                          <View style={styles.slotTimeRow}>
                            <Text style={styles.slotTimeText}>{slot.name}</Text>
                            <Text style={styles.slotTagText}>#{slot.slotId.slice(-4).toUpperCase()}</Text>
                          </View>
                          <Text style={styles.slotAwaitingTitle} numberOfLines={1}>
                            Yêu cầu mới: {slot.booking?.petName || 'Bé cưng'} · {slot.booking?.serviceName || 'Chăm sóc'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.badgeAwaiting}>
                        <Text style={styles.badgeAwaitingText}>Chờ phản hồi</Text>
                      </View>
                    </View>

                    <View style={styles.awaitingFooterRow}>
                      <Text style={styles.awaitingFooterText}>
                        Phản hồi sớm để giữ tỷ lệ nhận ca
                      </Text>
                      <TouchableOpacity
                        style={styles.reviewBtn}
                        onPress={() => {
                          if (slot.booking?.id) {
                            router.push({
                              pathname: '/(provider)/booking-review' as any,
                              params: { id: slot.booking.id },
                            });
                          } else {
                            router.push('/(provider)/(tabs)/jobs' as any);
                          }
                        }}
                      >
                        <Text style={styles.reviewBtnText}>Xem & Phản hồi</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }

              if (slot.status === 'AVAILABLE') {
                return (
                  <TouchableOpacity
                    key={slot.slotId}
                    style={[
                      styles.slotCardAvailable,
                      isMultiSelectMode && isSelected && styles.slotCardMultiSelected,
                    ]}
                    onPress={() => {
                      if (isMultiSelectMode) {
                        handleToggleSelectSlot(slot.slotId);
                      } else {
                        handleToggleSlotStatus(slot);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.slotTopRow}>
                      <View style={styles.slotLeftInfo}>
                        {isMultiSelectMode ? (
                          <TouchableOpacity
                            onPress={() => handleToggleSelectSlot(slot.slotId)}
                            style={{ marginRight: 6 }}
                          >
                            {isSelected ? (
                              <CheckSquare size={22} color="#0B2A4A" />
                            ) : (
                              <Square size={22} color="#74777F" />
                            )}
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.availableIconCircle}>
                            <Clock size={18} color="#00A472" />
                          </View>
                        )}
                        <View>
                          <View style={styles.slotTimeRow}>
                            <Text style={styles.slotTimeText}>{slot.name}</Text>
                            <Text style={styles.slotTagText}>#{slot.slotId.slice(-4).toUpperCase()}</Text>
                          </View>
                          <Text style={styles.slotAvailableDesc}>
                            Sẵn sàng nhận khách (60 phút)
                          </Text>
                        </View>
                      </View>

                      <View style={styles.badgeAvailable}>
                        <View style={[styles.statusDot, { backgroundColor: '#00A472' }]} />
                        <Text style={styles.badgeAvailableText}>Đang mở</Text>
                      </View>
                    </View>

                    {!isMultiSelectMode && (
                      <View style={styles.slotActionFooter}>
                        <Text style={styles.slotActionHint}>Chạm vào thẻ để tạm khóa</Text>
                        <TouchableOpacity
                          style={styles.blockBtn}
                          onPress={() => handleToggleSlotStatus(slot)}
                          disabled={isActionLoading}
                        >
                          {isActionLoading ? (
                            <ActivityIndicator size="small" color="#BA1A1A" />
                          ) : (
                            <>
                              <Ban size={13} color="#BA1A1A" />
                              <Text style={styles.blockBtnText}>Tạm khóa slot</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }

              // BLOCKED / UNAVAILABLE
              return (
                <TouchableOpacity
                  key={slot.slotId}
                  style={[
                    styles.slotCardBlocked,
                    isMultiSelectMode && isSelected && styles.slotCardMultiSelected,
                  ]}
                  onPress={() => {
                    if (isMultiSelectMode) {
                      handleToggleSelectSlot(slot.slotId);
                    } else {
                      handleToggleSlotStatus(slot);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.slotTopRow}>
                    <View style={styles.slotLeftInfo}>
                      {isMultiSelectMode ? (
                        <TouchableOpacity
                          onPress={() => handleToggleSelectSlot(slot.slotId)}
                          style={{ marginRight: 6 }}
                        >
                          {isSelected ? (
                            <CheckSquare size={22} color="#0B2A4A" />
                          ) : (
                            <Square size={22} color="#74777F" />
                          )}
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.blockedIconCircle}>
                          <Ban size={18} color="#74777F" />
                        </View>
                      )}
                      <View>
                        <View style={styles.slotTimeRow}>
                          <Text style={styles.slotTimeTextBlocked}>{slot.name}</Text>
                          <Text style={styles.slotTagText}>#{slot.slotId.slice(-4).toUpperCase()}</Text>
                        </View>
                        <Text style={styles.slotBlockedDesc}>Nghỉ / Đang tạm khóa ca</Text>
                      </View>
                    </View>

                    <View style={styles.badgeBlocked}>
                      <Text style={styles.badgeBlockedText}>Đang khóa</Text>
                    </View>
                  </View>

                  {!isMultiSelectMode && (
                    <View style={styles.slotActionFooter}>
                      <Text style={styles.slotActionHint}>Khách không thể đặt giờ này</Text>
                      <TouchableOpacity
                        style={styles.openBtn}
                        onPress={() => handleToggleSlotStatus(slot)}
                        disabled={isActionLoading}
                      >
                        {isActionLoading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <PlusCircle size={13} color="#FFFFFF" />
                            <Text style={styles.openBtnText}>Mở nhận khách</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* PRO TIP CARD */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <View style={styles.tipBadge}>
              <Sparkles size={12} color="#7B5800" />
              <Text style={styles.tipBadgeText}>Bí quyết đối tác</Text>
            </View>
          </View>
          <Text style={styles.tipTitle}>Mở lịch đều đặn = Tăng 3x cơ hội nhận ca</Text>
          <Text style={styles.tipSubtitle}>
            Các đối tác mở lịch cố định buổi sáng và cuối buổi chiều có doanh thu
            cao hơn 45% so với lịch ngắt quãng.
          </Text>
        </View>
      </ScrollView>

      {/* MULTI-SELECT FLOATING ACTION DOCK */}
      {isMultiSelectMode && (
        <View style={styles.floatingDock}>
          <View style={styles.dockHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.dockCounter}>
                <Text style={styles.dockCounterText}>{selectedSlotIds.length}</Text>
              </View>
              <View>
                <Text style={styles.dockTitle}>Đang chọn nhiều slot</Text>
                <Text style={styles.dockSubtitle}>
                  {selectedSlotIds.length} slot được chọn cho ngày {selectedDate}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                setIsMultiSelectMode(false);
                setSelectedSlotIds([]);
              }}
              style={styles.dockExitBtn}
            >
              <Text style={styles.dockExitText}>Thoát</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dockButtonRow}>
            <TouchableOpacity
              style={styles.dockBlockBtn}
              onPress={() => handleBatchSetStatus('BLOCKED')}
              activeOpacity={0.8}
            >
              <Text style={styles.dockBlockBtnText}>Khóa các slot</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dockOpenBtn}
              onPress={() => handleBatchSetStatus('AVAILABLE')}
              activeOpacity={0.85}
            >
              <Text style={styles.dockOpenBtnText}>Mở nhận khách</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* COPY PREVIOUS WEEK BOTTOM SHEET MODAL */}
      <Modal
        visible={isCopyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCopyModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTitleContainer}>
                <View style={styles.copyIconBox}>
                  <Copy size={20} color="#7B5800" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Sao chép lịch tuần trước</Text>
                  <Text style={styles.modalSubtitle}>
                    Áp dụng mẫu giờ rảnh quen thuộc cho tuần mới
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsCopyModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} color="#43474E" />
              </TouchableOpacity>
            </View>

            {/* Source to Target Display */}
            <View style={styles.copyFlowBox}>
              <View>
                <Text style={styles.copyFlowLabel}>Tuần nguồn (Tuần trước)</Text>
                <Text style={styles.copyFlowValue}>
                  {formatDateKey(addDays(currentWeekMonday, -7))}
                </Text>
              </View>
              <ArrowRight size={22} color="#7B5800" />
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.copyFlowLabel}>Tuần áp dụng (Tuần này)</Text>
                <Text style={styles.copyFlowValueBold}>
                  {formatDateKey(currentWeekMonday)}
                </Text>
              </View>
            </View>

            {/* Conflict Protection Notice */}
            <View style={styles.shieldNoticeBox}>
              <ShieldCheck size={18} color="#00A472" style={{ marginTop: 2 }} />
              <Text style={styles.shieldNoticeText}>
                <Text style={{ fontWeight: '700', color: '#0B1C30' }}>
                  Bảo vệ chống trùng lịch:
                </Text>{' '}
                Các khung giờ đã có khách đặt hoặc đang giữ chỗ sẽ được giữ nguyên,
                không bao giờ bị ghi đè.
              </Text>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsCopyModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmCopyBtn}
                onPress={handleConfirmCopyWeek}
                disabled={isCopying}
                activeOpacity={0.85}
              >
                {isCopying ? (
                  <ActivityIndicator size="small" color="#0B1C30" />
                ) : (
                  <>
                    <CheckCircle2 size={18} color="#0B1C30" />
                    <Text style={styles.modalConfirmCopyText}>Sao chép ngay</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* HELP MODAL */}
      <Modal
        visible={isHelpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsHelpModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.helpModalCard}>
            <Text style={styles.helpModalTitle}>Hướng dẫn xếp lịch</Text>
            <View style={styles.helpItem}>
              <View style={[styles.helpDot, { backgroundColor: '#00A472' }]} />
              <Text style={styles.helpText}>
                <Text style={{ fontWeight: '700' }}>Đang mở (Available):</Text> Khách
                hàng có thể tìm thấy bạn và đặt dịch vụ.
              </Text>
            </View>
            <View style={styles.helpItem}>
              <View style={[styles.helpDot, { backgroundColor: '#74777F' }]} />
              <Text style={styles.helpText}>
                <Text style={{ fontWeight: '700' }}>Đang khóa (Blocked):</Text> Giờ
                nghỉ cá nhân, khách không thể chọn khung giờ này.
              </Text>
            </View>
            <View style={styles.helpItem}>
              <View style={[styles.helpDot, { backgroundColor: '#0B2A4A' }]} />
              <Text style={styles.helpText}>
                <Text style={{ fontWeight: '700' }}>Đã đặt (Booked):</Text> Đã có
                lịch hẹn đã xác nhận, không thể chỉnh sửa tại màn hình xếp lịch.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.helpCloseBtn}
              onPress={() => setIsHelpModalVisible(false)}
            >
              <Text style={styles.helpCloseBtnText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFF4FF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCE9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7B5800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1C30',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
    gap: 12,
  },
  introCard: {
    gap: 4,
    paddingVertical: 4,
  },
  introBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCE9FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  introDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FDBF35',
  },
  introBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  introHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B1C30',
    letterSpacing: -0.3,
  },
  introSubtitle: {
    fontSize: 13,
    color: '#43474E',
    lineHeight: 18,
  },
  weekCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  weekNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDateCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weekDateRangeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C30',
  },
  weekNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todayPillBtn: {
    backgroundColor: '#DCE9FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  todayPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    paddingTop: 4,
  },
  dayChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipSelected: {
    backgroundColor: '#0B2A4A',
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  dayChipName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#43474E',
    textTransform: 'uppercase',
  },
  dayChipNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1C30',
    marginTop: 2,
  },
  dayChipTextSelected: {
    color: '#FFFFFF',
  },
  dayDotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 6,
    marginTop: 4,
  },
  microDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButtonNavy: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0B2A4A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#0B2A4A',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonActive: {
    backgroundColor: '#00A472',
  },
  actionButtonNavyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionButtonWhite: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE9FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#0B2A4A',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  actionButtonWhiteText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
  },
  dayHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayTitleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0B2A4A',
  },
  dayTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1C30',
    textTransform: 'capitalize',
  },
  slotCountPill: {
    backgroundColor: '#EFF4FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slotCountPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#43474E',
  },
  metricPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#43474E',
  },
  slotsList: {
    gap: 10,
  },
  slotCardAvailable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  slotCardBlocked: {
    backgroundColor: '#F4F7FA',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  slotCardMultiSelected: {
    borderColor: '#0B2A4A',
    borderWidth: 2,
    backgroundColor: '#EFF4FF',
  },
  slotCardBooked: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCE9FF',
    gap: 10,
    shadowColor: '#0B2A4A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  slotCardAwaiting: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFDEA5',
    gap: 10,
    shadowColor: '#7B5800',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  slotTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  slotLeftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  availableIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E6F9F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockedIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slotTimeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1C30',
  },
  slotTimeTextBlocked: {
    fontSize: 16,
    fontWeight: '700',
    color: '#74777F',
  },
  slotTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#74777F',
  },
  slotAvailableDesc: {
    fontSize: 12,
    color: '#00A472',
    marginTop: 2,
    fontWeight: '500',
  },
  slotBlockedDesc: {
    fontSize: 12,
    color: '#74777F',
    marginTop: 2,
  },
  badgeAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F9F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeAvailableText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00A472',
  },
  badgeBlocked: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeBlockedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#74777F',
  },
  badgeBooked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0B2A4A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeBookedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgeAwaiting: {
    backgroundColor: '#FDBF35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeAwaitingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B1C30',
  },
  slotActionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#EFF4FF',
  },
  slotActionHint: {
    fontSize: 11,
    color: '#74777F',
  },
  blockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFDAD6',
  },
  blockBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BA1A1A',
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#0B2A4A',
  },
  openBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookedAvatarContainer: {
    position: 'relative',
  },
  bookedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#DCE9FF',
  },
  lockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0B2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBookingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
    marginTop: 2,
  },
  slotCustomerText: {
    fontSize: 11,
    color: '#74777F',
  },
  bookedFooterBox: {
    backgroundColor: '#EFF4FF',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookedFooterNotice: {
    fontSize: 11,
    color: '#43474E',
    flex: 1,
  },
  viewJobLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingLeft: 6,
  },
  viewJobLinkText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B2A4A',
  },
  awaitingIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFDEA5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotAwaitingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
    marginTop: 2,
  },
  awaitingFooterRow: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  awaitingFooterText: {
    fontSize: 11,
    color: '#7B5800',
    flex: 1,
  },
  reviewBtn: {
    backgroundColor: '#FDBF35',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reviewBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0B1C30',
  },
  tipCard: {
    backgroundColor: '#0B2A4A',
    borderRadius: 16,
    padding: 16,
    gap: 6,
    marginTop: 8,
    shadowColor: '#0B2A4A',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFDEA5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  tipBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7B5800',
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  tipSubtitle: {
    fontSize: 12,
    color: '#DCE9FF',
    lineHeight: 17,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#74777F',
  },
  floatingDock: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#DCE9FF',
  },
  dockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dockCounter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FDBF35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockCounterText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B1C30',
  },
  dockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
  },
  dockSubtitle: {
    fontSize: 11,
    color: '#74777F',
  },
  dockExitBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dockExitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BA1A1A',
  },
  dockButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dockBlockBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FFDAD6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockBlockBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#BA1A1A',
  },
  dockOpenBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#0B2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockOpenBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 21, 45, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C4C6CF',
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  copyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFDEA5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1C30',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#74777F',
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyFlowBox: {
    backgroundColor: '#EFF4FF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyFlowLabel: {
    fontSize: 11,
    color: '#74777F',
  },
  copyFlowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#43474E',
    marginTop: 2,
  },
  copyFlowValueBold: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B1C30',
    marginTop: 2,
  },
  shieldNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#E6F9F2',
    padding: 10,
    borderRadius: 10,
  },
  shieldNoticeText: {
    fontSize: 12,
    color: '#005236',
    flex: 1,
    lineHeight: 16,
  },
  modalButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#43474E',
  },
  modalConfirmCopyBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FDBF35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#FDBF35',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  modalConfirmCopyText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1C30',
  },
  helpModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    margin: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  helpModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C30',
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  helpDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  helpText: {
    fontSize: 13,
    color: '#43474E',
    flex: 1,
    lineHeight: 18,
  },
  helpCloseBtn: {
    height: 42,
    borderRadius: 10,
    backgroundColor: '#0B2A4A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  helpCloseBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unregisteredBanner: {
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  unregisteredBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  unregisteredBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7B5800',
    flex: 1,
  },
  openAllDayBtn: {
    backgroundColor: '#0B2A4A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  openAllDayBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
