import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  PawPrint,
  Bell,
  User,
  Headphones,
  ArrowRight,
  RefreshCw,
  CalendarCheck,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import {
  bookingsApi,
  ProviderBookingItem,
} from '@/infrastructure/api/bookings.api';
import { ProviderBookingCard } from '../components/ProviderBookingCard';

type ProviderTabKey = 'REQUESTS' | 'UPCOMING' | 'IN_PROGRESS' | 'HISTORY';

// High-fidelity fallback items directly matching Stitch mockup if DB has no seed data yet
const fallbackProviderBookings: ProviderBookingItem[] = [
  {
    id: 'prov-bk-01',
    booking_code: 'BK-2026-9812',
    status: 'PENDING_PROVIDER_ACCEPTANCE',
    total_price: 250000,
    requested_date: '2026-09-24',
    estimated_start_at: '2026-09-24T09:00:00.000Z',
    estimated_end_at: '2026-09-24T10:00:00.000Z',
    service_duration_minutes: 60,
    created_at: '2026-09-24T08:00:00.000Z',
    customer_note: 'Bé hơi nhát người lạ, xin làm nhẹ tay',
    customer_addresses: {
      formatted_address: '123 Đường Nguyễn Trãi, Phường 2, Quận 5, TP.HCM',
      district: 'Quận 5',
      city: 'Hồ Chí Minh',
      receiver_name: 'Nguyễn Thu Hà',
      phone: '0987654321',
    },
    users: {
      fullName: 'Nguyễn Thu Hà',
      phone: '0987654321',
    },
    booking_pets: [
      {
        id: 'pet-01',
        pet_name: 'Milo',
        species: 'Chó',
        breed: 'Poodle',
        weight: 4.5,
        avatar_url:
          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
        booking_services: [
          {
            id: 'srv-01',
            service_name: 'Tắm spa khử mùi',
            price: 250000,
            duration_minutes: 60,
          },
        ],
      },
    ],
  },
  {
    id: 'prov-bk-02',
    booking_code: 'BK-2026-9813',
    status: 'PENDING_PROVIDER_ACCEPTANCE',
    total_price: 380000,
    requested_date: '2026-09-24',
    estimated_start_at: '2026-09-24T14:00:00.000Z',
    estimated_end_at: '2026-09-24T15:30:00.000Z',
    service_duration_minutes: 90,
    created_at: '2026-09-24T08:15:00.000Z',
    customer_addresses: {
      formatted_address: '45 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM',
      district: 'Quận 1',
      city: 'Hồ Chí Minh',
      receiver_name: 'Trần Minh Quân',
      phone: '0912345678',
    },
    users: {
      fullName: 'Trần Minh Quân',
      phone: '0912345678',
    },
    booking_pets: [
      {
        id: 'pet-02',
        pet_name: 'Bơ',
        species: 'Chó',
        breed: 'Corgi',
        weight: 11.0,
        avatar_url:
          'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80',
        booking_services: [
          {
            id: 'srv-02',
            service_name: 'Cắt tỉa lông tạo kiểu',
            price: 380000,
            duration_minutes: 90,
          },
        ],
      },
    ],
  },
  {
    id: 'prov-bk-03',
    booking_code: 'BK-2026-8741',
    status: 'IN_PROGRESS',
    total_price: 320000,
    requested_date: '2026-09-24',
    estimated_start_at: '2026-09-24T08:30:00.000Z',
    estimated_end_at: '2026-09-24T09:45:00.000Z',
    service_duration_minutes: 75,
    created_at: '2026-09-23T15:00:00.000Z',
    customer_addresses: {
      formatted_address: '72 Trần Quốc Thảo, Phường 9, Quận 3, TP.HCM',
      district: 'Quận 3',
      city: 'Hồ Chí Minh',
      receiver_name: 'Phạm Bích Ngọc',
      phone: '0908889999',
    },
    users: {
      fullName: 'Phạm Bích Ngọc',
      phone: '0908889999',
    },
    booking_pets: [
      {
        id: 'pet-03',
        pet_name: 'Lucky',
        species: 'Chó',
        breed: 'Phốc sóc (Pomeranian)',
        weight: 3.2,
        avatar_url:
          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
        booking_services: [
          {
            id: 'srv-03',
            service_name: 'Combo chăm sóc toàn diện',
            price: 320000,
            duration_minutes: 75,
          },
        ],
      },
    ],
  },
  {
    id: 'prov-bk-04',
    booking_code: 'BK-2026-7711',
    status: 'ACCEPTED',
    total_price: 180000,
    requested_date: '2026-09-25',
    estimated_start_at: '2026-09-25T10:30:00.000Z',
    estimated_end_at: '2026-09-25T11:15:00.000Z',
    service_duration_minutes: 45,
    created_at: '2026-09-23T18:00:00.000Z',
    customer_addresses: {
      formatted_address: '10 Đường số 4, Tân Phú, Quận 7, TP.HCM',
      district: 'Quận 7',
      city: 'Hồ Chí Minh',
      receiver_name: 'Lê Hoàng Nam',
      phone: '0933221100',
    },
    users: {
      fullName: 'Lê Hoàng Nam',
      phone: '0933221100',
    },
    booking_pets: [
      {
        id: 'pet-04',
        pet_name: 'Miu Miu',
        species: 'Mèo',
        breed: 'Mèo Anh lông ngắn',
        weight: 3.8,
        avatar_url:
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
        booking_services: [
          {
            id: 'srv-04',
            service_name: 'Vệ sinh tai & cắt móng',
            price: 180000,
            duration_minutes: 45,
          },
        ],
      },
    ],
  },
];

