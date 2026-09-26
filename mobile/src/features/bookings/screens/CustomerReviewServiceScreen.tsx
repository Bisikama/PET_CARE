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
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Star,
  Check,
  Minus,
  Sparkles,
  Info,
  Maximize2,
  Flag,
  ArrowRight,
  ThumbsUp,
  Receipt,
  Quote,
  CheckSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { formatCurrency } from '@/core/utils/currency';
import { bookingsApi, BookingListItem } from '@/infrastructure/api/bookings.api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Fallback Evidence Images & Checklist for preview if booking doesn't have live checklist yet
const fallbackEvidence = {
  checkInMedias: [
    {
      id: 'med-ci-1',
      media_url:
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
      caption: 'Lúc tiếp nhận',
      time: '08:58',
    },
    {
      id: 'med-ci-2',
      media_url:
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80',
      caption: 'Kiểm tra tai lông',
      time: '09:02',
    },
  ],
  checkOutMedias: [
    {
      id: 'med-co-1',
      media_url:
        'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
      caption: 'Tạo kiểu hoàn tất',
      isPrimary: true,
      time: '10:30',
    },
    {
      id: 'med-co-2',
      media_url:
        'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80',
      caption: 'Cắt tỉa kẽ đệm chân',
      time: '10:15',
    },
    {
      id: 'med-co-3',
      media_url:
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
      caption: 'Khóe mắt & khuôn mặt',
      time: '10:25',
    },
  ],
  checklist: [
    {
      id: 'chk-1',
      title: 'Kiểm tra da & chải gỡ lông rối',
      status: 'DONE',
      time: 'Done · 09:15',
      note: 'Lông vùng gáy hơi bết nhẹ, đã dùng dầu dưỡng gỡ êm không đau cho bé.',
    },
    {
      id: 'chk-2',
      title: 'Tắm nước ấm & Dầu gội khử mùi thảo mộc',
      status: 'DONE',
      time: 'Done · 09:45',
      note: null,
    },
    {
      id: 'chk-3',
      title: 'Vệ sinh tai & Làm sạch kẽ móng chân',
      status: 'DONE',
      time: 'Done · 10:10',
      note: null,
    },
    {
      id: 'chk-4',
      title: 'Cắt tỉa móng sâu chân sau',
      status: 'SKIPPED',
      time: 'Bỏ qua',
      note: 'Bé hơi nhạy cảm chân sau, chủ nuôi dặn bỏ qua nếu bé sợ.',
    },
  ],
};

