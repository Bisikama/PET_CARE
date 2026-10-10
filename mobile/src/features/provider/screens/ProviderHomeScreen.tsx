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
import { useRouter, useFocusEffect } from 'expo-router';
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
import {
  getFallbackProviderBookings,
  updateFallbackBookingStatus,
} from '../data/mockProviderBookings';

type ProviderTabKey = 'REQUESTS' | 'UPCOMING' | 'IN_PROGRESS' | 'HISTORY';

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
        setBookings(getFallbackProviderBookings());
      }
    } catch (error) {
      console.warn('Using fallback provider bookings due to API response:', error);
      setBookings(getFallbackProviderBookings());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Tự động tải lại danh sách đơn hẹn mỗi khi quay lại màn hình
  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

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
              updateFallbackBookingStatus(booking.id, 'ACCEPTED');
              setBookings((prev) =>
                prev.map((item) =>
                  item.id === booking.id ? { ...item, status: 'ACCEPTED' } : item
                )
              );
              Alert.alert('Thành công', 'Đã tiếp nhận đơn hẹn!');
            } catch (err: any) {
              const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Không thể nhận đơn lúc này. Vui lòng thử lại sau.';
              Alert.alert('Lỗi nhận việc', msg);
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
              updateFallbackBookingStatus(booking.id, 'REJECTED');
              setBookings((prev) =>
                prev.map((item) =>
                  item.id === booking.id ? { ...item, status: 'REJECTED' } : item
                )
              );
              Alert.alert('Đã từ chối', 'Đơn hẹn đã được cập nhật.');
            } catch (err: any) {
              const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Không thể từ chối đơn lúc này. Vui lòng thử lại sau.';
              Alert.alert('Lỗi từ chối', msg);
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
      inProgress: bookings.filter(
        (b) =>
          b.status === 'IN_PROGRESS' ||
          b.status === 'CHECKED_IN' ||
          b.status === 'AWAITING_CUSTOMER_CONFIRMATION'
      ).length,
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
          (b) =>
            b.status === 'IN_PROGRESS' ||
            b.status === 'CHECKED_IN' ||
            b.status === 'AWAITING_CUSTOMER_CONFIRMATION'
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
                onStartService={(b) => {
                  router.push({
                    pathname: '/(provider)/start-service' as any,
                    params: { id: b.id, bookingData: JSON.stringify(b) },
                  });
                }}
                onAction={(b) => {
                  if (
                    b.status === 'ACCEPTED' ||
                    b.status === 'IN_PROGRESS' ||
                    b.status === 'CHECKED_IN' ||
                    b.status === 'AWAITING_CUSTOMER_CONFIRMATION'
                  ) {
                    router.push({
                      pathname: '/(provider)/start-service' as any,
                      params: { id: b.id, bookingData: JSON.stringify(b) },
                    });
                  } else {
                    router.push({
                      pathname: '/(provider)/booking-review' as any,
                      params: { id: b.id, bookingData: JSON.stringify(b) },
                    });
                  }
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
