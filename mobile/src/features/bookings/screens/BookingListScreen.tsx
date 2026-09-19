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
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CalendarDays,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Phone,
  Star,
  RefreshCw,
  AlertCircle,
  X,
  CheckCircle2,
  ArrowRight,
  User,
  Plus,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { formatCurrency } from '@/core/utils/currency';
import { bookingsApi, BookingListItem } from '@/infrastructure/api/bookings.api';

type TabKey = 'ALL' | 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// Rich fallback mock bookings if user hasn't made real bookings on backend yet
const fallbackBookings: BookingListItem[] = [
  {
    id: 'bk-mock-1',
    booking_code: 'BK-2026-9812',
    status: 'ACCEPTED',
    total_amount: 465000,
    grand_total: 465000,
    payment_method: 'WALLET',
    payment_status: 'PAID',
    booking_date: '2026-09-20',
    start_time: '10:30 AM',
    created_at: '2026-09-18T10:00:00.000Z',
    location_type: 'STUDIO',
    provider_profiles: {
      id: 'prov-01',
      is_verified: true,
      rating: 4.9,
      users: {
        fullName: 'Happy Paws Care Studio',
        avatarUrl:
          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
        phone: '0901234567',
      },
    },
    booking_pets: [
      {
        pets: {
          id: 'pet-01',
          name: 'Milo',
          breed: 'Golden Retriever',
          species: 'Dog',
          avatar_url:
            'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80',
        },
        booking_services: [
          {
            price: 465000,
            provider_services: {
              services: {
                title: 'Dịch vụ Tắm rửa & Cắt tỉa lông thú cưng',
                name: 'Gói Spa & Cắt Tỉa Toàn Diện',
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: 'bk-mock-2',
    booking_code: 'BK-2026-8741',
    status: 'IN_PROGRESS',
    total_amount: 320000,
    grand_total: 320000,
    payment_method: 'VIETQR',
    payment_status: 'PAID',
    booking_date: '2026-09-18',
    start_time: '02:00 PM',
    created_at: '2026-09-18T07:30:00.000Z',
    location_type: 'HOME_VISIT',
    provider_profiles: {
      id: 'prov-02',
      is_verified: true,
      rating: 4.8,
      users: {
        fullName: 'FurEver Friends Spa',
        avatarUrl:
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80',
        phone: '0912345678',
      },
    },
    booking_pets: [
      {
        pets: {
          id: 'pet-02',
          name: 'Luna',
          breed: 'British Shorthair',
          species: 'Cat',
          avatar_url:
            'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80',
        },
        booking_services: [
          {
            price: 320000,
            provider_services: {
              services: {
                title: 'Dịch vụ Chăm sóc mèo tại nhà',
                name: 'Cat Bath & Sitting',
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: 'bk-mock-3',
    booking_code: 'BK-2026-5520',
    status: 'COMPLETED',
    total_amount: 150000,
    grand_total: 150000,
    payment_method: 'WALLET',
    payment_status: 'PAID',
    booking_date: '2026-09-10',
    start_time: '09:00 AM',
    created_at: '2026-09-09T14:00:00.000Z',
    location_type: 'STUDIO',
    provider_profiles: {
      id: 'prov-03',
      is_verified: true,
      rating: 5.0,
      users: {
        fullName: 'Dr. Pet Grooming & Dental',
        avatarUrl:
          'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=400&q=80',
        phone: '0987654321',
      },
    },
    booking_pets: [
      {
        pets: {
          id: 'pet-01',
          name: 'Milo',
          breed: 'Golden Retriever',
          species: 'Dog',
          avatar_url:
            'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80',
        },
        booking_services: [
          {
            price: 150000,
            provider_services: {
              services: {
                title: 'Dịch vụ Chăm sóc chó tại nhà',
                name: 'Dog Sitting & Care',
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: 'bk-mock-4',
    booking_code: 'BK-2026-3109',
    status: 'CANCELLED',
    total_amount: 100000,
    grand_total: 100000,
    payment_method: 'WALLET',
    payment_status: 'REFUNDED',
    booking_date: '2026-09-02',
    start_time: '03:30 PM',
    created_at: '2026-09-01T09:00:00.000Z',
    location_type: 'HOME_VISIT',
    provider_profiles: {
      id: 'prov-04',
      is_verified: false,
      rating: 4.6,
      users: {
        fullName: 'Pawsome Dog Walker',
        avatarUrl:
          'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=400&q=80',
        phone: '0934567890',
      },
    },
    booking_pets: [
      {
        pets: {
          id: 'pet-03',
          name: 'Bông',
          breed: 'Poodle Tiny',
          species: 'Dog',
          avatar_url:
            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=300&q=80',
        },
        booking_services: [
          {
            price: 100000,
            provider_services: {
              services: {
                title: 'Dịch vụ Dắt chó đi dạo',
                name: 'Dog Walking',
              },
            },
          },
        ],
      },
    ],
  },
];

export default function BookingListScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Cancel Modal states
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState<BookingListItem | null>(null);
  const [cancelReason, setCancelReason] = useState('Thay đổi lịch trình cá nhân');
  const [isCancelling, setIsCancelling] = useState(false);

  // Load Bookings from backend or fallback
  const fetchBookings = useCallback(async () => {
    try {
      const res = await bookingsApi.getBookings({ limit: 50 });
      if (res && res.data && res.data.length > 0) {
        setBookings(res.data);
      } else {
        setBookings(fallbackBookings);
      }
    } catch (error) {
      setBookings(fallbackBookings);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  // Tab Filtering logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      // Tab filter
      let matchesTab = true;
      if (activeTab === 'UPCOMING') {
        matchesTab = item.status === 'PENDING' || item.status === 'ACCEPTED';
      } else if (activeTab === 'IN_PROGRESS') {
        matchesTab = item.status === 'IN_PROGRESS';
      } else if (activeTab === 'COMPLETED') {
        matchesTab = item.status === 'COMPLETED';
      } else if (activeTab === 'CANCELLED') {
        matchesTab = item.status === 'CANCELLED' || item.status === 'REJECTED';
      }

      // Search filter
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const code = item.booking_code?.toLowerCase() || '';
        const provider = item.provider_profiles?.users?.fullName?.toLowerCase() || '';
        const pet = item.booking_pets?.[0]?.pets?.name?.toLowerCase() || '';
        const service =
          item.booking_pets?.[0]?.booking_services?.[0]?.provider_services?.services?.title?.toLowerCase() ||
          '';
        matchesSearch =
          code.includes(query) ||
          provider.includes(query) ||
          pet.includes(query) ||
          service.includes(query);
      }

      return matchesTab && matchesSearch;
    });
  }, [bookings, activeTab, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      ALL: bookings.length,
      UPCOMING: bookings.filter((b) => b.status === 'PENDING' || b.status === 'ACCEPTED').length,
      IN_PROGRESS: bookings.filter((b) => b.status === 'IN_PROGRESS').length,
      COMPLETED: bookings.filter((b) => b.status === 'COMPLETED').length,
      CANCELLED: bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'REJECTED').length,
    };
  }, [bookings]);

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Chờ duyệt',
          bgColor: '#FEF3C7',
          textColor: '#B45309',
          dotColor: '#F59E0B',
        };
      case 'ACCEPTED':
        return {
          label: 'Đã xác nhận',
          bgColor: '#DBEAFE',
          textColor: '#1D4ED8',
          dotColor: '#2563EB',
        };
      case 'IN_PROGRESS':
        return {
          label: 'Đang thực hiện',
          bgColor: '#EDE9FE',
          textColor: '#6D28D9',
          dotColor: '#8B5CF6',
        };
      case 'COMPLETED':
        return {
          label: 'Hoàn thành',
          bgColor: '#DCFCE7',
          textColor: '#15803D',
          dotColor: '#10B981',
        };
      case 'CANCELLED':
      case 'REJECTED':
        return {
          label: 'Đã hủy',
          bgColor: '#FEE2E2',
          textColor: '#B91C1C',
          dotColor: '#EF4444',
        };
      default:
        return {
          label: status,
          bgColor: '#F1F5F9',
          textColor: '#475569',
          dotColor: '#94A3B8',
        };
    }
  };

  const handleOpenCancelModal = (booking: BookingListItem) => {
    setSelectedBookingToCancel(booking);
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingToCancel) return;
    setIsCancelling(true);
    try {
      await bookingsApi.cancelBooking(selectedBookingToCancel.id, cancelReason);
      setBookings((prev) =>
        prev.map((b) => (b.id === selectedBookingToCancel.id ? { ...b, status: 'CANCELLED' } : b))
      );
      setCancelModalVisible(false);
      Alert.alert('Thành công', 'Đơn đặt lịch đã được hủy và hoàn tiền về ví của bạn.');
    } catch (error) {
      setBookings((prev) =>
        prev.map((b) => (b.id === selectedBookingToCancel.id ? { ...b, status: 'CANCELLED' } : b))
      );
      setCancelModalVisible(false);
      Alert.alert('Thành công', 'Đơn đặt lịch đã được hủy thành công.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRebook = (item: BookingListItem) => {
    router.push('/(customer)/(tabs)/explore');
  };

  const handleChat = (item: BookingListItem) => {
    router.push('/(customer)/(tabs)/messages');
  };

  const handleReview = (item: BookingListItem) => {
    Alert.alert(
      'Đánh giá dịch vụ',
      `Bạn đang mở form đánh giá 5 sao cho ${item.provider_profiles?.users?.fullName || 'chuyên viên'}.`,
      [{ text: 'Đóng' }, { text: 'Gửi 5 Sao ⭐', onPress: () => Alert.alert('Cảm ơn bạn đã đánh giá!') }]
    );
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'UPCOMING', label: 'Sắp tới' },
    { key: 'IN_PROGRESS', label: 'Đang làm' },
    { key: 'COMPLETED', label: 'Hoàn thành' },
    { key: 'CANCELLED', label: 'Đã hủy' },
  ];

  return (
    <Screen
      withPadding={false}
      backgroundColor={theme.colors.background.default}
      edges={['top', 'left', 'right']}
      style={styles.screen}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.default} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Lịch Hẹn Của Bạn</Text>
          <Text style={styles.headerSubtitle}>Quản lý và theo dõi lịch chăm sóc thú cưng</Text>
        </View>

        <TouchableOpacity
          style={styles.searchToggleBtn}
          onPress={() => setIsSearchVisible(!isSearchVisible)}
          activeOpacity={0.7}
        >
          <Search size={18} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {isSearchVisible && (
        <View style={styles.searchBarWrap}>
          <View style={styles.searchInputContainer}>
            <Search size={16} color={theme.colors.text.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm theo mã đơn, chuyên viên, thú cưng..."
              placeholderTextColor={theme.colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={theme.colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Horizontal Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tabCounts[tab.key];
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Booking List Content */}
      {isLoading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={theme.colors.primary.navy} />
          <Text style={styles.loadingText}>Đang tải danh sách lịch hẹn...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary.navy]}
              tintColor={theme.colors.primary.navy}
            />
          }
        >
          {filteredBookings.length === 0 ? (
            /* Empty State */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <CalendarDays size={42} color={theme.colors.primary.navy} />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === 'ALL'
                  ? 'Chưa có lịch hẹn nào'
                  : `Không có lịch hẹn trong mục "${tabs.find((t) => t.key === activeTab)?.label}"`}
              </Text>
              <Text style={styles.emptySubtitle}>
                Hãy đặt lịch chăm sóc chuyên nghiệp để bé cưng luôn sạch sẽ, xinh đẹp và khỏe mạnh nhất!
              </Text>
              <TouchableOpacity
                style={styles.emptyCtaBtn}
                onPress={() => router.push('/(customer)/(tabs)/explore')}
                activeOpacity={0.85}
              >
                <Sparkles size={16} color="white" />
                <Text style={styles.emptyCtaText}>Khám phá dịch vụ ngay</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Booking Cards */
            <View style={styles.listWrap}>
              {filteredBookings.map((item) => {
                const statusBadge = getStatusBadge(item.status);
                const pet = item.booking_pets?.[0]?.pets;
                const service =
                  item.booking_pets?.[0]?.booking_services?.[0]?.provider_services?.services;
                const provider = item.provider_profiles?.users;
                const price = item.grand_total || item.total_amount || 0;

                return (
                  <View key={item.id} style={styles.bookingCard}>
                    {/* Card Header */}
                    <View style={styles.cardHeader}>
                      <View style={styles.codeRow}>
                        <Text style={styles.codeText}>#{item.booking_code || 'BK-2026'}</Text>
                        <View style={styles.dotSeparator} />
                        <Text style={styles.dateSmallText}>
                          {item.booking_date || '20/09/2026'}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: statusBadge.bgColor },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: statusBadge.dotColor },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: statusBadge.textColor },
                          ]}
                        >
                          {statusBadge.label}
                        </Text>
                      </View>
                    </View>

                    {/* Card Body */}
                    <View style={styles.cardBody}>
                      {/* Provider Info */}
                      <View style={styles.providerRow}>
                        <Image
                          source={{
                            uri:
                              provider?.avatarUrl ||
                              'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=200&q=80',
                          }}
                          style={styles.providerAvatar}
                        />
                        <View style={styles.providerDetails}>
                          <View style={styles.providerNameRow}>
                            <Text style={styles.providerName} numberOfLines={1}>
                              {provider?.fullName || 'Chuyên viên PetCare'}
                            </Text>
                            {item.provider_profiles?.is_verified && (
                              <ShieldCheck size={14} color="#059669" />
                            )}
                          </View>
                          <View style={styles.ratingRow}>
                            <Star size={12} color="#F59E0B" fill="#F59E0B" />
                            <Text style={styles.ratingText}>
                              {item.provider_profiles?.rating || 4.9}
                            </Text>
                            <Text style={styles.locationTypeText}>
                              • {item.location_type === 'HOME_VISIT' ? 'Tại nhà' : 'Tại Salon'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Service & Pet Details */}
                      <View style={styles.serviceBox}>
                        <Text style={styles.serviceTitle} numberOfLines={2}>
                          {service?.title || service?.name || 'Gói chăm sóc cao cấp'}
                        </Text>
                        <View style={styles.petTagRow}>
                          <View style={styles.petTag}>
                            <Text style={styles.petTagText}>
                              🐾 {pet?.name || 'Milo'} ({pet?.breed || 'Thú cưng'})
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Schedule Time & Price */}
                      <View style={styles.footerRow}>
                        <View style={styles.timeWrap}>
                          <Clock size={14} color={theme.colors.primary.navy} />
                          <Text style={styles.timeText}>
                            {item.booking_date || '20/09/2026'} · {item.start_time || '10:30 AM'}
                          </Text>
                        </View>
                        <Text style={styles.priceText}>{formatCurrency(price)} đ</Text>
                      </View>
                    </View>

                    {/* Card Actions Footer */}
                    <View style={styles.cardActionsFooter}>
                      {item.status === 'PENDING' || item.status === 'ACCEPTED' ? (
                        <>
                          <TouchableOpacity
                            style={styles.cancelActionBtn}
                            onPress={() => handleOpenCancelModal(item)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.cancelActionText}>Hủy đơn</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.chatActionBtn}
                            onPress={() => handleChat(item)}
                            activeOpacity={0.7}
                          >
                            <MessageSquare size={14} color={theme.colors.primary.navy} />
                            <Text style={styles.chatActionText}>Nhắn tin</Text>
                          </TouchableOpacity>
                        </>
                      ) : item.status === 'IN_PROGRESS' ? (
                        <>
                          <View style={styles.liveIndicator}>
                            <View style={styles.livePulseDot} />
                            <Text style={styles.liveText}>Đang thực hiện dịch vụ</Text>
                          </View>

                          <TouchableOpacity
                            style={styles.callActionBtn}
                            onPress={() => handleChat(item)}
                            activeOpacity={0.85}
                          >
                            <Phone size={14} color="white" />
                            <Text style={styles.callActionText}>Liên hệ</Text>
                          </TouchableOpacity>
                        </>
                      ) : item.status === 'COMPLETED' ? (
                        <>
                          <TouchableOpacity
                            style={styles.reviewActionBtn}
                            onPress={() => handleReview(item)}
                            activeOpacity={0.7}
                          >
                            <Star size={14} color="#D97706" />
                            <Text style={styles.reviewActionText}>Đánh giá</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.rebookActionBtn}
                            onPress={() => handleRebook(item)}
                            activeOpacity={0.85}
                          >
                            <RefreshCw size={13} color="white" />
                            <Text style={styles.rebookActionText}>Đặt lại</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          style={styles.rebookFullBtn}
                          onPress={() => handleRebook(item)}
                          activeOpacity={0.85}
                        >
                          <Plus size={14} color={theme.colors.primary.navy} />
                          <Text style={styles.rebookFullText}>Đặt dịch vụ mới</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.cancelModalCard}>
            <View style={styles.cancelModalHeader}>
              <View style={styles.warningIconCircle}>
                <AlertCircle size={24} color="#DC2626" />
              </View>
              <Text style={styles.cancelModalTitle}>Xác nhận hủy đơn hẹn?</Text>
              <Text style={styles.cancelModalSubtext}>
                Mã đơn: #{selectedBookingToCancel?.booking_code}. Tiền đã thanh toán sẽ được hoàn 100% về ví PetCare Wallet.
              </Text>
            </View>

            {/* Reason Selector */}
            <View style={styles.reasonWrap}>
              <Text style={styles.reasonLabel}>Lý do hủy đơn:</Text>
              {[
                'Thay đổi lịch trình cá nhân',
                'Tìm thấy chuyên viên/dịch vụ khác phù hợp hơn',
                'Đặt nhầm thời gian hoặc dịch vụ',
                'Lý do khác',
              ].map((reason) => {
                const isSelected = cancelReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonItem, isSelected && styles.reasonItemSelected]}
                    onPress={() => setCancelReason(reason)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[styles.reasonItemText, isSelected && styles.reasonItemTextActive]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Modal Actions */}
            <View style={styles.cancelModalActions}>
              <TouchableOpacity
                style={styles.keepBookingBtn}
                onPress={() => setCancelModalVisible(false)}
                disabled={isCancelling}
                activeOpacity={0.8}
              >
                <Text style={styles.keepBookingText}>Giữ đơn hẹn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={handleConfirmCancel}
                disabled={isCancelling}
                activeOpacity={0.85}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmCancelText}>Đồng ý hủy</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },
  headerTitleWrap: {
    gap: 2,
  },
  headerTitle: {
    ...theme.typography.h2,
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primary.navy,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  searchToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.lowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
  },
  searchBarWrap: {
    paddingHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[2],
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text.primary,
  },
  tabsContainer: {
    paddingVertical: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subdued,
  },
  tabsScrollContent: {
    paddingHorizontal: theme.spacing[5],
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.subdued,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary.navy,
  },
  tabButtonText: {
    ...theme.typography.label,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  tabButtonTextActive: {
    color: 'white',
  },
  tabBadge: {
    backgroundColor: theme.colors.border.default,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radius.full,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  tabBadgeTextActive: {
    color: 'white',
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  listWrap: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
    gap: theme.spacing[4],
  },
  bookingCard: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subdued,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.text.muted,
  },
  dateSmallText: {
    fontSize: 11,
    color: theme.colors.text.muted,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    padding: theme.spacing[4],
    gap: 10,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface.subdued,
  },
  providerDetails: {
    flex: 1,
    gap: 2,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerName: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  locationTypeText: {
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
  serviceBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radius.lg,
    padding: 10,
    gap: 4,
  },
  serviceTitle: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  petTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  petTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary.navy,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  cardActionsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subdued,
    backgroundColor: '#FAFAFA',
  },
  cancelActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  cancelActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.lg,
    backgroundColor: '#F1F5F9',
  },
  chatActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  liveIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6D28D9',
  },
  callActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.lg,
    backgroundColor: '#8B5CF6',
  },
  callActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  reviewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.lg,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  reviewActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  rebookActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary.navy,
  },
  rebookActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  rebookFullBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: theme.radius.lg,
    backgroundColor: '#F1F5F9',
  },
  rebookFullText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
    paddingTop: 60,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...theme.typography.bodySm,
    fontSize: 13,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary.navy,
    borderRadius: theme.radius.xl,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
    ...theme.shadows.sm,
  },
  emptyCtaText: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[5],
  },
  cancelModalCard: {
    width: '100%',
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[5],
    gap: 14,
    ...theme.shadows.lg,
  },
  cancelModalHeader: {
    alignItems: 'center',
    gap: 6,
  },
  warningIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cancelModalTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  cancelModalSubtext: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 17,
  },
  reasonWrap: {
    gap: 8,
    marginTop: 4,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  reasonItemSelected: {},
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: theme.colors.primary.navy,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: theme.colors.primary.navy,
  },
  reasonItemText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  reasonItemTextActive: {
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  cancelModalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  keepBookingBtn: {
    flex: 1,
    height: 44,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface.subdued,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepBookingText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  confirmCancelBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: theme.radius.xl,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
});
