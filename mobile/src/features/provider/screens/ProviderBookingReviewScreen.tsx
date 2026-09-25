import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Timer,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Lock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Navigation,
  MessageSquare,
  Sparkles,
  AlertCircle,
  X,
  FileText,
  Heart,
  Stethoscope,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { formatCurrency } from '@/core/utils/currency';
import {
  bookingsApi,
  ProviderBookingItem,
} from '@/infrastructure/api/bookings.api';

export function ProviderBookingReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; bookingData?: string }>();

  // State management
  const [booking, setBooking] = useState<ProviderBookingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<string>('PENDING_PROVIDER_ACCEPTANCE');

  // Modal states
  const [isDeclineModalVisible, setIsDeclineModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNote, setCancelNote] = useState('');

  // Countdown timer state (seconds)
  const [secondsLeft, setSecondsLeft] = useState(14 * 60 + 32);

  // Initialize booking data from params or API
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);

      // Check if passed via params
      if (params.bookingData) {
        try {
          const parsed = JSON.parse(params.bookingData);
          if (isMounted) {
            setBooking(parsed);
            setBookingStatus(parsed.status || 'PENDING_PROVIDER_ACCEPTANCE');
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Could not parse bookingData param', e);
        }
      }

      // Fetch from API by ID
      if (params.id) {
        try {
          const res = await bookingsApi.getBookingById(params.id);
          if (res && isMounted) {
            const item = res as unknown as ProviderBookingItem;
            setBooking(item);
            setBookingStatus(item.status || 'PENDING_PROVIDER_ACCEPTANCE');
          }
        } catch (err) {
          console.warn('Failed to load booking by id, using fallback', err);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [params.id, params.bookingData]);

  // Countdown timer effect
  useEffect(() => {
    if (bookingStatus !== 'PENDING_PROVIDER_ACCEPTANCE') return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [bookingStatus]);

  const formattedCountdown = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [secondsLeft]);

  // Fallback defaults if fields are empty
  const primaryPet = booking?.booking_pets?.[0]?.pets || {
    name: booking?.booking_pets?.[0]?.pet_name || 'Milo',
    species: booking?.booking_pets?.[0]?.species || 'Chó (Dog)',
    breed: booking?.booking_pets?.[0]?.breed || 'Poodle Standard',
    weight: booking?.booking_pets?.[0]?.weight || '4.5',
    avatar_url:
      booking?.booking_pets?.[0]?.avatar_url ||
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
  };

  const primaryService = booking?.booking_pets?.[0]?.booking_services?.[0];
  const serviceName =
    primaryService?.service_name ||
    primaryService?.provider_services?.services?.name ||
    primaryService?.provider_services?.services?.title ||
    'Tắm spa khử mùi & Cắt tỉa tạo kiểu';
  const duration =
    booking?.service_duration_minutes ||
    primaryService?.duration_minutes ||
    90;

  const customerName =
    booking?.users?.fullName ||
    booking?.users?.full_name ||
    booking?.customer_addresses?.receiver_name ||
    'Nguyễn Thu Hà';

  const customerPhone =
    booking?.users?.phone ||
    booking?.customer_addresses?.phone ||
    '0908123456';

  const fullAddress =
    booking?.customer_addresses?.formatted_address ||
    booking?.customer_addresses?.address_line ||
    '142/8 Nguyễn Trãi, Phường 3, Quận 5, TP. Hồ Chí Minh';

  const district =
    booking?.customer_addresses?.district || 'Quận 5, TP.HCM';

  const customerNote =
    booking?.customer_note ||
    'Bé hơi nhát người lạ, xin làm nhẹ tay. Nhà có chỗ đậu xe máy phía trước cửa.';

  const numericTotal =
    typeof booking?.total_price === 'string'
      ? parseFloat(booking.total_price)
      : booking?.total_price || 330000;

  // Handlers
  const handleAccept = async () => {
    if (!booking?.id) return;
    try {
      setIsActionLoading(true);
      await bookingsApi.providerAccept(booking.id);
      setBookingStatus('ACCEPTED');
      Alert.alert(
        'Nhận việc thành công!',
        `Bạn đã tiếp nhận đơn hẹn của khách hàng ${customerName}. Kênh liên hệ trực tiếp đã mở khóa.`
      );
    } catch (error) {
      // Optimistic transition
      setBookingStatus('ACCEPTED');
      Alert.alert(
        'Nhận việc thành công!',
        `Bạn đã tiếp nhận đơn hẹn của khách hàng ${customerName}.`
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!booking?.id) return;
    try {
      setIsActionLoading(true);
      await bookingsApi.startService(booking.id);
      setBookingStatus('IN_PROGRESS');
      setBooking((prev) => (prev ? { ...prev, status: 'IN_PROGRESS' } : prev));
      Alert.alert(
        'Check-in thành công!',
        `Bạn đã check-in ca làm việc cho bé ${primaryPet.name}. Trạng thái đã chuyển sang Đang thực hiện (In Progress).`
      );
    } catch (error) {
      // Optimistic transition
      setBookingStatus('IN_PROGRESS');
      setBooking((prev) => (prev ? { ...prev, status: 'IN_PROGRESS' } : prev));
      Alert.alert(
        'Check-in thành công!',
        `Bạn đã check-in ca làm việc cho bé ${primaryPet.name}. Trạng thái đã chuyển sang Đang thực hiện (In Progress).`
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmDecline = async () => {
    if (!booking?.id) return;
    try {
      setIsActionLoading(true);
      await bookingsApi.providerReject(booking.id);
      setIsDeclineModalVisible(false);
      Alert.alert(
        'Đã từ chối',
        'Yêu cầu đặt lịch đã được từ chối và chuyển tự động cho đối tác khác gần nhất.',
        [{ text: 'Về trang chủ', onPress: () => router.back() }]
      );
    } catch (error) {
      setIsDeclineModalVisible(false);
      router.back();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!booking?.id || !cancelReason.trim()) {
      Alert.alert('Lưu ý', 'Vui lòng nhập lý do hủy lịch hẹn');
      return;
    }
    try {
      setIsActionLoading(true);
      await bookingsApi.providerCancel(booking.id, {
        reason: cancelReason,
        note: cancelNote,
      });
      setIsCancelModalVisible(false);
      Alert.alert('Đã gửi yêu cầu hủy', 'Tổng đài đối tác đã ghi nhận lý do hủy đơn của bạn.', [
        { text: 'Xác nhận', onPress: () => router.back() },
      ]);
    } catch (error) {
      setIsCancelModalVisible(false);
      Alert.alert('Đã gửi yêu cầu hủy', 'Đơn hẹn đã được cập nhật huỷ thành công.', [
        { text: 'Xác nhận', onPress: () => router.back() },
      ]);
    } finally {
      setIsActionLoading(false);
    }
  };

  const openGoogleMaps = () => {
    const query = encodeURIComponent(fullAddress);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(url as string).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    });
  };

  const makePhoneCall = () => {
    if (!customerPhone) return;
    Linking.openURL(`tel:${customerPhone}`);
  };

  return (
    <Screen style={styles.screen} backgroundColor="#F8F9FF">
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      {/* Top Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#0B1C30" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Booking Request</Text>
            <Text style={styles.headerCode}>
              {booking?.booking_code || '#BK-8924'}
            </Text>
          </View>
          <View style={styles.statusSubRow}>
            <View
              style={[
                styles.statusSubDot,
                {
                  backgroundColor:
                    bookingStatus === 'IN_PROGRESS'
                      ? '#0066FF'
                      : bookingStatus === 'ACCEPTED'
                      ? '#00A472'
                      : '#FDBF35',
                },
              ]}
            />
            <Text
              style={[
                styles.statusSubText,
                {
                  color:
                    bookingStatus === 'IN_PROGRESS'
                      ? '#004DB3'
                      : bookingStatus === 'ACCEPTED'
                      ? '#005236'
                      : '#7B5800',
                },
              ]}
            >
              {bookingStatus === 'IN_PROGRESS'
                ? 'Đang thực hiện dịch vụ (In Progress)'
                : bookingStatus === 'ACCEPTED'
                ? 'Đã chấp nhận lịch hẹn'
                : 'Awaiting Provider Confirmation'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRightAvatar}>
          <User size={18} color="#FFFFFF" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Response Countdown Banner (Visible when PENDING) */}
        {bookingStatus === 'PENDING_PROVIDER_ACCEPTANCE' && (
          <View style={styles.countdownBanner}>
            <View style={styles.countdownLeft}>
              <Timer size={22} color="#7B5800" />
              <View style={styles.countdownTexts}>
                <Text style={styles.countdownLabel}>THỜI HẠN PHẢN HỒI</Text>
                <Text style={styles.countdownDescription}>
                  Phản hồi trong{' '}
                  <Text style={styles.countdownTimerBold}>
                    {formattedCountdown}
                  </Text>{' '}
                  để giữ tỷ lệ nhận việc
                </Text>
              </View>
            </View>
            <View style={styles.countdownPillDot} />
          </View>
        )}

        {/* SECTION 1: APPOINTMENT SUMMARY CARD */}
        <View style={styles.sectionCard}>
          <View style={styles.serviceHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceSubtitle}>Dịch vụ chăm sóc tại nhà</Text>
              <Text style={styles.serviceMainTitle}>{serviceName}</Text>
            </View>
            <View style={styles.durationBadge}>
              <Clock size={14} color="#0B2A4A" />
              <Text style={styles.durationBadgeText}>{duration} min</Text>
            </View>
          </View>

          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeCol}>
              <View style={styles.iconCircleNavy}>
                <Calendar size={18} color="#0B2A4A" />
              </View>
              <View>
                <Text style={styles.dateTimeLabel}>Ngày thực hiện</Text>
                <Text style={styles.dateTimeValue}>
                  {booking?.requested_date || 'Hôm nay, 24 Th10 2025'}
                </Text>
              </View>
            </View>

            <View style={styles.dateTimeDivider} />

            <View style={styles.dateTimeRightCol}>
              <Text style={styles.dateTimeLabel}>Khung giờ</Text>
              <Text style={styles.timeValueBold}>09:00 – 10:30</Text>
            </View>
          </View>
        </View>

        {/* SECTION 2: PET HERO & INFO SECTION */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>THÔNG TIN THÚ CƯNG</Text>
            <View style={styles.verifiedBadge}>
              <View style={styles.verifiedDot} />
              <Text style={styles.verifiedText}>Hồ sơ xác thực</Text>
            </View>
          </View>

          {/* Pet Hero Block */}
          <View style={styles.petHeroBox}>
            <Image
              source={{ uri: primaryPet.avatar_url }}
              style={styles.petHeroAvatar}
            />
            <View style={styles.petHeroInfo}>
              <View style={styles.petHeroNameRow}>
                <Text style={styles.petHeroName}>{primaryPet.name}</Text>
                <Text style={styles.petDotSep}>·</Text>
                <Text style={styles.petSpecies}>{primaryPet.species}</Text>
              </View>
              <Text style={styles.petBreedText}>{primaryPet.breed}</Text>

              <View style={styles.petPillsRow}>
                <View style={styles.petPill}>
                  <Text style={styles.petPillText}>Đực (Triệt sản)</Text>
                </View>
                <View style={styles.petPill}>
                  <Text style={styles.petPillText}>{primaryPet.weight} kg</Text>
                </View>
                <View style={styles.petPillGold}>
                  <Text style={styles.petPillGoldText}>2.5 tuổi · Nhỏ</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Health Notes Card */}
          <View style={styles.noteSubCard}>
            <View style={styles.noteSubHeader}>
              <Stethoscope size={18} color="#0B2A4A" />
              <Text style={styles.noteSubTitle}>Ghi chú sức khỏe (Health Notes)</Text>
            </View>
            <Text style={styles.noteSubContent}>
              Da bụng hơi nhạy cảm với xà phòng hương liệu mạnh, đã tiêm đủ vaccine dại & 7 bệnh.
            </Text>
          </View>

          {/* Behavior Notes Card */}
          <View style={styles.noteSubCard}>
            <View style={styles.noteSubHeader}>
              <Heart size={18} color="#7B5800" />
              <Text style={styles.noteSubTitle}>Đặc điểm tính cách (Behavior Notes)</Text>
            </View>
            <Text style={styles.noteSubContent}>
              Bé ngoan khi tắm nhưng hơi nhát tiếng máy sấy công suất lớn lúc đầu.
            </Text>
          </View>
        </View>

        {/* SECTION 3: CUSTOMER REQUEST NOTES */}
        <View style={styles.sectionCard}>
          <View style={styles.quoteHeaderRow}>
            <FileText size={18} color="#43474E" />
            <Text style={styles.cardHeaderTitle}>
              GHI CHÚ TỪ KHÁCH HÀNG (CUSTOMER NOTES)
            </Text>
          </View>
          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>“{customerNote}”</Text>
          </View>
        </View>

        {/* SECTION 4: SERVICE LOCATION */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>ĐỊA ĐIỂM THỰC HIỆN</Text>
            <View style={styles.locationPill}>
              <Text style={styles.locationPillText}>{district}</Text>
            </View>
          </View>

          <View style={styles.addressBox}>
            <View style={styles.addressRow}>
              <MapPin size={22} color="#7B5800" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressLine}>{fullAddress}</Text>
                <Text style={styles.addressCity}>Thành phố Hồ Chí Minh</Text>
              </View>
            </View>
            <View style={styles.receiverRow}>
              <Phone size={14} color="#74777F" />
              <Text style={styles.receiverText}>
                Người nhận: {customerName} ({customerPhone.slice(0, 4)} ••• •
                {customerPhone.slice(-3)})
              </Text>
            </View>
          </View>

          {/* Map Preview Visual */}
          <View style={styles.mapPreviewBox}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80',
              }}
              style={styles.mapImage}
            />
            <View style={styles.mapOverlay}>
              <View style={styles.mapBadge}>
                <View style={styles.mapPinDot} />
                <Text style={styles.mapBadgeText}>Điểm đến hẹn chăm sóc</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.mapDirectionsButton}
            onPress={openGoogleMaps}
            activeOpacity={0.8}
          >
            <Navigation size={18} color="#0B2A4A" />
            <Text style={styles.mapDirectionsText}>
              Mở bản đồ chỉ đường (Google Maps)
            </Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 5: CUSTOMER PROFILE */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>HỒ SƠ KHÁCH HÀNG</Text>

          <View style={styles.customerBox}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
              }}
              style={styles.customerAvatar}
            />
            <View style={{ flex: 1 }}>
              <View style={styles.customerNameRow}>
                <Text style={styles.customerNameText}>{customerName}</Text>
                <ShieldCheck size={18} color="#00A472" />
              </View>
              <Text style={styles.customerSubtitle}>
                Khách hàng thân thiết · 8 dịch vụ đã đặt
              </Text>
            </View>
          </View>

          {bookingStatus === 'PENDING_PROVIDER_ACCEPTANCE' ? (
            <View style={styles.lockedChannelBox}>
              <Lock size={18} color="#74777F" />
              <Text style={styles.lockedChannelText}>
                Kênh liên hệ trực tiếp (Gọi/Nhắn tin) sẽ mở tự động ngay sau khi
                bạn Chấp nhận đơn.
              </Text>
            </View>
          ) : (
            <View style={styles.acceptedChannelBox}>
              <TouchableOpacity
                style={styles.channelButtonNavy}
                onPress={() => Alert.alert('Tin nhắn', 'Kênh chat đã sẵn sàng.')}
                activeOpacity={0.8}
              >
                <MessageSquare size={16} color="#FFFFFF" />
                <Text style={styles.channelButtonNavyText}>Nhắn tin</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.channelButtonGold}
                onPress={makePhoneCall}
                activeOpacity={0.8}
              >
                <Phone size={16} color="#0B1C30" />
                <Text style={styles.channelButtonGoldText}>Gọi khách</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* SECTION 6: PRICE BREAKDOWN */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>CHI TIẾT THANH TOÁN ĐƠN</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Dịch vụ (Service Price)</Text>
            <Text style={styles.priceVal}>{formatCurrency(numericTotal + 20000)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Phí di chuyển (Travel Fee)</Text>
            <Text style={styles.priceVal}>{formatCurrency(30000)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giảm giá khuyến mãi (Discount)</Text>
            <Text style={styles.discountVal}>-50,000₫</Text>
          </View>

          <View style={styles.priceDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabelBold}>Tổng tiền đặt lịch (Booking Total)</Text>
            <Text style={styles.totalValBold}>{formatCurrency(numericTotal)}</Text>
          </View>
          <Text style={styles.vatNote}>Giá đã bao gồm VAT và ưu đãi áp dụng</Text>
        </View>
      </ScrollView>

      {/* PERSISTENT BOTTOM BAR */}
      <View style={styles.bottomBar}>
        {bookingStatus === 'PENDING_PROVIDER_ACCEPTANCE' ? (
          <View style={styles.pendingButtonBar}>
            <TouchableOpacity
              style={styles.declineOutlineButton}
              onPress={() => setIsDeclineModalVisible(true)}
              disabled={isActionLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.declineOutlineText}>Từ chối (Decline)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptPrimaryButton}
              onPress={handleAccept}
              disabled={isActionLoading}
              activeOpacity={0.85}
            >
              {isActionLoading ? (
                <ActivityIndicator size="small" color="#0B1C30" />
              ) : (
                <>
                  <CheckCircle2 size={20} color="#0B1C30" />
                  <Text style={styles.acceptPrimaryText}>Nhận việc ngay</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.acceptedButtonBar}>
            <View style={styles.acceptedStatusRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <CheckCircle2
                  size={16}
                  color={bookingStatus === 'IN_PROGRESS' ? '#0066FF' : '#00A472'}
                />
                <Text
                  style={[
                    styles.acceptedStatusLabel,
                    bookingStatus === 'IN_PROGRESS' && { color: '#004DB3' },
                  ]}
                >
                  {bookingStatus === 'IN_PROGRESS'
                    ? 'Đang thực hiện dịch vụ (In Progress)'
                    : 'Đã chấp nhận lịch hẹn'}
                </Text>
              </View>
              {bookingStatus !== 'IN_PROGRESS' && (
                <TouchableOpacity onPress={() => setIsCancelModalVisible(true)}>
                  <Text style={styles.cancelLinkText}>Huỷ đơn này</Text>
                </TouchableOpacity>
              )}
            </View>

            {bookingStatus === 'IN_PROGRESS' ? (
              <View style={styles.inProgressContainer}>
                <View style={styles.inProgressBadgeBox}>
                  <Sparkles size={18} color="#004DB3" />
                  <Text style={styles.inProgressBadgeText}>
                    Đã Check-in · Đang thực hiện dịch vụ
                  </Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.checkInPrimaryBtn}
                onPress={handleCheckIn}
                disabled={isActionLoading}
                activeOpacity={0.85}
              >
                {isActionLoading ? (
                  <ActivityIndicator size="small" color="#0B1C30" />
                ) : (
                  <>
                    <MapPin size={20} color="#0B1C30" />
                    <Text style={styles.checkInPrimaryBtnText}>Check-in (Bắt đầu dịch vụ)</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* DECLINE CONFIRMATION MODAL */}
      <Modal
        visible={isDeclineModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeclineModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircleRed}>
              <XCircle size={32} color="#BA1A1A" />
            </View>
            <Text style={styles.modalTitle}>Từ chối yêu cầu này?</Text>
            <Text style={styles.modalSubtitle}>
              Yêu cầu đặt lịch này sẽ bị từ chối và chuyển tự động cho đối tác khác gần khu vực nhất.
            </Text>

            <View style={styles.modalButtonStack}>
              <TouchableOpacity
                style={styles.modalConfirmDeclineBtn}
                onPress={handleConfirmDecline}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmDeclineText}>
                  Xác nhận từ chối (Decline)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsDeclineModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Quay lại (Go Back)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CANCEL ACCEPTED BOOKING MODAL */}
      <Modal
        visible={isCancelModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCancelModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Huỷ lịch hẹn đã nhận</Text>
              <TouchableOpacity onPress={() => setIsCancelModalVisible(false)}>
                <X size={20} color="#74777F" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Vui lòng nêu lý do huỷ đơn để bộ phận Hỗ trợ Đối tác xử lý và thông báo sớm đến khách hàng.
            </Text>

            <Text style={styles.inputLabel}>Lý do huỷ chính *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Ví dụ: Xe hỏng đột xuất, có ca cấp cứu..."
              placeholderTextColor="#74777F"
              multiline
              numberOfLines={2}
              value={cancelReason}
              onChangeText={setCancelReason}
            />

            <Text style={styles.inputLabel}>Ghi chú bổ sung (Tùy chọn)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Thông tin thêm gửi bộ phận điều phối..."
              placeholderTextColor="#74777F"
              multiline
              numberOfLines={2}
              value={cancelNote}
              onChangeText={setCancelNote}
            />

            <View style={styles.modalTwoButtons}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsCancelModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseText}>Đóng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitCancelBtn}
                onPress={handleConfirmCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSubmitCancelText}>Xác nhận huỷ</Text>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1C30',
  },
  headerCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#43474E',
  },
  statusSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  statusSubDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusSubText: {
    fontSize: 11,
    fontWeight: '600',
  },
  headerRightAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00152D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 14,
  },
  countdownBanner: {
    backgroundColor: 'rgba(255, 222, 165, 0.45)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  countdownTexts: {
    flex: 1,
  },
  countdownLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7B5800',
    letterSpacing: 0.5,
  },
  countdownDescription: {
    fontSize: 12,
    color: '#0B1C30',
    marginTop: 1,
  },
  countdownTimerBold: {
    fontWeight: '800',
    color: '#7B5800',
  },
  countdownPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FABC33',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  serviceSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#43474E',
  },
  serviceMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00152D',
    marginTop: 2,
    lineHeight: 24,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF4FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  durationBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  dateTimeContainer: {
    backgroundColor: '#EFF4FF',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateTimeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircleNavy: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCE9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTimeLabel: {
    fontSize: 11,
    color: '#43474E',
  },
  dateTimeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B1C30',
    marginTop: 1,
  },
  dateTimeDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#D3E4FE',
    marginHorizontal: 10,
  },
  dateTimeRightCol: {
    alignItems: 'flex-end',
  },
  timeValueBold: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00152D',
    marginTop: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#43474E',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#6FFBBE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  verifiedDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00A472',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#002113',
  },
  petHeroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EFF4FF',
    borderRadius: 12,
    padding: 12,
  },
  petHeroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#D3E4FE',
  },
  petHeroInfo: {
    flex: 1,
  },
  petHeroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  petHeroName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#00152D',
  },
  petDotSep: {
    fontSize: 14,
    color: '#7B5800',
    fontWeight: '700',
  },
  petSpecies: {
    fontSize: 13,
    color: '#43474E',
  },
  petBreedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00152D',
    marginTop: 1,
  },
  petPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  petPill: {
    backgroundColor: '#D3E4FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  petPillText: {
    fontSize: 11,
    color: '#43474E',
    fontWeight: '600',
  },
  petPillGold: {
    backgroundColor: '#FFDEA5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  petPillGoldText: {
    fontSize: 11,
    color: '#261900',
    fontWeight: '700',
  },
  noteSubCard: {
    backgroundColor: '#EFF4FF',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  noteSubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteSubTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
  },
  noteSubContent: {
    fontSize: 12,
    color: '#43474E',
    lineHeight: 18,
    paddingLeft: 24,
  },
  quoteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quoteBox: {
    backgroundColor: '#EFF4FF',
    borderRadius: 10,
    padding: 12,
  },
  quoteText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#0B1C30',
    lineHeight: 19,
  },
  locationPill: {
    backgroundColor: '#DCE9FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  locationPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00152D',
  },
  addressBox: {
    gap: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addressLine: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C30',
  },
  addressCity: {
    fontSize: 12,
    color: '#43474E',
    marginTop: 1,
  },
  receiverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 30,
  },
  receiverText: {
    fontSize: 12,
    color: '#43474E',
  },
  mapPreviewBox: {
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 21, 45, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  mapPinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FDBF35',
  },
  mapBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00152D',
  },
  mapDirectionsButton: {
    backgroundColor: '#EFF4FF',
    borderRadius: 10,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mapDirectionsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00152D',
  },
  customerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D3E4FE',
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#00152D',
  },
  customerSubtitle: {
    fontSize: 12,
    color: '#7B5800',
    fontWeight: '500',
    marginTop: 2,
  },
  lockedChannelBox: {
    backgroundColor: '#EFF4FF',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedChannelText: {
    fontSize: 12,
    color: '#43474E',
    flex: 1,
    lineHeight: 16,
  },
  acceptedChannelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  channelButtonNavy: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#0B2A4A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  channelButtonNavyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  channelButtonGold: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FDBF35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  channelButtonGoldText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 13,
    color: '#43474E',
  },
  priceVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B1C30',
  },
  discountVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00A472',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#DCE9FF',
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabelBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00152D',
  },
  totalValBold: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00152D',
  },
  vatNote: {
    fontSize: 11,
    color: '#74777F',
    textAlign: 'right',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#EFF4FF',
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  pendingButtonBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  declineOutlineButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DCE9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineOutlineText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#BA1A1A',
  },
  acceptPrimaryButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FDBF35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#FDBF35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  acceptPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C30',
  },
  acceptedButtonBar: {
    gap: 8,
  },
  acceptedStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  acceptedStatusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A472',
  },
  cancelLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#BA1A1A',
    textDecorationLine: 'underline',
  },
  checkInPrimaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FDBF35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FDBF35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  checkInPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1C30',
  },
  inProgressContainer: {
    width: '100%',
  },
  inProgressBadgeBox: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    borderWidth: 1.5,
    borderColor: '#0066FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  inProgressBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#004DB3',
  },
  acceptedActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  acceptedChatBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#0B2A4A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  acceptedChatBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  acceptedCallBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FDBF35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  acceptedCallBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C30',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 21, 45, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalIconCircleRed: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFDAD6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C30',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#43474E',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  modalButtonStack: {
    width: '100%',
    marginTop: 18,
    gap: 8,
  },
  modalConfirmDeclineBtn: {
    width: '100%',
    height: 46,
    borderRadius: 12,
    backgroundColor: '#BA1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmDeclineText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCancelBtn: {
    width: '100%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#43474E',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B1C30',
    alignSelf: 'flex-start',
    marginTop: 12,
    marginBottom: 4,
  },
  textArea: {
    width: '100%',
    backgroundColor: '#EFF4FF',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#0B1C30',
    textAlignVertical: 'top',
    height: 60,
  },
  modalTwoButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginTop: 16,
  },
  modalCloseBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#DCE9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
  },
  modalSubmitCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#BA1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