export default function CustomerReviewServiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; bookingData?: string }>();

  // Core state
  const [booking, setBooking] = useState<BookingListItem | null>(null);
  const [checklistData, setChecklistData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  // Modals state
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Expanded tasks state
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const toggleExpandTask = (taskId: string) => {
    setExpandedTaskIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Load Booking & Checklist Data
  useEffect(() => {
    let isMounted = true;

    async function loadDetail() {
      setIsLoading(true);

      // 1. Try to load from route params if passed
      if (params.bookingData) {
        try {
          const parsed = JSON.parse(params.bookingData);
          if (isMounted) setBooking(parsed);
        } catch (e) {
          console.warn('Error parsing bookingData param:', e);
        }
      }

      // 2. Fetch from API by id
      const bookingId = params.id;
      if (bookingId) {
        try {
          const [bookingRes, checkRes] = await Promise.allSettled([
            bookingsApi.getBookingById(bookingId),
            bookingsApi.getChecklist(bookingId),
          ]);

          if (isMounted) {
            if (bookingRes.status === 'fulfilled' && bookingRes.value) {
              setBooking(bookingRes.value);
            }
            if (checkRes.status === 'fulfilled' && checkRes.value) {
              setChecklistData(checkRes.value);
            }
          }
        } catch (err) {
          console.warn('Error fetching booking review data:', err);
        }
      }

      if (isMounted) setIsLoading(false);
    }

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [params.id, params.bookingData]);

  // Derived Info
  const pet = booking?.booking_pets?.[0]?.pets;
  const petName = pet?.name || booking?.booking_pets?.[0]?.pet_name || 'Bé cưng';
  const petBreed = pet?.breed || booking?.booking_pets?.[0]?.breed || 'Thú cưng';
  const petWeight = pet?.weight || booking?.booking_pets?.[0]?.weight || '4.5';
  const petAvatar =
    pet?.avatar_url ||
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80';

  const service = booking?.booking_pets?.[0]?.booking_services?.[0]?.provider_services?.services;
  const serviceTitle =
    service?.title ||
    service?.name ||
    booking?.booking_pets?.[0]?.booking_services?.[0]?.service_name ||
    'Tắm spa khử mùi & Cắt tỉa tạo kiểu';

  const providerUser = booking?.provider_profiles?.users;
  const providerName = providerUser?.fullName || 'Trần Thị Mai';
  const providerAvatar =
    providerUser?.avatarUrl ||
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80';
  const providerPhone = providerUser?.phone || '0901234567';

  // Format Date & Time
  const formattedDate = useMemo(() => {
    if (booking?.booking_date) return booking.booking_date;
    const raw = booking?.requested_date || booking?.estimated_start_at || booking?.created_at;
    if (!raw) return 'Hôm nay';
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return 'Hôm nay';
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Hôm nay';
    }
  }, [booking]);

  const formattedTime = useMemo(() => {
    if (booking?.start_time) return booking.start_time;
    if (booking?.time_slots?.start_time) {
      return `${booking.time_slots.start_time}${booking.time_slots.end_time ? ` – ${booking.time_slots.end_time}` : ''
        }`;
    }
    if (booking?.estimated_start_at) {
      try {
        const d = new Date(booking.estimated_start_at);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        }
      } catch { }
    }
    return '09:00 – 10:30';
  }, [booking]);

  const isCompleted = booking?.status === 'COMPLETED';

  // Evidence Photos from DB or Fallback
  const { checkInPhotos, checkOutPhotos } = useMemo(() => {
    const rawMedias: any[] = checklistData?.evidenceMedias || (booking as any)?.booking_media || [];

    const checkIns = rawMedias.filter((m) => m.category === 'CHECK_IN');
    const checkOuts = rawMedias.filter(
      (m) => m.category === 'CHECK_OUT' || m.category === 'IN_PROGRESS' || !m.category
    );

    return {
      checkInPhotos:
        checkIns.length > 0
          ? checkIns.map((m, idx) => ({
            id: m.id || `ci-${idx}`,
            media_url: m.media_url,
            caption: m.caption || (idx === 0 ? 'Lúc tiếp nhận' : 'Kiểm tra hiện trạng'),
            time: m.created_at
              ? new Date(m.created_at).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })
              : '09:00',
          }))
          : fallbackEvidence.checkInMedias,
      checkOutPhotos:
        checkOuts.length > 0
          ? checkOuts.map((m, idx) => ({
            id: m.id || `co-${idx}`,
            media_url: m.media_url,
            caption: m.caption || (idx === 0 ? 'Tạo kiểu hoàn tất' : 'Chi tiết hoàn thiện'),
            isPrimary: idx === 0,
            time: m.created_at
              ? new Date(m.created_at).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })
              : '10:30',
          }))
          : fallbackEvidence.checkOutMedias,
    };
  }, [checklistData, booking]);

  // Tasks from DB or Fallback
  const tasks = useMemo(() => {
    const rawTasks: any[] = checklistData?.checklistItems || [];
    if (rawTasks.length > 0) {
      return rawTasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        time:
          t.status === 'DONE'
            ? `Done · ${t.completedAt
              ? new Date(t.completedAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })
              : 'Hoàn thành'
            }`
            : 'Bỏ qua',
        note: t.note || null,
      }));
    }
    return fallbackEvidence.checklist;
  }, [checklistData]);

  const completedCount = tasks.filter((t) => t.status === 'DONE').length;
  const skippedCount = tasks.filter((t) => t.status === 'SKIPPED').length;

  // Prices
  const totalPrice = useMemo(() => {
    const raw = booking?.total_price ?? booking?.grand_total ?? booking?.total_amount ?? 260000;
    const parsed = typeof raw === 'number' ? raw : parseFloat(raw);
    return isNaN(parsed) ? 260000 : parsed;
  }, [booking]);

  const servicePrice = useMemo(() => {
    const snapshotPrice = (booking as any)?.price_snapshot?.servicePrice;
    if (snapshotPrice) return Number(snapshotPrice);
    const itemPrice = booking?.booking_pets?.[0]?.booking_services?.[0]?.price;
    if (itemPrice) return Number(itemPrice);
    return totalPrice > 50000 ? totalPrice - 30000 : totalPrice;
  }, [booking, totalPrice]);

  const travelFee = (booking as any)?.price_snapshot?.travelFee ?? 30000;
  const discountAmount = Number(booking?.discount_amount || (booking as any)?.price_snapshot?.discountAmount || 0);

  // Actions
  const handleOpenConfirmModal = () => {
    setIsConfirmModalVisible(true);
  };

  const handleFinalConfirm = async () => {
    if (!booking?.id) return;
    setIsConfirming(true);
    try {
      await bookingsApi.customerConfirm(booking.id);
      // Cập nhật trạng thái ngay tại chỗ thành COMPLETED
      setBooking((prev) => (prev ? { ...prev, status: 'COMPLETED' } : prev));
      setIsConfirmModalVisible(false);
      Alert.alert(
        'Nghiệm thu thành công! ⭐',
        'Cảm ơn bạn đã nghiệm thu dịch vụ. Khoản thanh toán đã được giải ngân cho người chăm sóc thú cưng.',
        [
          {
            text: 'Đánh giá dịch vụ 5 Sao',
            onPress: () => {
              router.replace('/(customer)/(tabs)/bookings');
            },
          },
          {
            text: 'Về danh sách lịch hẹn',
            style: 'cancel',
            onPress: () => {
              router.replace('/(customer)/(tabs)/bookings');
            },
          },
        ]
      );
    } catch (err: any) {
      setIsConfirmModalVisible(false);
      Alert.alert(
        'Thông báo',
        err?.response?.data?.message || 'Có lỗi xảy ra khi xác nhận hoàn tất. Vui lòng thử lại.'
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Báo cáo sự cố dịch vụ',
      'Nếu bạn chưa hài lòng với kết quả chăm sóc hoặc phát hiện vấn đề sức khỏe của bé, đội ngũ PetCare sẵn sàng can thiệp bảo vệ quyền lợi cho bạn.',
      [
        { text: 'Đóng', style: 'cancel' },
        {
          text: 'Gọi tổng đài hỗ trợ 24/7',
          onPress: () => Linking.openURL('tel:1900123456'),
        },
      ]
    );
  };

  const handleCallProvider = () => {
    if (providerPhone) {
      Linking.openURL(`tel:${providerPhone}`).catch(() => {
        Alert.alert('Liên hệ', `Số điện thoại của chuyên viên: ${providerPhone}`);
      });
    }
  };

  const handleChatProvider = () => {
    router.push('/(customer)/(tabs)/messages');
  };

  return (
    <Screen
      withPadding={false}
      backgroundColor="#F8F9FF"
      edges={['top', 'left', 'right']}
      style={styles.screen}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color="#0B1C30" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Review Service</Text>
          {isCompleted ? (
            <View style={styles.completedBadge}>
              <CheckCircle2 size={12} color="#15803D" />
              <Text style={styles.completedBadgeText}>Đã hoàn tất & nghiệm thu</Text>
            </View>
          ) : (
            <View style={styles.waitingBadge}>
              <View style={styles.waitingDot} />
              <Text style={styles.waitingBadgeText}>Chờ bạn xác nhận nghiệm thu</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.headerRightAction}
          onPress={handleReportIssue}
          activeOpacity={0.7}
        >
          <Flag size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT SCROLL */}
      {isLoading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#0B2A4A" />
          <Text style={styles.loadingText}>Đang tải chi tiết nghiệm thu dịch vụ...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. PET & SERVICE SUMMARY CARD */}
          <View style={styles.card}>
            <View style={styles.petSummaryRow}>
              <View style={styles.petAvatarWrap}>
                <Image source={{ uri: petAvatar }} style={styles.petAvatar} />
                <View style={styles.petCheckBadge}>
                  <Text style={styles.petCheckText}>✓</Text>
                </View>
              </View>

              <View style={styles.petInfoWrap}>
                <View style={styles.petNameRow}>
                  <Text style={styles.petName} numberOfLines={1}>
                    Bé {petName}
                  </Text>
                  <View style={styles.petTagPill}>
                    <Text style={styles.petTagPillText}>
                      {petBreed} · {petWeight} kg
                    </Text>
                  </View>
                </View>

                <Text style={styles.serviceTitleText} numberOfLines={2}>
                  {serviceTitle}
                </Text>

                <View style={styles.scheduleRow}>
                  <Clock size={14} color="#74777F" />
                  <Text style={styles.scheduleText}>
                    {formattedDate} · {formattedTime}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 2. PROVIDER CARD */}
          <View style={styles.card}>
            <View style={styles.providerRow}>
              <Image source={{ uri: providerAvatar }} style={styles.providerAvatar} />
              <View style={styles.providerInfo}>
                <Text style={styles.providerNameText}>{providerName}</Text>
                <View style={styles.providerMetaRow}>
                  <View style={styles.ratingBadge}>
                    <Star size={12} color="#7B5800" fill="#7B5800" />
                    <Text style={styles.ratingBadgeText}>4.9 (128)</Text>
                  </View>
                  <View style={styles.verifiedRow}>
                    <ShieldCheck size={14} color="#00A472" />
                    <Text style={styles.verifiedText}>Verified Groomer</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.providerActionButtons}>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={handleChatProvider}
                activeOpacity={0.8}
              >
                <MessageSquare size={16} color="white" />
                <Text style={styles.chatButtonText}>Nhắn tin</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallProvider}
                activeOpacity={0.8}
              >
                <Phone size={16} color="#0B1C30" />
                <Text style={styles.callButtonText}>Gọi điện</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. BEFORE SERVICE (Lúc tiếp nhận) */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderTitleRow}>
                <CheckSquare size={18} color="#00152D" />
                <Text style={styles.sectionTitle}>Before Service (Lúc tiếp nhận)</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{checkInPhotos.length} ảnh</Text>
              </View>
            </View>

            <View style={styles.mediaGridTwo}>
              {checkInPhotos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  style={styles.mediaItemContainer}
                  activeOpacity={0.9}
                  onPress={() => setPreviewImageUrl(photo.media_url)}
                >
                  <Image source={{ uri: photo.media_url }} style={styles.mediaItemImage} />
                  <View style={styles.mediaGradientOverlay}>
                    <Text style={styles.mediaCaptionText}>{photo.caption}</Text>
                    <Text style={styles.mediaTimeText}>{photo.time}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 4. SERVICE RESULT (Kết quả hoàn tất) */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderTitleRow}>
                <Sparkles size={20} color="#7B5800" />
                <Text style={styles.sectionTitle}>Service Result (Kết quả hoàn tất)</Text>
              </View>
              <View style={styles.resultBadge}>
                <Text style={styles.resultBadgeText}>{checkOutPhotos.length} ảnh kết quả</Text>
              </View>
            </View>

            {/* Primary Showcase Photo */}
            {checkOutPhotos.length > 0 && (
              <TouchableOpacity
                style={styles.showcasePhotoContainer}
                activeOpacity={0.95}
                onPress={() => setPreviewImageUrl(checkOutPhotos[0].media_url)}
              >
                <Image
                  source={{ uri: checkOutPhotos[0].media_url }}
                  style={styles.showcasePhotoImage}
                />
                <View style={styles.showcaseBadgeOverlay}>
                  <CheckCircle2 size={13} color="white" />
                  <Text style={styles.showcaseBadgeText}>Tạo kiểu hoàn tất</Text>
                </View>
                <View style={styles.zoomButtonCircle}>
                  <Maximize2 size={15} color="#0B1C30" />
                </View>
              </TouchableOpacity>
            )}

            {/* Detail shots */}
            {checkOutPhotos.length > 1 && (
              <View style={styles.mediaGridTwo}>
                {checkOutPhotos.slice(1).map((photo) => (
                  <TouchableOpacity
                    key={photo.id}
                    style={styles.mediaItemContainer}
                    activeOpacity={0.9}
                    onPress={() => setPreviewImageUrl(photo.media_url)}
                  >
                    <Image source={{ uri: photo.media_url }} style={styles.mediaItemImage} />
                    <View style={styles.mediaGradientOverlay}>
                      <Text style={styles.mediaCaptionText}>{photo.caption}</Text>
                      <Maximize2 size={13} color="white" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.infoHintRow}>
              <Info size={14} color="#74777F" />
              <Text style={styles.infoHintText}>
                Nhấn vào ảnh để xem chi tiết ở chế độ toàn màn hình.
              </Text>
            </View>
          </View>

          {/* 5. SERVICE TASKS (Checklist Summary) */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderTitleRow}>
                <CheckSquare size={18} color="#00152D" />
                <Text style={styles.sectionTitle}>Hạng mục thực hiện</Text>
              </View>
              <Text style={styles.taskSummaryCount}>
                {completedCount} xong{skippedCount > 0 ? ` · ${skippedCount} bỏ qua` : ''}
              </Text>
            </View>

            <View style={styles.tasksListWrap}>
              {tasks.map((task) => {
                const isDone = task.status === 'DONE';
                const isExpanded = !!expandedTaskIds[task.id];

                return (
                  <TouchableOpacity
                    key={task.id}
                    style={[styles.taskItemCard, isExpanded && styles.taskItemCardExpanded]}
                    onPress={() => toggleExpandTask(task.id)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.taskItemHeader}>
                      <View style={styles.taskTitleRow}>
                        <View
                          style={[
                            styles.taskStatusIconCircle,
                            isDone ? styles.taskDoneCircle : styles.taskSkippedCircle,
                          ]}
                        >
                          {isDone ? (
                            <Check size={12} color="#002113" strokeWidth={3} />
                          ) : (
                            <Minus size={12} color="#7B5800" strokeWidth={3} />
                          )}
                        </View>
                        <Text
                          style={styles.taskTitleText}
                          numberOfLines={isExpanded ? undefined : 1}
                        >
                          {task.title}
                        </Text>
                      </View>

                      <View style={styles.taskHeaderRight}>
                        <Text
                          style={[
                            styles.taskTimeText,
                            isDone ? styles.taskDoneText : styles.taskSkippedText,
                          ]}
                        >
                          {task.time}
                        </Text>
                        <View style={styles.expandChevronWrap}>
                          {isExpanded ? (
                            <ChevronUp size={16} color="#43474E" />
                          ) : (
                            <ChevronDown size={16} color="#43474E" />
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Nội dung chi tiết khi mở rộng */}
                    {isExpanded && (
                      <View style={styles.taskExpandedBody}>
                        {task.note ? (
                          <View style={styles.taskNoteBox}>
                            <Text style={styles.taskNoteLabel}>Ghi chú chi tiết:</Text>
                            <Text style={styles.taskNoteText}>{task.note}</Text>
                          </View>
                        ) : (
                          <Text style={styles.taskStandardText}>
                            ✓ Hạng mục đã được chuyên viên thực hiện đầy đủ theo đúng tiêu chuẩn PetCare.
                          </Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 6. PROVIDER HANDOVER NOTE */}
          <View style={styles.card}>
            <View style={styles.cardHeaderTitleRow}>
              <Quote size={18} color="#00152D" />
              <Text style={styles.sectionTitle}>Lời nhắn từ người chăm sóc</Text>
            </View>

            <View style={styles.providerNoteContainer}>
              <Image source={{ uri: providerAvatar }} style={styles.noteProviderAvatar} />
              <View style={styles.noteContentWrap}>
                <Text style={styles.noteBodyText}>
                  {booking?.provider_note ||
                    '“Bé rất ngoan và hợp tác trong suốt buổi làm đẹp. Đã vệ sinh sạch khóe mắt và tai, tỉa gọn chân trước và sau. Bé vui vẻ, thơm mát và ăn hết bánh thưởng sau khi xong.”'}
                </Text>
                <Text style={styles.noteAuthorText}>— {providerName} (Chuyên viên chăm sóc)</Text>
              </View>
            </View>
          </View>

          {/* 7. PAYMENT SUMMARY & ESCROW SECURITY */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderTitleRow}>
                <Receipt size={18} color="#00152D" />
                <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
              </View>
              <View style={[styles.escrowStatusBadge, isCompleted && styles.escrowStatusBadgeCompleted]}>
                <Text style={[styles.escrowStatusText, isCompleted && styles.escrowStatusTextCompleted]}>
                  {isCompleted ? 'Đã giải ngân' : 'Đã tạm giữ'}
                </Text>
              </View>
            </View>

            <View style={styles.priceBreakdownWrap}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Giá dịch vụ (Spa trọn gói)</Text>
                <Text style={styles.priceValue}>{formatCurrency(servicePrice)} đ</Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Phí di chuyển tận nơi</Text>
                <Text style={styles.priceValue}>{formatCurrency(travelFee)} đ</Text>
              </View>

              {discountAmount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Ưu đãi voucher chăm sóc bé</Text>
                  <Text style={styles.discountValue}>-{formatCurrency(discountAmount)} đ</Text>
                </View>
              )}

              <View style={styles.priceDivider} />

              <View style={styles.totalPriceRow}>
                <Text style={styles.totalPriceLabel}>Tổng tiền đã thanh toán</Text>
                <Text style={styles.totalPriceValue}>{formatCurrency(totalPrice)} đ</Text>
              </View>
            </View>

            {/* Escrow Guarantee Box */}
            <View style={[styles.escrowCard, isCompleted && styles.escrowCardCompleted]}>
              <ShieldCheck size={24} color={isCompleted ? "#6FFBBE" : "#FDBF35"} style={styles.escrowIcon} />
              <View style={styles.escrowContent}>
                <Text style={styles.escrowTitle}>
                  {isCompleted ? 'Dịch vụ đã hoàn tất & giải ngân an toàn' : 'Thanh toán được bảo vệ (Escrow)'}
                </Text>
                <Text style={styles.escrowSubtext}>
                  {isCompleted
                    ? 'Bạn đã hoàn thành nghiệm thu dịch vụ. Toàn bộ tiền đã được giải ngân an toàn cho người chăm sóc thú cưng.'
                    : 'Khoản thanh toán hiện đang được giữ an toàn. Chỉ khi bạn bấm xác nhận dịch vụ hoàn tất, tiền mới được giải ngân cho người chăm sóc.'}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>
      )}

      {/* FIXED BOTTOM ACTION BAR */}
      <View style={styles.fixedBottomBar}>
        <TouchableOpacity
          style={styles.reportBottomBtn}
          onPress={handleReportIssue}
          activeOpacity={0.8}
        >
          <Flag size={18} color="#BA1A1A" />
          <Text style={styles.reportBottomText}>Báo sự cố</Text>
        </TouchableOpacity>

        {isCompleted ? (
          <TouchableOpacity
            style={styles.completedReviewBtn}
            onPress={() => {
              Alert.alert(
                'Đánh giá dịch vụ ⭐',
                `Bạn cảm thấy dịch vụ của ${providerName} như thế nào?`,
                [
                  { text: 'Đóng', style: 'cancel' },
                  {
                    text: 'Gửi 5 Sao ⭐',
                    onPress: () => {
                      Alert.alert('Cảm ơn bạn!', 'Đánh giá 5 sao của bạn đã được ghi nhận.');
                      router.replace('/(customer)/(tabs)/bookings');
                    },
                  },
                ]
              );
            }}
            activeOpacity={0.85}
          >
            <Star size={18} color="#002113" fill="#002113" />
            <Text style={styles.completedReviewText}>Đánh giá dịch vụ 5 Sao</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.confirmBottomBtn}
            onPress={handleOpenConfirmModal}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmBottomText}>Xác nhận hoàn tất</Text>
            <ArrowRight size={18} color="#6E4F00" />
          </TouchableOpacity>
        )}
      </View>

      {/* CONFIRMATION BOTTOM SHEET MODAL */}
      <Modal
        visible={isConfirmModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsConfirmModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setIsConfirmModalVisible(false)}
          />

          <View style={styles.modalCard}>
            {/* Drag Handle */}
            <View style={styles.modalDragHandle} />

            {/* Icon & Title */}
            <View style={styles.modalHeaderCenter}>
              <View style={styles.modalIconCircle}>
                <CheckCircle2 size={32} color="#7B5800" />
              </View>
              <Text style={styles.modalTitle}>Xác nhận hoàn tất dịch vụ?</Text>
              <Text style={styles.modalSubtitle}>
                Vui lòng chắc chắn bạn đã kiểm tra đầy đủ hình ảnh và bé {petName} trước khi xác nhận.
              </Text>
            </View>

            {/* 3 Consequences Breakdown */}
            <View style={styles.consequencesBox}>
              <View style={styles.consequenceItem}>
                <CheckCircle2 size={16} color="#005236" style={{ marginTop: 2 }} />
                <Text style={styles.consequenceText}>
                  Đơn dịch vụ sẽ được đánh dấu hoàn thành chính thức
                </Text>
              </View>

              <View style={styles.consequenceItem}>
                <CheckCircle2 size={16} color="#005236" style={{ marginTop: 2 }} />
                <Text style={styles.consequenceText}>
                  Số tiền tạm giữ <Text style={styles.boldText}>{formatCurrency(totalPrice)} đ</Text> sẽ
                  được giải ngân cho {providerName}
                </Text>
              </View>

              <View style={styles.consequenceItem}>
                <CheckCircle2 size={16} color="#005236" style={{ marginTop: 2 }} />
                <Text style={styles.consequenceText}>
                  Bạn có thể đánh giá 5 sao và để lại lời cảm ơn người chăm sóc
                </Text>
              </View>
            </View>

            {/* Modal Action Buttons */}
            <View style={styles.modalActionsWrap}>
              <TouchableOpacity
                style={styles.modalFinalConfirmBtn}
                onPress={handleFinalConfirm}
                disabled={isConfirming}
                activeOpacity={0.85}
              >
                {isConfirming ? (
                  <ActivityIndicator size="small" color="#6E4F00" />
                ) : (
                  <>
                    <ThumbsUp size={18} color="#6E4F00" />
                    <Text style={styles.modalFinalConfirmText}>Tôi đồng ý & Xác nhận hoàn tất</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDismissBtn}
                onPress={() => setIsConfirmModalVisible(false)}
                disabled={isConfirming}
                activeOpacity={0.7}
              >
                <Text style={styles.modalDismissText}>Xem lại sau</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FULLSCREEN IMAGE VIEWER MODAL */}
      <Modal
        visible={!!previewImageUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <View style={styles.imageViewerBackdrop}>
          <TouchableOpacity
            style={styles.imageViewerCloseBtn}
            onPress={() => setPreviewImageUrl(null)}
            activeOpacity={0.8}
          >
            <X size={24} color="white" />
          </TouchableOpacity>

          {previewImageUrl && (
            <Image
              source={{ uri: previewImageUrl }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#F8F9FF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(11,42,74,0.06)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1C30',
  },
  waitingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    backgroundColor: 'rgba(253,191,53,0.18)',
    marginTop: 2,
  },
  waitingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7B5800',
  },
  waitingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7B5800',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    backgroundColor: '#DCFCE7',
    marginTop: 2,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  headerRightAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EFF4FF',
    gap: 12,
  },
  petSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  petAvatarWrap: {
    position: 'relative',
  },
  petAvatar: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#E5EEFF',
  },
  petCheckBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6FFBBE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  petCheckText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#002113',
  },
  petInfoWrap: {
    flex: 1,
    gap: 3,
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1C30',
  },
  petTagPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    backgroundColor: '#E5EEFF',
  },
  petTagPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#43474E',
  },
  serviceTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00152D',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  scheduleText: {
    fontSize: 12,
    color: '#43474E',
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5EEFF',
  },
  providerInfo: {
    flex: 1,
    gap: 3,
  },
  providerNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1C30',
  },
  providerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
    backgroundColor: 'rgba(253,191,53,0.22)',
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7B5800',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00A472',
  },
  providerActionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  chatButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#00152D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chatButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
  callButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#DCE9FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  callButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1C30',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 99,
    backgroundColor: '#E5EEFF',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#43474E',
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 99,
    backgroundColor: 'rgba(253,191,53,0.2)',
  },
  resultBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7B5800',
  },
  mediaGridTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  mediaItemContainer: {
    flex: 1,
    aspectRatio: 4 / 3,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E5EEFF',
    position: 'relative',
  },
  mediaItemImage: {
    width: '100%',
    height: '100%',
  },
  mediaGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 21, 45, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mediaCaptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mediaTimeText: {
    fontSize: 10,
    color: '#DCE9FF',
  },
  showcasePhotoContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E5EEFF',
    position: 'relative',
    marginTop: 2,
  },
  showcasePhotoImage: {
    width: '100%',
    height: '100%',
  },
  showcaseBadgeOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: 'rgba(0, 21, 45, 0.8)',
  },
  showcaseBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  zoomButtonCircle: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  infoHintText: {
    fontSize: 12,
    color: '#74777F',
  },
  taskSummaryCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#43474E',
  },
  tasksListWrap: {
    gap: 8,
  },
  taskItemCard: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  taskItemCardExpanded: {
    backgroundColor: '#E5EEFF',
    borderColor: 'rgba(11, 42, 74, 0.12)',
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  taskItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 6,
  },
  taskHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expandChevronWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  taskStatusIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskDoneCircle: {
    backgroundColor: '#6FFBBE',
  },
  taskSkippedCircle: {
    backgroundColor: '#FDBF35',
  },
  taskTitleText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
    lineHeight: 18,
  },
  taskTimeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  taskDoneText: {
    color: '#00A472',
  },
  taskSkippedText: {
    color: '#7B5800',
  },
  taskExpandedBody: {
    paddingTop: 4,
    paddingLeft: 28,
    gap: 6,
  },
  taskNoteBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    gap: 3,
    borderWidth: 1,
    borderColor: '#DCE9FF',
  },
  taskNoteLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00152D',
  },
  taskNoteText: {
    fontSize: 12,
    color: '#43474E',
    lineHeight: 17,
  },
  taskStandardText: {
    fontSize: 12,
    color: '#005236',
    lineHeight: 17,
  },
  providerNoteContainer: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  noteProviderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginTop: 2,
  },
  noteContentWrap: {
    flex: 1,
    gap: 4,
  },
  noteBodyText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#0B1C30',
    lineHeight: 19,
  },
  noteAuthorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#43474E',
  },
  escrowStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    backgroundColor: '#6FFBBE',
  },
  escrowStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#002113',
  },
  priceBreakdownWrap: {
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: '#43474E',
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B1C30',
  },
  discountValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#BA1A1A',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#E5EEFF',
    marginVertical: 4,
  },
  totalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPriceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C30',
  },
  totalPriceValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#00152D',
  },
  escrowCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#00152D',
  },
  escrowIcon: {
    marginTop: 2,
  },
  escrowContent: {
    flex: 1,
    gap: 3,
  },
  escrowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  escrowSubtext: {
    fontSize: 11,
    color: '#DCE9FF',
    lineHeight: 16,
  },
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(11,42,74,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    gap: 12,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  reportBottomBtn: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportBottomText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#BA1A1A',
  },
  confirmBottomBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FDBF35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FDBF35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBottomText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6E4F00',
  },
  completedReviewBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#6FFBBE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#6FFBBE',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  completedReviewText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#002113',
  },
  escrowCardCompleted: {
    borderColor: '#059669',
    backgroundColor: '#001E17',
  },
  escrowStatusBadgeCompleted: {
    backgroundColor: '#DCFCE7',
  },
  escrowStatusTextCompleted: {
    color: '#15803D',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 21, 45, 0.55)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  modalDragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5EEFF',
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalHeaderCenter: {
    alignItems: 'center',
    gap: 6,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(253,191,53,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0B1C30',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#43474E',
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  consequencesBox: {
    backgroundColor: '#EFF4FF',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  consequenceText: {
    flex: 1,
    fontSize: 13,
    color: '#0B1C30',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '800',
    color: '#00152D',
  },
  modalActionsWrap: {
    gap: 8,
    marginTop: 4,
  },
  modalFinalConfirmBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FDBF35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalFinalConfirmText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6E4F00',
  },
  modalDismissBtn: {
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDismissText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#43474E',
  },
  imageViewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2,
  },
});
