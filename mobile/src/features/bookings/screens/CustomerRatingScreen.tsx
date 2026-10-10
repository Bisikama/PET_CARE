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
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  ShieldCheck,
  Send,
  ArrowRight,
  Sparkles,
  Info,
  Check,
  Award,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { bookingsApi, BookingListItem } from '@/infrastructure/api/bookings.api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ratingLabels: Record<number, string> = {
  1: '1 — Kém',
  2: '2 — Trung bình',
  3: '3 — Tốt',
  4: '4 — Rất tốt',
  5: '5 — Xuất sắc',
};

const quickTags = [
  'Nhẹ nhàng với bé ✨',
  'Thơm mát & sạch sẽ 🫧',
  'Đúng giờ & chu đáo 👍',
  'Tay nghề chuyên nghiệp ✂️',
  'Bé rất thích chuyên viên 🐾',
];

export default function CustomerRatingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; bookingData?: string }>();

  // State
  const [booking, setBooking] = useState<BookingListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState<number>(5); // Default to 5 stars for high conversion
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isAlreadyReviewed, setIsAlreadyReviewed] = useState(false);

  // Load detail
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);

      // 1. Try param bookingData
      if (params.bookingData) {
        try {
          const parsed = JSON.parse(params.bookingData);
          if (isMounted) {
            setBooking(parsed);
            if (parsed.reviews && parsed.reviews.length > 0) {
              setIsAlreadyReviewed(true);
              setRating(parsed.reviews[0].rating || 5);
              setComment(parsed.reviews[0].comment || '');
            }
          }
        } catch (e) {
          console.warn('Error parsing bookingData param:', e);
        }
      }

      // 2. Fetch fresh booking by id
      const bookingId = params.id;
      if (bookingId) {
        try {
          const fresh = await bookingsApi.getBookingById(bookingId);
          if (isMounted && fresh) {
            setBooking(fresh);
            if (fresh.reviews && fresh.reviews.length > 0) {
              setIsAlreadyReviewed(true);
              setRating(fresh.reviews[0].rating || 5);
              setComment(fresh.reviews[0].comment || '');
            }
          }
        } catch (err) {
          console.warn('Error fetching booking detail for rating:', err);
        }
      }

      if (isMounted) setIsLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [params.id, params.bookingData]);

  // Derived Info
  const provider = booking?.provider_profiles?.users;
  const providerName = provider?.fullName || 'Chuyên viên PetCare';
  const providerAvatar =
    provider?.avatarUrl ||
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80';

  const pet = booking?.booking_pets?.[0]?.pets;
  const petName = pet?.name || booking?.booking_pets?.[0]?.pet_name || 'Bé cưng';
  const petBreed = pet?.breed || booking?.booking_pets?.[0]?.breed || 'Thú cưng';

  const service = booking?.booking_pets?.[0]?.booking_services?.[0]?.provider_services?.services;
  const serviceTitle =
    service?.title ||
    service?.name ||
    booking?.booking_pets?.[0]?.booking_services?.[0]?.service_name ||
    'Dịch vụ chăm sóc thú cưng';

  // Append quick tag to comment
  const handleAppendTag = (tagText: string) => {
    if (comment.includes(tagText)) return;
    setComment((prev) => (prev.trim() ? `${prev.trim()} • ${tagText}` : tagText));
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!booking?.id) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin đơn đặt lịch để đánh giá.');
      return;
    }
    if (rating === 0) {
      Alert.alert('Chưa chọn số sao', 'Vui lòng chọn số sao trải nghiệm trước khi gửi đánh giá.');
      return;
    }

    setIsSubmitting(true);
    try {
      await bookingsApi.submitReview(booking.id, {
        rating,
        comment: comment.trim() || undefined,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Có lỗi xảy ra khi gửi đánh giá. Có thể đơn đã được đánh giá trước đó.';
      if (err?.response?.status === 409) {
        // Already reviewed
        setIsAlreadyReviewed(true);
        Alert.alert('Thông báo', 'Đơn đặt lịch này đã được đánh giá trước đó.');
      } else {
        Alert.alert('Thông báo', msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    setShowSuccessModal(false);
    router.replace('/(customer)/(tabs)/bookings');
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
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(customer)/(tabs)/bookings');
            }
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color="#0B1C30" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Đánh giá dịch vụ</Text>
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace('/(customer)/(tabs)/bookings')}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Để sau</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {isLoading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#0B2A4A" />
            <Text style={styles.loadingText}>Đang tải thông tin đánh giá...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. BOOKING SUMMARY CARD */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryAvatarWrap}>
                <Image source={{ uri: providerAvatar }} style={styles.providerAvatar} />
                <View style={styles.verifiedBadge}>
                  <Check size={11} color="#FFFFFF" strokeWidth={3} />
                </View>
              </View>

              <View style={styles.summaryInfo}>
                <View style={styles.summaryNameRow}>
                  <Text style={styles.providerNameText} numberOfLines={1}>
                    {providerName}
                  </Text>
                  <View style={styles.completedPill}>
                    <Text style={styles.completedPillText}>Đã hoàn tất</Text>
                  </View>
                </View>

                <Text style={styles.serviceTitleText} numberOfLines={1}>
                  {serviceTitle}
                </Text>

                <View style={styles.petMetaRow}>
                  <Text style={styles.petMetaText}>
                    🐾 <Text style={styles.petNameBold}>{petName}</Text> · {petBreed}
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. STAR RATING SECTION */}
            <View style={styles.card}>
              <View style={styles.requiredBadge}>
                <View style={styles.requiredDot} />
                <Text style={styles.requiredText}>Bắt buộc đánh giá</Text>
              </View>

              <Text style={styles.ratingSectionTitle}>Trải nghiệm của bạn thế nào?</Text>
              <Text style={styles.ratingSectionSubtitle}>
                Chạm vào số sao để đánh giá chuyên viên và chất lượng dịch vụ
              </Text>

              {/* 5 STARS ROW */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = starVal <= rating;
                  return (
                    <TouchableOpacity
                      key={starVal}
                      style={[
                        styles.starButton,
                        isFilled && styles.starButtonActive,
                        isAlreadyReviewed && { opacity: 0.8 },
                      ]}
                      onPress={() => !isAlreadyReviewed && setRating(starVal)}
                      activeOpacity={0.7}
                      disabled={isAlreadyReviewed}
                    >
                      <Star
                        size={38}
                        color={isFilled ? '#FDBF35' : '#CBD5E1'}
                        fill={isFilled ? '#FDBF35' : 'transparent'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* DYNAMIC RATING PILL */}
              <View
                style={[
                  styles.ratingFeedbackPill,
                  rating > 0 ? styles.ratingFeedbackPillActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.ratingFeedbackText,
                    rating > 0 ? styles.ratingFeedbackTextActive : null,
                  ]}
                >
                  {rating > 0 ? ratingLabels[rating] : 'Chạm để chọn số sao'}
                </Text>
              </View>
            </View>

            {/* 3. COMMENT INPUT SECTION */}
            <View style={styles.card}>
              <View style={styles.commentHeaderRow}>
                <View style={styles.commentTitleWrap}>
                  <Text style={styles.commentSectionTitle}>Chia sẻ trải nghiệm</Text>
                  <Text style={styles.commentOptionalText}>(Không bắt buộc)</Text>
                </View>
                <Text style={[styles.charCountText, comment.length > 900 && styles.charCountWarning]}>
                  {comment.length} / 1000
                </Text>
              </View>

              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.commentInput}
                  multiline
                  numberOfLines={4}
                  maxLength={1000}
                  placeholder={`Kể cho các chủ nuôi khác nghe về sự nhẹ nhàng, chu đáo với bé ${petName} và chất lượng dịch vụ sau khi hoàn thành…`}
                  placeholderTextColor="#74777F"
                  value={comment}
                  onChangeText={setComment}
                  editable={!isAlreadyReviewed}
                  textAlignVertical="top"
                />
              </View>

              {/* QUICK DELIGHT CHIPS */}
              {!isAlreadyReviewed && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.quickTagsScroll}
                >
                  {quickTags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.quickTagChip,
                        comment.includes(tag) && styles.quickTagChipSelected,
                      ]}
                      onPress={() => handleAppendTag(tag)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.quickTagText,
                          comment.includes(tag) && styles.quickTagTextSelected,
                        ]}
                      >
                        + {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* 4. COMMUNITY TRUST NOTICE */}
            <View style={styles.trustCard}>
              <ShieldCheck size={20} color="#0B2A4A" style={styles.trustIcon} />
              <Text style={styles.trustText}>
                Đánh giá của bạn sẽ được hiển thị công khai để giúp cộng đồng người nuôi thú cưng
                PET_LOVE chọn được dịch vụ uy tín và an tâm nhất.
              </Text>
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* FIXED BOTTOM ACTION BAR */}
      {!isLoading && (
        <View style={styles.fixedBottomBar}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (rating === 0 || isAlreadyReviewed) && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmitReview}
            disabled={rating === 0 || isSubmitting || isAlreadyReviewed}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#6E4F00" />
            ) : isAlreadyReviewed ? (
              <>
                <CheckCircle2 size={18} color="#005236" />
                <Text style={[styles.submitBtnText, { color: '#005236' }]}>
                  Đơn đã được đánh giá
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.submitBtnText}>Gửi đánh giá</Text>
                <Send size={18} color="#6E4F00" />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.bottomHelperText}>
            {isAlreadyReviewed
              ? 'Cảm ơn bạn đã gửi đánh giá trước đó'
              : rating === 0
              ? 'Vui lòng chọn số sao để gửi đánh giá'
              : 'Nhấn Gửi đánh giá để hoàn tất'}
          </Text>
        </View>
      )}

      {/* SUCCESS BOTTOM SHEET MODAL */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="slide"
        onRequestClose={handleFinish}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalDragHandle} />

            {/* Celebratory Pet Visual */}
            <View style={styles.celebrationCircle}>
              <Image
                source={{
                  uri:
                    pet?.avatar_url ||
                    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80',
                }}
                style={styles.celebrationImage}
              />
              <View style={styles.celebrationBadge}>
                <Award size={20} color="#6E4F00" />
              </View>
            </View>

            {/* Header Badge */}
            <View style={styles.successSubmittedBadge}>
              <CheckCircle2 size={14} color="#00A472" />
              <Text style={styles.successSubmittedText}>ĐÃ GỬI THÀNH CÔNG</Text>
            </View>

            <Text style={styles.modalTitle}>Cảm ơn đánh giá của bạn!</Text>
            <Text style={styles.modalSubtitle}>
              Những chia sẻ quý báu của bạn giúp cộng đồng chọn được chuyên viên uy tín và là nguồn
              động viên to lớn cho {providerName}.
            </Text>

            {/* Review Summary Snippet */}
            <View style={styles.summarySnippetCard}>
              <View>
                <Text style={styles.snippetLabel}>Đánh giá ghi nhận</Text>
                <Text style={styles.snippetValue}>{ratingLabels[rating] || '5 — Xuất sắc'}</Text>
              </View>

              <View style={styles.snippetStarsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={18}
                    color={s <= rating ? '#FDBF35' : '#CBD5E1'}
                    fill={s <= rating ? '#FDBF35' : 'transparent'}
                  />
                ))}
              </View>
            </View>

            {/* Finish Button */}
            <TouchableOpacity
              style={styles.modalFinishBtn}
              onPress={handleFinish}
              activeOpacity={0.85}
            >
              <Text style={styles.modalFinishText}>Về danh sách lịch hẹn</Text>
              <ArrowRight size={18} color="#FFFFFF" />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: 'rgba(248, 249, 255, 0.95)',
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
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: '#EFF4FF',
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#43474E',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 14,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EFF4FF',
  },
  summaryAvatarWrap: {
    position: 'relative',
    width: 56,
    height: 56,
  },
  providerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5EEFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00A472',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  summaryInfo: {
    flex: 1,
    gap: 3,
  },
  summaryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  providerNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1C30',
    flex: 1,
  },
  completedPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    backgroundColor: '#E5EEFF',
  },
  completedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#43474E',
  },
  serviceTitleText: {
    fontSize: 13,
    color: '#43474E',
  },
  petMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  petMetaText: {
    fontSize: 12,
    color: '#0B1C30',
  },
  petNameBold: {
    fontWeight: '700',
    color: '#00152D',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EFF4FF',
    alignItems: 'center',
  },
  requiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
    backgroundColor: '#E5EEFF',
    marginBottom: 8,
  },
  requiredDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FDBF35',
  },
  requiredText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B1C30',
  },
  ratingSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00152D',
    textAlign: 'center',
  },
  ratingSectionSubtitle: {
    fontSize: 13,
    color: '#43474E',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 16,
  },
  starButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  starButtonActive: {
    backgroundColor: 'rgba(253,191,53,0.12)',
  },
  ratingFeedbackPill: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#E5EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingFeedbackPillActive: {
    backgroundColor: '#FFDEA5',
  },
  ratingFeedbackText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#43474E',
  },
  ratingFeedbackTextActive: {
    color: '#6E4F00',
    fontWeight: '800',
  },
  commentHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  commentTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  commentSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#00152D',
  },
  commentOptionalText: {
    fontSize: 12,
    color: '#74777F',
  },
  charCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#74777F',
  },
  charCountWarning: {
    color: '#BA1A1A',
  },
  inputWrap: {
    width: '100%',
    backgroundColor: '#EFF4FF',
    borderRadius: 12,
    padding: 12,
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#DCE9FF',
  },
  commentInput: {
    fontSize: 14,
    color: '#0B1C30',
    lineHeight: 20,
    minHeight: 85,
  },
  quickTagsScroll: {
    gap: 8,
    paddingTop: 10,
    paddingBottom: 2,
  },
  quickTagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: '#E5EEFF',
    borderWidth: 1,
    borderColor: '#DCE9FF',
  },
  quickTagChipSelected: {
    backgroundColor: '#00152D',
    borderColor: '#00152D',
  },
  quickTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B1C30',
  },
  quickTagTextSelected: {
    color: '#FFFFFF',
  },
  trustCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#EFF4FF',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderColor: '#DCE9FF',
  },
  trustIcon: {
    marginTop: 2,
  },
  trustText: {
    flex: 1,
    fontSize: 12,
    color: '#43474E',
    lineHeight: 18,
  },
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(11,42,74,0.08)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    gap: 6,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  submitBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FDBF35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FDBF35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#D3E4FE',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6E4F00',
  },
  bottomHelperText: {
    fontSize: 11,
    color: '#74777F',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 21, 45, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    alignItems: 'center',
    gap: 12,
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
    marginBottom: 6,
  },
  celebrationCircle: {
    position: 'relative',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFDEA5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  celebrationImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  celebrationBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FDBF35',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  successSubmittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    backgroundColor: '#DCFCE7',
  },
  successSubmittedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00A472',
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00152D',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#43474E',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  summarySnippetCard: {
    width: '100%',
    backgroundColor: '#EFF4FF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#DCE9FF',
  },
  snippetLabel: {
    fontSize: 11,
    color: '#74777F',
  },
  snippetValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00152D',
    marginTop: 2,
  },
  snippetStarsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  modalFinishBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#00152D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    shadowColor: '#00152D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  modalFinishText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