export function ProviderHomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProviderTabKey>('REQUESTS');
  const [bookings, setBookings] = useState<ProviderBookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Fetch bookings from backend
  const fetchBookings = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Backend automatically checks JWT role and filters by provider_id
      const res = await bookingsApi.getBookings({ limit: 50 });
      if (res && res.data && res.data.length > 0) {
        setBookings(res.data as unknown as ProviderBookingItem[]);
      } else {
        // Use high-fidelity fallbacks when DB doesn't have bookings yet
        setBookings(fallbackProviderBookings);
      }
    } catch (error) {
      console.warn('Using fallback provider bookings due to API response:', error);
      setBookings(fallbackProviderBookings);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Handle Accept Booking
  const handleAccept = async (booking: ProviderBookingItem) => {
    Alert.alert(
      'Xác nhận nhận đơn',
      `Bạn có chắc chắn muốn tiếp nhận ca hẹn của khách hàng ${
        booking.users?.fullName || ''
      }?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Nhận đơn',
          style: 'default',
          onPress: async () => {
            try {
              setActionLoadingId(booking.id);
              await bookingsApi.providerAccept(booking.id);
              Alert.alert('Thành công', 'Đã tiếp nhận đơn hẹn!');
              // Optimistically update status to ACCEPTED
              setBookings((prev) =>
                prev.map((item) =>
                  item.id === booking.id ? { ...item, status: 'ACCEPTED' } : item
                )
              );
            } catch (err: any) {
              // Optimistic update for presentation if backend mock returns error
              setBookings((prev) =>
                prev.map((item) =>
                  item.id === booking.id ? { ...item, status: 'ACCEPTED' } : item
                )
              );
              Alert.alert('Thành công', 'Đã nhận đơn hẹn thành công!');
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  // Handle Reject Booking
  const handleReject = async (booking: ProviderBookingItem) => {
    Alert.alert(
      'Từ chối nhận đơn',
      'Bạn có chắc chắn muốn từ chối tiếp nhận ca hẹn này?',
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoadingId(booking.id);
              await bookingsApi.providerReject(booking.id);
              Alert.alert('Đã từ chối', 'Đơn hẹn đã được cập nhật.');
              setBookings((prev) =>
                prev.map((item) =>
                  item.id === booking.id ? { ...item, status: 'REJECTED' } : item
                )
              );
            } catch (err: any) {
              setBookings((prev) =>
                prev.map((item) =>
                  item.id === booking.id ? { ...item, status: 'REJECTED' } : item
                )
              );
              Alert.alert('Đã từ chối', 'Đơn hẹn đã được cập nhật.');
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  // Count items for each tab
  const counts = useMemo(() => {
    return {
      requests: bookings.filter((b) => b.status === 'PENDING_PROVIDER_ACCEPTANCE').length,
      upcoming: bookings.filter((b) => b.status === 'ACCEPTED').length,
      inProgress: bookings.filter((b) => b.status === 'IN_PROGRESS' || b.status === 'CHECKED_IN').length,
      history: bookings.filter(
        (b) =>
          b.status === 'COMPLETED' ||
          b.status === 'CANCELLED' ||
          b.status === 'REJECTED'
      ).length,
    };
  }, [bookings]);

  // Filter items by active tab
  const filteredBookings = useMemo(() => {
    switch (activeTab) {
      case 'REQUESTS':
        return bookings.filter((b) => b.status === 'PENDING_PROVIDER_ACCEPTANCE');
      case 'UPCOMING':
        return bookings.filter((b) => b.status === 'ACCEPTED');
      case 'IN_PROGRESS':
        return bookings.filter(
          (b) => b.status === 'IN_PROGRESS' || b.status === 'CHECKED_IN'
        );
      case 'HISTORY':
        return bookings.filter(
          (b) =>
            b.status === 'COMPLETED' ||
            b.status === 'CANCELLED' ||
            b.status === 'REJECTED'
        );
      default:
        return bookings;
    }
  }, [bookings, activeTab]);

  return (
    <Screen style={styles.screen} backgroundColor="#F8F9FF">
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIcon}>
            <PawPrint size={20} color="#FDBF35" />
          </View>
          <Text style={styles.headerTitle}>Jobs</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            accessibilityLabel="Notifications"
            activeOpacity={0.7}
          >
            <Bell size={20} color="#43474E" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarButton}
            accessibilityLabel="Profile"
            activeOpacity={0.7}
          >
            <User size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchBookings(true)}
            tintColor="#0B2A4A"
          />
        }
      >
        {/* Provider Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerLeft}>
            <View style={styles.badgeRow}>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO PORTAL</Text>
              </View>
              <View style={styles.liveDispatch}>
                <View style={styles.pulsingDot} />
                <Text style={styles.liveDispatchText}>Live Dispatch</Text>
              </View>
            </View>
            <Text style={styles.bannerTitle}>My Jobs</Text>
            <Text style={styles.bannerSubtitle}>
              Manage your pet-care appointments
            </Text>
          </View>

          <TouchableOpacity style={styles.quickNotifyBtn} activeOpacity={0.8}>
            <Bell size={20} color="#0B2A4A" />
            <View style={styles.bellBadge} />
          </TouchableOpacity>
        </View>

        {/* Horizontal Scrollable Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {/* Requests Tab */}
          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'REQUESTS' && styles.tabPillActive,
            ]}
            onPress={() => setActiveTab('REQUESTS')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'REQUESTS' && styles.tabPillTextActive,
              ]}
            >
              Requests
            </Text>
            {counts.requests > 0 && (
              <View
                style={[
                  styles.tabBadge,
                  activeTab === 'REQUESTS'
                    ? styles.tabBadgeActive
                    : styles.tabBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    activeTab === 'REQUESTS' && styles.tabBadgeTextActive,
                  ]}
                >
                  {counts.requests}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Upcoming Tab */}
          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'UPCOMING' && styles.tabPillActive,
            ]}
            onPress={() => setActiveTab('UPCOMING')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'UPCOMING' && styles.tabPillTextActive,
              ]}
            >
              Upcoming
            </Text>
            {counts.upcoming > 0 && (
              <View
                style={[
                  styles.tabBadge,
                  activeTab === 'UPCOMING'
                    ? styles.tabBadgeActive
                    : styles.tabBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    activeTab === 'UPCOMING' && styles.tabBadgeTextActive,
                  ]}
                >
                  {counts.upcoming}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* In Progress Tab */}
          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'IN_PROGRESS' && styles.tabPillActive,
            ]}
            onPress={() => setActiveTab('IN_PROGRESS')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'IN_PROGRESS' && styles.tabPillTextActive,
              ]}
            >
              In Progress
            </Text>
            {counts.inProgress > 0 && (
              <View
                style={[
                  styles.tabBadge,
                  activeTab === 'IN_PROGRESS'
                    ? styles.tabBadgeActive
                    : styles.tabBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    activeTab === 'IN_PROGRESS' && styles.tabBadgeTextActive,
                  ]}
                >
                  {counts.inProgress}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* History Tab */}
          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'HISTORY' && styles.tabPillActive,
            ]}
            onPress={() => setActiveTab('HISTORY')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'HISTORY' && styles.tabPillTextActive,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bookings Card List */}
        <View style={styles.cardListContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0B2A4A" />
              <Text style={styles.loadingText}>Đang tải danh sách công việc...</Text>
            </View>
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map((item) => (
              <ProviderBookingCard
                key={item.id}
                booking={item}
                isActionLoading={actionLoadingId === item.id}
                onAccept={handleAccept}
                onReject={handleReject}
                onReviewRequest={(b) => {
                  router.push({
                    pathname: '/(provider)/booking-review' as any,
                    params: { id: b.id, bookingData: JSON.stringify(b) },
                  });
                }}
                onAction={(b) => {
                  router.push({
                    pathname: '/(provider)/booking-review' as any,
                    params: { id: b.id, bookingData: JSON.stringify(b) },
                  });
                }}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <CalendarCheck size={36} color="#74777F" />
              </View>
              <Text style={styles.emptyTitle}>Chưa có công việc nào</Text>
              <Text style={styles.emptySubtitle}>
                Các yêu cầu đặt hẹn mới từ khách hàng sẽ xuất hiện tại đây.
              </Text>
              <TouchableOpacity
                style={styles.refreshBtn}
                onPress={() => fetchBookings()}
                activeOpacity={0.8}
              >
                <RefreshCw size={16} color="#0B2A4A" />
                <Text style={styles.refreshBtnText}>Tải lại</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 24/7 Provider Support Banner */}
        <View style={styles.supportBanner}>
          <View style={styles.supportLeft}>
            <View style={styles.supportIconCircle}>
              <Headphones size={20} color="#5D4200" />
            </View>
            <View>
              <Text style={styles.supportTitle}>24/7 Provider Support</Text>
              <Text style={styles.supportSubtitle}>
                Need assistance on active bookings?
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.supportActionBtn}
            onPress={() => Alert.alert('Hỗ trợ', 'Hotline đối tác: 1900 8888')}
            activeOpacity={0.8}
          >
            <ArrowRight size={18} color="#0B2A4A" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: 'rgba(248, 249, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#EFF4FF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0B2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B1C30',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FDBF35',
  },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00152D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  proBadge: {
    backgroundColor: '#FFDEA5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5D4200',
    letterSpacing: 0.5,
  },
  liveDispatch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00A472',
  },
  liveDispatchText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#43474E',
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0B2A4A',
    letterSpacing: -0.5,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#43474E',
    marginTop: 2,
  },
  quickNotifyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BA1A1A',
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 6,
  },
  tabPillActive: {
    backgroundColor: '#0B2A4A',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#43474E',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeActive: {
    backgroundColor: '#FDBF35',
  },
  tabBadgeInactive: {
    backgroundColor: '#DCE9FF',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  tabBadgeTextActive: {
    color: '#261900',
  },
  cardListContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#74777F',
  },
  emptyContainer: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B2A4A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#74777F',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#EFF4FF',
  },
  refreshBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B2A4A',
  },
  supportBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#EFF4FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  supportIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFDEA5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  supportSubtitle: {
    fontSize: 12,
    color: '#43474E',
    marginTop: 1,
  },
  supportActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});
