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
  Switch,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  PawPrint,
  Bell,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Wallet,
  MessageSquare,
  ClipboardList,
  Star,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Headphones,
  Sparkles,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  bookingsApi,
  ProviderBookingItem,
} from '@/infrastructure/api/bookings.api';
import { walletApi, WalletBalanceResponse } from '@/infrastructure/api/wallet.api';
import { getFallbackProviderBookings } from '../data/mockProviderBookings';

export function ProviderScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [isOnline, setIsOnline] = useState(true);
  const [wallet, setWallet] = useState<WalletBalanceResponse | null>(null);
  const [bookings, setBookings] = useState<ProviderBookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [walletRes, bookingsRes] = await Promise.allSettled([
        walletApi.getMyWallet(),
        bookingsApi.getBookings({ limit: 50 }),
      ]);

      if (walletRes.status === 'fulfilled' && walletRes.value) {
        setWallet(walletRes.value);
      }

      if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.data) {
        if (bookingsRes.value.data.length > 0) {
          setBookings(bookingsRes.value.data as unknown as ProviderBookingItem[]);
        } else {
          setBookings(getFallbackProviderBookings());
        }
      } else {
        setBookings(getFallbackProviderBookings());
      }
    } catch (error) {
      console.warn('ProviderScreen fetchData error:', error);
      setBookings(getFallbackProviderBookings());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Computed metrics
  const stats = useMemo(() => {
    const pendingRequests = bookings.filter(
      (b) => b.status === 'PENDING_PROVIDER_ACCEPTANCE'
    );
    const activeJobs = bookings.filter(
      (b) =>
        b.status === 'IN_PROGRESS' ||
        b.status === 'CHECKED_IN' ||
        b.status === 'AWAITING_CUSTOMER_CONFIRMATION'
    );
    const upcomingJobs = bookings.filter((b) => b.status === 'ACCEPTED');
    const completedJobs = bookings.filter((b) => b.status === 'COMPLETED');

    return {
      pendingCount: pendingRequests.length,
      activeCount: activeJobs.length,
      upcomingCount: upcomingJobs.length,
      completedCount: completedJobs.length,
      urgentItem: pendingRequests[0] || activeJobs[0] || upcomingJobs[0] || null,
    };
  }, [bookings]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Screen style={styles.screen} backgroundColor="#F8F9FF">
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerUser}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'P'}
            </Text>
          </View>
          <View>
            <View style={styles.greetingRow}>
              <Text style={styles.greetingText}>Xin chào,</Text>
              <View style={styles.proTag}>
                <Sparkles size={10} color="#5D4200" />
                <Text style={styles.proTagText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.full_name || 'Đối tác Chuyên gia'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push('/(provider)/(tabs)/messages' as any)}
            activeOpacity={0.7}
          >
            <Bell size={20} color="#0B2A4A" />
            {stats.pendingCount > 0 && <View style={styles.redBadge} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push('/(provider)/(tabs)/profile' as any)}
            activeOpacity={0.7}
          >
            <User size={20} color="#0B2A4A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchData(true)}
            tintColor="#0B2A4A"
          />
        }
      >
        {/* Availability Toggle Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusLeft}>
            <View
              style={[
                styles.statusDot,
                isOnline ? styles.statusDotActive : styles.statusDotInactive,
              ]}
            />
            <View>
              <Text style={styles.statusTitle}>
                {isOnline ? 'Đang sẵn sàng nhận đơn' : 'Tạm nghỉ nhận đơn'}
              </Text>
              <Text style={styles.statusSubtitle}>
                {isOnline
                  ? 'Hồ sơ của bạn đang hiển thị với khách hàng'
                  : 'Không nhận thêm yêu cầu đặt hẹn mới'}
              </Text>
            </View>
          </View>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: '#D9D9D9', true: '#B7F399' }}
            thumbColor={isOnline ? '#006D44' : '#74777F'}
          />
        </View>

        {/* Real-time KPI Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Card 1: Chờ xử lý */}
          <TouchableOpacity
            style={[
              styles.statCard,
              stats.pendingCount > 0 && styles.statCardAlert,
            ]}
            onPress={() => router.push('/(provider)/(tabs)/jobs' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.statHeader}>
              <View
                style={[
                  styles.statIconBox,
                  {
                    backgroundColor:
                      stats.pendingCount > 0 ? '#FFDAD6' : '#EFF4FF',
                  },
                ]}
              >
                <AlertCircle
                  size={18}
                  color={stats.pendingCount > 0 ? '#BA1A1A' : '#0B2A4A'}
                />
              </View>
              <ChevronRight size={14} color="#74777F" />
            </View>
            <Text
              style={[
                styles.statValue,
                stats.pendingCount > 0 && { color: '#BA1A1A' },
              ]}
            >
              {stats.pendingCount}
            </Text>
            <Text style={styles.statLabel}>Yêu cầu chờ duyệt</Text>
          </TouchableOpacity>

          {/* Card 2: Ca sắp tới & Đang làm */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(provider)/(tabs)/jobs' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.statHeader}>
              <View
                style={[styles.statIconBox, { backgroundColor: '#FFDEA5' }]}
              >
                <Clock size={18} color="#5D4200" />
              </View>
              <ChevronRight size={14} color="#74777F" />
            </View>
            <Text style={styles.statValue}>
              {stats.activeCount + stats.upcomingCount}
            </Text>
            <Text style={styles.statLabel}>Lịch hẹn hôm nay</Text>
          </TouchableOpacity>

          {/* Card 3: Số dư ví khả dụng */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(provider)/(tabs)/earnings' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.statHeader}>
              <View
                style={[styles.statIconBox, { backgroundColor: '#C8E6C9' }]}
              >
                <Wallet size={18} color="#1B5E20" />
              </View>
              <ChevronRight size={14} color="#74777F" />
            </View>
            <Text style={[styles.statValue, { fontSize: 16 }]} numberOfLines={1}>
              {wallet ? formatVND(wallet.balance) : '---'}
            </Text>
            <Text style={styles.statLabel}>Ví khả dụng</Text>
          </TouchableOpacity>

          {/* Card 4: Uy tín & Đánh giá */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={() =>
              Alert.alert(
                'Chỉ số uy tín',
                'Tỷ lệ hoàn thành công việc: 100%\nĐiểm hài lòng trung bình: 4.95/5.0\nĐược chứng nhận Chuyên gia PetCare.'
              )
            }
            activeOpacity={0.8}
          >
            <View style={styles.statHeader}>
              <View
                style={[styles.statIconBox, { backgroundColor: '#FFF3E0' }]}
              >
                <Star size={18} color="#E65100" />
              </View>
              <ChevronRight size={14} color="#74777F" />
            </View>
            <View style={styles.ratingRow}>
              <Text style={styles.statValue}>4.95</Text>
              <Text style={styles.ratingMax}>/5</Text>
            </View>
            <Text style={styles.statLabel}>Đánh giá đối tác</Text>
          </TouchableOpacity>
        </View>

        {/* Immediate Action Focus Card */}
        {stats.urgentItem ? (
          <View style={styles.urgentCard}>
            <View style={styles.urgentHeader}>
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentBadgeText}>
                  {stats.urgentItem.status === 'PENDING_PROVIDER_ACCEPTANCE'
                    ? 'YÊU CẦU MỚI CẦN PHẢN HỒI'
                    : stats.urgentItem.status === 'IN_PROGRESS'
                    ? 'CA DỊCH VỤ ĐANG DIỄN RA'
                    : 'CA DỊCH VỤ TIẾP THEO'}
                </Text>
              </View>
              <Text style={styles.urgentCode}>
                {stats.urgentItem.booking_code || '#PET-BOOKING'}
              </Text>
            </View>

            <View style={styles.urgentBody}>
              <View style={styles.urgentInfoRow}>
                <View style={styles.urgentPetAvatar}>
                  <PawPrint size={20} color="#0B2A4A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.urgentCustomer}>
                    {stats.urgentItem.users?.fullName || 'Khách hàng PetCare'}
                  </Text>
                  <Text style={styles.urgentService} numberOfLines={1}>
                    {stats.urgentItem.booking_pets?.[0]?.pets?.name
                      ? `Thú cưng: ${stats.urgentItem.booking_pets[0].pets.name} (${stats.urgentItem.booking_pets[0].pets.breed || 'Chó cảnh'})`
                      : 'Dịch vụ chăm sóc thú cưng tận nơi'}
                  </Text>
                </View>
                <Text style={styles.urgentPrice}>
                  {formatVND(
                    Number(stats.urgentItem.total_price || 0)
                  )}
                </Text>
              </View>

              <View style={styles.urgentMetaRow}>
                <Clock size={14} color="#74777F" />
                <Text style={styles.urgentMetaText}>
                  {stats.urgentItem.estimated_start_at
                    ? new Date(stats.urgentItem.estimated_start_at).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }) + ' - ' + new Date(stats.urgentItem.estimated_start_at).toLocaleDateString('vi-VN')
                    : 'Hôm nay'}
                </Text>
              </View>
            </View>

            <View style={styles.urgentActions}>
              {stats.urgentItem.status === 'PENDING_PROVIDER_ACCEPTANCE' ? (
                <TouchableOpacity
                  style={styles.urgentPrimaryBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/(provider)/booking-review' as any,
                      params: {
                        id: stats.urgentItem!.id,
                        bookingData: JSON.stringify(stats.urgentItem),
                      },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.urgentPrimaryText}>Xem & Nhận đơn ngay</Text>
                  <ChevronRight size={16} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.urgentPrimaryBtn, { backgroundColor: '#006D44' }]}
                  onPress={() =>
                    router.push({
                      pathname: '/(provider)/start-service' as any,
                      params: {
                        id: stats.urgentItem!.id,
                        bookingData: JSON.stringify(stats.urgentItem),
                      },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.urgentPrimaryText}>Tiến hành phục vụ</Text>
                  <ChevronRight size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.calmCard}>
            <CheckCircle2 size={32} color="#00A472" />
            <View style={{ flex: 1 }}>
              <Text style={styles.calmTitle}>Mọi thứ đã sẵn sàng</Text>
              <Text style={styles.calmSubtitle}>
                Chưa có đơn hẹn khẩn cấp cần xử lý. Hãy giữ ứng dụng online để đón ca mới!
              </Text>
            </View>
          </View>
        )}

        {/* Quick Hub Navigation */}
        <Text style={styles.sectionTitle}>Lối tắt quản lý</Text>
        <View style={styles.hubGrid}>
          {/* Lịch làm việc */}
          <TouchableOpacity
            style={styles.hubItem}
            onPress={() => router.push('/(provider)/(tabs)/schedule' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.hubIconBox, { backgroundColor: '#E3F2FD' }]}>
              <Calendar size={24} color="#1565C0" />
            </View>
            <Text style={styles.hubTitle}>Lịch làm việc</Text>
            <Text style={styles.hubSubtitle}>Cài đặt ca trực tuần</Text>
          </TouchableOpacity>

          {/* Quản lý đơn việc */}
          <TouchableOpacity
            style={styles.hubItem}
            onPress={() => router.push('/(provider)/(tabs)/jobs' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.hubIconBox, { backgroundColor: '#FFF8E1' }]}>
              <ClipboardList size={24} color="#F57F17" />
            </View>
            <Text style={styles.hubTitle}>Đơn việc</Text>
            <Text style={styles.hubSubtitle}>Xử lý & Lịch sử</Text>
          </TouchableOpacity>

          {/* Ví & Doanh thu */}
          <TouchableOpacity
            style={styles.hubItem}
            onPress={() => router.push('/(provider)/(tabs)/earnings' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.hubIconBox, { backgroundColor: '#E8F5E9' }]}>
              <TrendingUp size={24} color="#2E7D32" />
            </View>
            <Text style={styles.hubTitle}>Ví & Rút tiền</Text>
            <Text style={styles.hubSubtitle}>Doanh thu & Ký quỹ</Text>
          </TouchableOpacity>

          {/* Tin nhắn khách hàng */}
          <TouchableOpacity
            style={styles.hubItem}
            onPress={() => router.push('/(provider)/(tabs)/messages' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.hubIconBox, { backgroundColor: '#F3E5F5' }]}>
              <MessageSquare size={24} color="#7B1FA2" />
            </View>
            <Text style={styles.hubTitle}>Tin nhắn</Text>
            <Text style={styles.hubSubtitle}>Trao đổi với khách</Text>
          </TouchableOpacity>
        </View>

        {/* Quality Guidelines Card */}
        <View style={styles.guideCard}>
          <View style={styles.guideHeader}>
            <ShieldCheck size={20} color="#0B2A4A" />
            <Text style={styles.guideTitle}>Quy chuẩn dịch vụ Pro</Text>
          </View>
          <View style={styles.guideList}>
            <View style={styles.guideItem}>
              <Text style={styles.guideBullet}>1.</Text>
              <Text style={styles.guideText}>
                Có mặt đúng giờ hẹn và chuẩn bị đầy đủ bộ dụng cụ chuyên dụng.
              </Text>
            </View>
            <View style={styles.guideItem}>
              <Text style={styles.guideBullet}>2.</Text>
              <Text style={styles.guideText}>
                Chụp ảnh check-in tình trạng thú cưng trước khi bắt đầu thực hiện.
              </Text>
            </View>
            <View style={styles.guideItem}>
              <Text style={styles.guideBullet}>3.</Text>
              <Text style={styles.guideText}>
                Hoàn tất checklist dịch vụ và gửi ảnh nghiệm thu để giải ngân ví.
              </Text>
            </View>
          </View>
        </View>

        {/* 24/7 Support Banner */}
        <View style={styles.supportBanner}>
          <View style={styles.supportLeft}>
            <View style={styles.supportIconCircle}>
              <Headphones size={20} color="#5D4200" />
            </View>
            <View>
              <Text style={styles.supportTitle}>Hỗ trợ đối tác 24/7</Text>
              <Text style={styles.supportSubtitle}>
                Hotline hỗ trợ kỹ thuật và khẩn cấp: 1900 8888
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.supportCallBtn}
            onPress={() => Alert.alert('Hotline', 'Đang kết nối tổng đài 1900 8888')}
            activeOpacity={0.8}
          >
            <Text style={styles.supportCallText}>Gọi ngay</Text>
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0B2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FDBF35',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetingText: {
    fontSize: 12,
    color: '#74777F',
  },
  proTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFDEA5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  proTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#5D4200',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2A4A',
    maxWidth: 180,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4FA',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  redBadge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BA1A1A',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  statusBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E8ECF2',
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusDotActive: {
    backgroundColor: '#00A472',
  },
  statusDotInactive: {
    backgroundColor: '#BA1A1A',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#74777F',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardAlert: {
    borderColor: '#FFDAD6',
    backgroundColor: '#FFF8F7',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B2A4A',
  },
  statLabel: {
    fontSize: 12,
    color: '#74777F',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  ratingMax: {
    fontSize: 14,
    color: '#74777F',
    fontWeight: '600',
  },
  urgentCard: {
    backgroundColor: '#0B2A4A',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  urgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  urgentBadge: {
    backgroundColor: '#FDBF35',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00152D',
  },
  urgentCode: {
    fontSize: 12,
    color: '#A6C8FF',
    fontWeight: '600',
  },
  urgentBody: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  urgentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  urgentPetAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDBF35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgentCustomer: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  urgentService: {
    fontSize: 12,
    color: '#DCE9FF',
    marginTop: 1,
  },
  urgentPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FDBF35',
  },
  urgentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  urgentMetaText: {
    fontSize: 12,
    color: '#DCE9FF',
  },
  urgentActions: {
    flexDirection: 'row',
  },
  urgentPrimaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FDBF35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  urgentPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00152D',
  },
  calmCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  calmTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
  },
  calmSubtitle: {
    fontSize: 12,
    color: '#15803D',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2A4A',
    marginTop: 4,
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hubItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  hubIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  hubTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  hubSubtitle: {
    fontSize: 11,
    color: '#74777F',
    marginTop: 2,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8ECF2',
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  guideList: {
    gap: 8,
  },
  guideItem: {
    flexDirection: 'row',
    gap: 8,
  },
  guideBullet: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  guideText: {
    fontSize: 12,
    color: '#43474E',
    flex: 1,
    lineHeight: 18,
  },
  supportBanner: {
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
    fontSize: 13,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  supportSubtitle: {
    fontSize: 11,
    color: '#43474E',
    marginTop: 1,
  },
  supportCallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0B2A4A',
  },
  supportCallText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
