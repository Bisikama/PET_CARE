import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Check,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  User,
  Sparkles,
  Copy,
  CheckCircle2,
  ChevronRight,
  Share2,
  HeartHandshake,
  Info,
  ArrowRight,
  Home,
  FileText,
  AlertCircle,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { formatCurrency } from '@/core/utils/currency';

export default function BookingCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookingCode?: string;
    serviceTitle?: string;
    providerName?: string;
    petName?: string;
    totalPrice?: string;
    dateSlotText?: string;
    paymentMethod?: string;
  }>();

  const bookingCode = params.bookingCode || 'BK-2026-9812';
  const serviceTitle = params.serviceTitle || 'Premium Dog Grooming & Spa';
  const providerName = params.providerName || 'Happy Paws Care Studio';
  const petName = params.petName || 'Milo';
  const dateSlotText = params.dateSlotText || 'Thứ Bảy, 20 Th9 2026 · 10:30 AM';
  const totalPrice = Number(params.totalPrice) || 465000;
  const paymentMethod = params.paymentMethod || 'WALLET';

  const [copied, setCopied] = useState(false);

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'WALLET':
        return 'Ví PetCare Wallet';
      case 'VNPAY':
        return 'Cổng VNPAY / Ngân hàng';
      case 'MOMO':
        return 'Ví MoMo';
      default:
        return 'Cổng thanh toán điện tử';
    }
  };

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareBooking = async () => {
    try {
      await Share.share({
        message: `Mã lịch hẹn PetCare của tôi: #${bookingCode} - Dịch vụ: ${serviceTitle} cho bé ${petName} vào ngày ${dateSlotText}.`,
      });
    } catch (e) {
      // ignore
    }
  };

  const handleViewBookings = () => {
    router.replace('/(customer)/(tabs)/bookings');
  };

  const handleGoHome = () => {
    router.replace('/(customer)/(tabs)/home');
  };

  return (
    <Screen
      withPadding={false}
      backgroundColor={theme.colors.background.default}
      edges={['top', 'left', 'right']}
      style={styles.screen}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.default} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Top Success Hero Animation & Banner */}
        <View style={styles.heroSection}>
          <View style={styles.successBadgeContainer}>
            <View style={styles.outerGlow}>
              <View style={styles.innerCircle}>
                <Check size={36} color="white" strokeWidth={3.5} />
              </View>
            </View>
            <View style={styles.sparkleFloating}>
              <Sparkles size={20} color="#F59E0B" />
            </View>
          </View>

          <Text style={styles.congratsTitle}>Đặt Lịch Thành Công! 🎉</Text>
          <Text style={styles.congratsSubtext}>
            Lịch hẹn của bạn đã được xác nhận. Khoản thanh toán đang được giữ an toàn qua hệ thống Escrow.
          </Text>
        </View>

        {/* 2. Digital Booking Pass / Receipt Card */}
        <View style={styles.ticketWrap}>
          <View style={styles.ticketCard}>
            {/* Ticket Header */}
            <View style={styles.ticketHeader}>
              <View style={styles.ticketCodeBlock}>
                <Text style={styles.ticketCodeLabel}>MÃ ĐẶT CHỖ</Text>
                <TouchableOpacity
                  style={styles.ticketCodeRow}
                  onPress={handleCopyCode}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ticketCodeText}>#{bookingCode}</Text>
                  <View style={styles.copyButton}>
                    {copied ? (
                      <Check size={13} color="#059669" />
                    ) : (
                      <Copy size={13} color={theme.colors.text.secondary} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.escrowPill}>
                <ShieldCheck size={13} color="#059669" />
                <Text style={styles.escrowPillText}>Đã Bảo Lãnh</Text>
              </View>
            </View>

            {/* Jagged Divider / Perforation Line */}
            <View style={styles.perforationRow}>
              <View style={styles.perforationLeftNotch} />
              <View style={styles.perforationDashedLine} />
              <View style={styles.perforationRightNotch} />
            </View>

            {/* Ticket Main Details */}
            <View style={styles.ticketBody}>
              {/* Service & Pet */}
              <View style={styles.infoRow}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>DỊCH VỤ</Text>
                  <Text style={styles.infoValuePrimary} numberOfLines={2}>
                    {serviceTitle}
                  </Text>
                </View>
                <View style={[styles.infoCol, { alignItems: 'flex-end' }]}>
                  <Text style={styles.infoLabel}>THÚ CƯNG</Text>
                  <View style={styles.petPill}>
                    <Text style={styles.petPillText}>🐾 {petName}</Text>
                  </View>
                </View>
              </View>

              {/* Provider & Time */}
              <View style={styles.infoRow}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>CHUYÊN VIÊN / SALON</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {providerName}
                  </Text>
                </View>
                <View style={[styles.infoCol, { alignItems: 'flex-end' }]}>
                  <Text style={styles.infoLabel}>HÌNH THỨC</Text>
                  <Text style={styles.infoValue}>Tại Studio</Text>
                </View>
              </View>

              {/* Appointment Date */}
              <View style={styles.timeBadgeContainer}>
                <Calendar size={16} color={theme.colors.primary.navy} />
                <Text style={styles.timeBadgeText}>{dateSlotText}</Text>
              </View>

              {/* Total & Payment Method */}
              <View style={styles.paymentSummaryBox}>
                <View style={styles.paymentMethodCol}>
                  <Text style={styles.paymentMethodLabel}>PHƯƠNG THỨC</Text>
                  <Text style={styles.paymentMethodValue}>
                    {getPaymentMethodLabel(paymentMethod)}
                  </Text>
                </View>
                <View style={styles.paymentPriceCol}>
                  <Text style={styles.paymentPriceLabel}>TỔNG ĐÃ TRẢ</Text>
                  <Text style={styles.paymentPriceValue}>
                    {formatCurrency(totalPrice)} đ
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 3. Escrow Guarantee Banner */}
        <View style={styles.sectionWrap}>
          <View style={styles.escrowCard}>
            <View style={styles.escrowIconCircle}>
              <HeartHandshake size={20} color="#059669" />
            </View>
            <View style={styles.escrowTextCol}>
              <Text style={styles.escrowTitle}>Cam kết bảo vệ quyền lợi 100%</Text>
              <Text style={styles.escrowDescription}>
                Chuyên viên chỉ nhận tiền sau khi bạn kiểm tra và xác nhận hoàn tất dịch vụ với sự hài lòng.
              </Text>
            </View>
          </View>
        </View>

        {/* 4. What Happens Next Roadmap */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeading}>CÁC BƯỚC TIẾP THEO</Text>
          <View style={styles.roadmapCard}>
            <View style={styles.roadmapItem}>
              <View style={styles.roadmapNodeActive}>
                <CheckCircle2 size={18} color="#059669" />
              </View>
              <View style={styles.roadmapTextCol}>
                <Text style={styles.roadmapTitle}>1. Chờ Chuyên viên xác nhận</Text>
                <Text style={styles.roadmapSubtext}>
                  Hệ thống đã gửi thông báo đến {providerName}. Chuyên viên có 15 phút để phản hồi; tiền được giữ an toàn tại Escrow và tự động hoàn nếu không nhận.
                </Text>
              </View>
            </View>

            <View style={styles.roadmapConnector} />

            <View style={styles.roadmapItem}>
              <View style={styles.roadmapNodePending}>
                <Text style={styles.roadmapNodeNum}>2</Text>
              </View>
              <View style={styles.roadmapTextCol}>
                <Text style={styles.roadmapTitle}>2. Đưa bé đến hẹn hoặc đón tiếp</Text>
                <Text style={styles.roadmapSubtext}>
                  Đến đúng giờ hẹn đã chọn vào {dateSlotText}.
                </Text>
              </View>
            </View>

            <View style={styles.roadmapConnector} />

            <View style={styles.roadmapItem}>
              <View style={styles.roadmapNodePending}>
                <Text style={styles.roadmapNodeNum}>3</Text>
              </View>
              <View style={styles.roadmapTextCol}>
                <Text style={styles.roadmapTitle}>3. Kiểm tra & Hoàn tất</Text>
                <Text style={styles.roadmapSubtext}>
                  Nghiệm thu dịch vụ và đánh giá 5 sao cho chuyên viên.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 5. Pre-Service Advice */}
        <View style={styles.sectionWrap}>
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Info size={16} color={theme.colors.primary.navy} />
              <Text style={styles.tipsHeading}>Lưu ý trước khi làm dịch vụ</Text>
            </View>
            <Text style={styles.tipsBody}>
              • Không cho bé ăn no trước giờ spa 1 - 2 tiếng.{'\n'}
              • Mang theo sổ tiêm chủng hoặc thông báo tình trạng dị ứng cho chuyên viên.{'\n'}
              • Giữ bé ở trạng thái thoải mái và mang theo đồ chơi quen thuộc nếu bé nhút nhát.
            </Text>
          </View>
        </View>

        {/* 6. Quick Share / Save Actions */}
        <View style={styles.shareRowWrap}>
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShareBooking}
            activeOpacity={0.7}
          >
            <Share2 size={16} color={theme.colors.text.secondary} />
            <Text style={styles.shareBtnText}>Chia sẻ thông tin đơn hẹn</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 7. Bottom Sticky Action Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={handleGoHome}
          activeOpacity={0.8}
        >
          <Home size={18} color={theme.colors.text.primary} />
          <Text style={styles.secondaryBtnText}>Trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleViewBookings}
          activeOpacity={0.85}
        >
          <FileText size={18} color="white" />
          <Text style={styles.primaryBtnText}>Xem lịch hẹn</Text>
          <ArrowRight size={16} color="white" />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 120,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[3],
    gap: 8,
  },
  successBadgeContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  outerGlow: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  innerCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  sparkleFloating: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 3,
  },
  congratsTitle: {
    ...theme.typography.h2,
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primary.navy,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  congratsSubtext: {
    ...theme.typography.bodySm,
    fontSize: 13,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: theme.spacing[3],
  },
  ticketWrap: {
    paddingHorizontal: theme.spacing[5],
    marginTop: theme.spacing[3],
  },
  ticketCard: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[4],
    backgroundColor: '#F8FAFC',
  },
  ticketCodeBlock: {
    gap: 2,
  },
  ticketCodeLabel: {
    ...theme.typography.label,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.muted,
    letterSpacing: 0.5,
  },
  ticketCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketCodeText: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  copyButton: {
    padding: 3,
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: 4,
  },
  escrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: theme.radius.full,
  },
  escrowPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  perforationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    marginVertical: -10,
    zIndex: 2,
  },
  perforationLeftNotch: {
    width: 16,
    height: 20,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: theme.colors.background.default,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border.subdued,
  },
  perforationDashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  perforationRightNotch: {
    width: 16,
    height: 20,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: theme.colors.background.default,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border.subdued,
  },
  ticketBody: {
    padding: theme.spacing[5],
    paddingTop: theme.spacing[4],
    gap: theme.spacing[3],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    ...theme.typography.label,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.muted,
    letterSpacing: 0.5,
  },
  infoValuePrimary: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  infoValue: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  petPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: theme.radius.full,
    alignSelf: 'flex-end',
  },
  petPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  timeBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.lg,
    marginTop: 2,
  },
  timeBadgeText: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  paymentSummaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    marginTop: 4,
  },
  paymentMethodCol: {
    gap: 2,
  },
  paymentMethodLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.muted,
  },
  paymentMethodValue: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  paymentPriceCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  paymentPriceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.muted,
  },
  paymentPriceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  sectionWrap: {
    paddingHorizontal: theme.spacing[5],
    marginTop: theme.spacing[4],
  },
  escrowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  escrowIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  escrowTextCol: {
    flex: 1,
    gap: 2,
  },
  escrowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  escrowDescription: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 16,
  },
  sectionHeading: {
    ...theme.typography.label,
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.text.muted,
    letterSpacing: 0.8,
    marginBottom: theme.spacing[2],
  },
  roadmapCard: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
  },
  roadmapItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  roadmapNodeActive: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadmapNodePending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface.subdued,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadmapNodeNum: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.text.muted,
  },
  roadmapTextCol: {
    flex: 1,
    gap: 2,
  },
  roadmapTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  roadmapSubtext: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    lineHeight: 16,
  },
  roadmapConnector: {
    width: 2,
    height: 18,
    backgroundColor: theme.colors.border.default,
    marginLeft: 11,
    marginVertical: 2,
  },
  tipsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    gap: 6,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipsHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  tipsBody: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  shareRowWrap: {
    alignItems: 'center',
    marginTop: theme.spacing[4],
    paddingHorizontal: theme.spacing[5],
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface.lowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subdued,
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...theme.shadows.lg,
  },
  secondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface.subdued,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryBtnText: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  primaryBtn: {
    flex: 1.5,
    height: 48,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primary.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.shadows.sm,
  },
  primaryBtnText: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
});
