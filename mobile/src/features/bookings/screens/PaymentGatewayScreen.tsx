import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  ShieldCheck,
  Wallet,
  QrCode,
  Smartphone,
  CheckCircle2,
  Circle,
  ArrowRight,
  Lock,
  Landmark,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { BookingStepHeader } from '../components/BookingStepHeader';
import { PaymentEscrowCard } from '../components/PaymentEscrowCard';
import { PaymentSecurityFooter } from '../components/PaymentSecurityFooter';
import { formatCurrency } from '@/core/utils/currency';
import { useBookingFlow } from '../context/BookingContext';
import { bookingsApi } from '@/infrastructure/api/bookings.api';
import { paymentsApi, BankTransferCheckout } from '@/infrastructure/api/payments.api';
import { PaymentVietQrModal } from '../components/PaymentVietQrModal';

type PaymentMethodKey = 'VIETQR' | 'WALLET' | 'VNPAY' | 'MOMO';
const PAYMENT_METHODS: PaymentMethodKey[] = ['VIETQR', 'WALLET', 'VNPAY', 'MOMO'];

type BookingPaymentState = 'PAID' | 'EXPIRED' | 'PENDING';

/** Hỏi backend trạng thái đơn — nguồn sự thật duy nhất về việc đã thanh toán hay chưa. */
async function fetchBookingPaymentState(bookingId: string): Promise<BookingPaymentState> {
  const latest = await bookingsApi.getBookingById(bookingId);
  const status = latest?.status as string | undefined;
  if (!status || status === 'PENDING_PAYMENT') return 'PENDING';
  if (['EXPIRED', 'CANCELLED'].includes(status)) return 'EXPIRED';
  return 'PAID';
}

export default function PaymentGatewayScreen() {
  const router = useRouter();
  const { draft, resetDraft } = useBookingFlow();
  const params = useLocalSearchParams<{
    serviceId?: string;
    serviceTitle?: string;
    providerId?: string;
    providerName?: string;
    providerWorkingSlotId?: string;
    addressId?: string;
    petId?: string;
    petName?: string;
    totalPrice?: string;
    dateSlotText?: string;
    paymentMethod?: string;
    customerNote?: string;
    promoCode?: string;
  }>();

  const serviceId = params.serviceId || draft.serviceId || '';
  const serviceTitle = params.serviceTitle || draft.serviceTitle || 'Chăm sóc thú cưng cao cấp';
  const providerName = params.providerName || draft.providerName || 'PetCare Partner';
  const providerWorkingSlotId =
    params.providerWorkingSlotId || draft.providerWorkingSlotId || '';
  const addressId = params.addressId || draft.addressId || '';
  const petId = params.petId || draft.petId || '';
  const petName = params.petName || draft.petName || 'Thú cưng';
  const dateSlotText = params.dateSlotText || draft.timeSlot || 'Hôm nay · 07:00 - 09:00';
  const totalAmount = Number(params.totalPrice) || draft.totalPrice || 250000;
  const customerNote = params.customerNote || draft.customerNote;
  const promoCode = params.promoCode || draft.promoCode;

  // Payment states
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodKey>(
    PAYMENT_METHODS.includes(params.paymentMethod as PaymentMethodKey)
      ? (params.paymentMethod as PaymentMethodKey)
      : 'VIETQR'
  );
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Chuyển khoản VietQR (MB Bank + SePay)
  const [qrCheckout, setQrCheckout] = useState<BankTransferCheckout | null>(null);
  const [qrBooking, setQrBooking] = useState<{ id: string; code: string } | null>(null);
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [isCheckingQr, setIsCheckingQr] = useState(false);
  const qrHandledRef = useRef(false);

  // Mốc giữ chỗ THẬT từ backend — chỉ có sau khi booking được tạo
  const [hold, setHold] = useState<{ bookingCode: string; expiresAt: string | null } | null>(null);

  // Fetch real wallet balance from backend
  const fetchWallet = async () => {
    try {
      setIsLoadingWallet(true);
      const w = await paymentsApi.getMyWallet();
      setWalletBalance(w.balance);
    } catch (e) {
      console.log('Không lấy được số dư ví:', e);
    } finally {
      setIsLoadingWallet(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const methods: {
    id: PaymentMethodKey;
    title: string;
    subtext: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'VIETQR',
      title: 'Chuyển khoản ngân hàng (VietQR)',
      subtext: 'Quét mã bằng app ngân hàng bất kỳ · Xác nhận tự động trong vài giây',
      icon: <Landmark size={20} color="#059669" />,
      badge: 'Khuyên dùng',
      badgeColor: '#10B981',
    },
    {
      id: 'WALLET',
      title: 'Ví PetCare Wallet',
      subtext: isLoadingWallet
        ? 'Đang tải số dư...'
        : `Số dư hoàn tiền: ${formatCurrency(walletBalance)} đ`,
      icon: <Wallet size={20} color={theme.colors.secondary.onContainer} />,
    },
    {
      id: 'VNPAY',
      title: 'Cổng VNPAY (Ngân hàng / VNPAY-QR)',
      subtext: 'Thẻ ATM nội địa NCB, quét QR ngân hàng, Visa/Mastercard',
      icon: <QrCode size={20} color="#2563EB" />,
      badge: 'Phổ biến',
      badgeColor: '#2563EB',
    },
    {
      id: 'MOMO',
      title: 'Ví MoMo',
      subtext: 'Mở ứng dụng hoặc mã MoMo để thanh toán bảo mật',
      icon: <Smartphone size={20} color="#D946EF" />,
    },
  ];

  const completeAndNavigate = (createdBookingCode: string, method: PaymentMethodKey) => {
    resetDraft();
    router.replace({
      pathname: '/(customer)/bookings/complete',
      params: {
        bookingCode: createdBookingCode,
        serviceTitle,
        providerName,
        petName,
        totalPrice: String(totalAmount),
        dateSlotText,
        paymentMethod: method,
      },
    });
  };

  /**
   * Đồng hồ giữ chỗ về 0. Modal QR đang mở thì để vòng hỏi trạng thái tự xử lý (tránh 2 thông báo);
   * ngược lại báo khách và xoá đơn cũ để lần bấm sau tạo đơn mới.
   */
  const handleHoldExpired = () => {
    if (isQrModalVisible) return;
    setHold(null);
    setQrCheckout(null);
    setQrBooking(null);
    Alert.alert(
      'Hết hạn giữ chỗ',
      'Khung giờ không còn được giữ cho bạn. Nếu bạn đã chuyển tiền, số tiền sẽ được hoàn vào Ví PetCare. Vui lòng bấm thanh toán để đặt lại.'
    );
  };

  const showExpiredAlert = () =>
    Alert.alert(
      'Đơn đã hết hạn',
      'Đơn đặt lịch đã hết thời gian giữ chỗ. Nếu bạn đã chuyển tiền, số tiền sẽ được hoàn vào Ví PetCare.'
    );

  /** Xử lý kết quả của đơn VietQR (một lần duy nhất). Trả về true nếu đơn đã có kết quả cuối. */
  const settleQrBooking = (state: BookingPaymentState): boolean => {
    if (state === 'PENDING' || !qrBooking || qrHandledRef.current) return false;
    qrHandledRef.current = true;
    setIsQrModalVisible(false);
    if (state === 'EXPIRED') {
      setQrCheckout(null);
      setQrBooking(null);
      showExpiredAlert();
    } else {
      completeAndNavigate(qrBooking.code, 'VIETQR');
    }
    return true;
  };

  // Khi đang hiện mã QR: tự hỏi backend mỗi 4 giây xem SePay đã báo có chưa
  useEffect(() => {
    if (!isQrModalVisible || !qrBooking) return;
    const timer = setInterval(async () => {
      try {
        settleQrBooking(await fetchBookingPaymentState(qrBooking.id));
      } catch (e) {
        console.log('Không kiểm tra được trạng thái đơn:', e);
      }
    }, 4000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQrModalVisible, qrBooking]);

  /** Khách bấm "Tôi đã chuyển khoản": kiểm tra ngay vài lần, KHÔNG tự xác nhận. */
  const handleQrConfirmPaid = async () => {
    if (!qrBooking) return;
    setIsCheckingQr(true);
    try {
      for (let attempt = 0; attempt < 5; attempt++) {
        if (settleQrBooking(await fetchBookingPaymentState(qrBooking.id))) return;
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      Alert.alert(
        'Chưa nhận được tiền',
        'Ngân hàng chưa báo về giao dịch. Thường mất vài giây đến 1-2 phút. Vui lòng giữ màn hình này, đơn sẽ tự cập nhật khi nhận được tiền.'
      );
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message || 'Không kiểm tra được trạng thái đơn.');
    } finally {
      setIsCheckingQr(false);
    }
  };

  /**
   * Sau khi khách đóng trình duyệt cổng thanh toán, hỏi backend trạng thái đơn.
   * Chỉ backend (qua IPN/Return đã xác thực chữ ký) mới quyết định đơn đã được thanh toán hay chưa.
   */
  const confirmGatewayPayment = async (
    bookingId: string,
    createdBookingCode: string,
    method: PaymentMethodKey
  ) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const state = await fetchBookingPaymentState(bookingId);
        if (state === 'EXPIRED') {
          showExpiredAlert();
          return;
        }
        if (state === 'PAID') {
          completeAndNavigate(createdBookingCode, method);
          return;
        }
      } catch (e) {
        console.log('Không kiểm tra được trạng thái đơn:', e);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    Alert.alert(
      'Chưa nhận được xác nhận thanh toán',
      'Nếu bạn đã thanh toán, đơn sẽ tự cập nhật trong ít phút. Bạn có thể bấm thanh toán lại nếu chưa trả tiền.',
      [
        { text: 'Ở lại trang này', style: 'cancel' },
        {
          text: 'Xem đơn của tôi',
          onPress: () => {
            resetDraft();
            router.replace('/(customer)/(tabs)/bookings');
          },
        },
      ]
    );
  };

  const handlePay = async () => {
    const missing: string[] = [];
    if (!petId) missing.push('thú cưng');
    if (!serviceId) missing.push('dịch vụ');
    if (!addressId) missing.push('địa chỉ nhận dịch vụ');
    if (!providerWorkingSlotId) missing.push('ca làm việc chuyên viên');

    if (missing.length > 0) {
      Alert.alert(
        'Thiếu thông tin đặt lịch',
        `Đơn hẹn chưa đủ thông tin: ${missing.join(', ')}. Vui lòng hoàn tất trước khi thanh toán.`
      );
      return;
    }

    // Đã tạo đơn + mã QR trước đó trong phiên này => mở lại, không tạo đơn mới
    if (selectedMethod === 'VIETQR' && qrCheckout && qrBooking) {
      setIsQrModalVisible(true);
      return;
    }

    // 1. Kiểm tra số dư nếu chọn ví
    if (selectedMethod === 'WALLET' && walletBalance < totalAmount) {
      Alert.alert(
        'Số dư ví không đủ',
        `Số dư ví hiện tại là ${formatCurrency(walletBalance)} đ, không đủ thanh toán ${formatCurrency(
          totalAmount
        )} đ. Vui lòng chọn VNPAY hoặc MoMo để thanh toán.`
      );
      return;
    }

    setIsProcessing(true);

    try {
      // 2. Tạo đơn Booking trong database
      const bookingRes: any = await bookingsApi.createBooking({
        petId,
        serviceId,
        addressId,
        providerWorkingSlotId,
        customerNote,
        promoCode,
      });

      const booking = bookingRes?.booking || bookingRes?.data?.booking || bookingRes;
      const bookingId = booking?.id;
      const bookingCode = booking?.booking_code || `BK-${Date.now().toString().slice(-6)}`;

      if (!bookingId) {
        throw new Error('Không tạo được mã đơn đặt lịch.');
      }

      const holdExpiresAt: string | null =
        bookingRes?.holdExpiresAt || bookingRes?.data?.holdExpiresAt || null;
      setHold({ bookingCode, expiresAt: holdExpiresAt });

      // 3. Xử lý thanh toán theo từng phương thức
      if (selectedMethod === 'VIETQR') {
        const checkout = await paymentsApi.checkoutBankTransfer({
          bookingId,
          promotionCode: promoCode,
        });
        qrHandledRef.current = false;
        // Chuyển khoản được gia hạn giữ chỗ => dùng mốc mới
        setHold({ bookingCode, expiresAt: checkout.expiresAt || holdExpiresAt });
        setQrCheckout(checkout);
        setQrBooking({ id: bookingId, code: bookingCode });
        setIsQrModalVisible(true);
        return;
      }

      if (selectedMethod === 'WALLET') {
        // Gọi API checkout bằng ví
        await paymentsApi.checkoutWithWallet({
          bookingId,
          promotionCode: promoCode,
        });

        setWalletBalance((prev) => Math.max(0, prev - totalAmount));
        completeAndNavigate(bookingCode, 'WALLET');
        return;
      }

      if (selectedMethod === 'VNPAY') {
        // Lấy paymentUrl từ response createBooking hoặc gọi checkout VNPay
        let paymentUrl = bookingRes?.paymentUrl || bookingRes?.data?.paymentUrl;
        if (!paymentUrl) {
          const vnpayRes = await paymentsApi.checkoutVNPay({
            bookingId,
            promotionCode: promoCode,
          });
          paymentUrl = vnpayRes?.paymentUrl;
        }

        if (!paymentUrl) {
          throw new Error('Không tạo được liên kết thanh toán VNPAY.');
        }
        // Mở In-App Browser cổng VNPAY, sau khi đóng thì kiểm tra trạng thái thật từ backend
        await WebBrowser.openBrowserAsync(paymentUrl);
        await confirmGatewayPayment(bookingId, bookingCode, 'VNPAY');
        return;
      }

      if (selectedMethod === 'MOMO') {
        const momoRes = await paymentsApi.checkoutMoMo({
          bookingId,
          promotionCode: promoCode,
        });
        const paymentUrl = momoRes?.paymentUrl;
        if (!paymentUrl) {
          throw new Error('Không tạo được liên kết thanh toán MoMo.');
        }
        await WebBrowser.openBrowserAsync(paymentUrl);
        await confirmGatewayPayment(bookingId, bookingCode, 'MOMO');
        return;
      }
    } catch (apiError: any) {
      console.error('Lỗi khi thanh toán booking:', apiError);
      const msg =
        apiError?.response?.data?.message ||
        apiError?.message ||
        'Đã xảy ra lỗi khi tạo đơn hoặc thanh toán. Vui lòng thử lại.';

      if (typeof msg === 'string' && (msg.includes('tương lai') || msg.includes('Thời gian bắt đầu'))) {
        Alert.alert(
          'Khung giờ không hợp lệ',
          'Khung giờ bạn chọn đã qua hoặc không còn khả dụng trong tương lai. Vui lòng chọn lại ngày hoặc giờ hẹn mới.',
          [
            {
              text: 'Chọn lại giờ hẹn',
              onPress: () => {
                router.replace('/(customer)/bookings/schedule-time' as any);
              },
            },
            { text: 'Đóng', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('Thanh toán chưa hoàn tất', msg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Screen
      withPadding={false}
      backgroundColor={theme.colors.background.default}
      edges={['top', 'left', 'right']}
      style={styles.screen}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.default} />

      {/* 1. Header Navigation */}
      <BookingStepHeader
        title="Thanh toán an toàn"
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Escrow & Amount Card */}
        <View style={styles.sectionWrap}>
          <PaymentEscrowCard
            totalAmount={totalAmount}
            bookingCode={hold?.bookingCode}
            expiresAt={hold?.expiresAt}
            onExpire={handleHoldExpired}
          />
        </View>

        {/* 3. Payment Methods Selector */}
        <View style={styles.sectionWrap}>
          <View style={styles.methodsHeader}>
            <Text style={styles.sectionTitle}>CHỌN CỔNG THANH TOÁN</Text>
            <View style={styles.sslBadge}>
              <Lock size={12} color="#059669" />
              <Text style={styles.sslBadgeText}>Bảo mật SSL 256-bit</Text>
            </View>
          </View>

          <View style={styles.methodsList}>
            {methods.map((method) => {
              const isSelected = selectedMethod === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodCard,
                    isSelected && styles.methodCardSelected,
                  ]}
                  onPress={() => setSelectedMethod(method.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.methodIconWrap}>{method.icon}</View>

                  <View style={styles.methodTextCol}>
                    <View style={styles.methodTitleRow}>
                      <Text
                        style={[
                          styles.methodTitle,
                          isSelected && styles.methodTitleSelected,
                        ]}
                      >
                        {method.title}
                      </Text>
                      {method.badge && (
                        <View
                          style={[
                            styles.badgePill,
                            {
                              backgroundColor:
                                method.badgeColor === '#10B981'
                                  ? '#DCFCE7'
                                  : '#DBEAFE',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgePillText,
                              {
                                color:
                                  method.badgeColor === '#10B981'
                                    ? '#15803D'
                                    : '#1D4ED8',
                              },
                            ]}
                          >
                            {method.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.methodSubtext} numberOfLines={2}>
                      {method.subtext}
                    </Text>
                  </View>

                  {isSelected ? (
                    <CheckCircle2
                      size={20}
                      color={theme.colors.secondary.onContainer}
                      fill={theme.colors.secondary.container}
                    />
                  ) : (
                    <Circle size={20} color={theme.colors.border.default} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 4. Security Trust Badges */}
        <View style={styles.sectionWrap}>
          <PaymentSecurityFooter />
        </View>
      </ScrollView>

      {/* 5. Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomCol}>
          <Text style={styles.bottomLabel}>TỔNG THANH TOÁN</Text>
          <Text style={styles.bottomAmount}>{formatCurrency(totalAmount)} đ</Text>
        </View>

        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePay}
          disabled={isProcessing}
          activeOpacity={0.85}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.payButtonText}>
                {selectedMethod === 'VIETQR'
                  ? qrCheckout
                    ? 'Xem lại mã QR'
                    : 'Lấy mã chuyển khoản'
                  : selectedMethod === 'WALLET'
                  ? 'Thanh toán bằng ví'
                  : selectedMethod === 'VNPAY'
                  ? 'Mở cổng VNPAY'
                  : 'Thanh toán qua MoMo'}
              </Text>
              <ArrowRight size={16} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* 6. Modal chuyển khoản VietQR (MB Bank, xác nhận tự động qua SePay) */}
      <PaymentVietQrModal
        visible={isQrModalVisible}
        checkout={qrCheckout}
        isChecking={isCheckingQr}
        onClose={() => setIsQrModalVisible(false)}
        onConfirmPaid={handleQrConfirmPaid}
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
  sectionWrap: {
    paddingHorizontal: theme.spacing[5],
    marginTop: theme.spacing[4],
  },
  methodsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[2],
  },
  sectionTitle: {
    ...theme.typography.label,
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.text.muted,
    letterSpacing: 0.8,
  },
  sslBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  sslBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  methodsList: {
    gap: 10,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    borderWidth: 1.5,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
  },
  methodCardSelected: {
    borderColor: theme.colors.secondary.onContainer,
    backgroundColor: theme.colors.surface.lowest,
    ...theme.shadows.md,
  },
  methodIconWrap: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.subdued,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTextCol: {
    flex: 1,
    gap: 3,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  methodTitle: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  methodTitleSelected: {
    color: theme.colors.primary.navy,
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: theme.radius.full,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  methodSubtext: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
    lineHeight: 15,
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
    justifyContent: 'space-between',
    ...theme.shadows.lg,
  },
  bottomCol: {
    gap: 2,
  },
  bottomLabel: {
    ...theme.typography.label,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.muted,
    letterSpacing: 0.5,
  },
  bottomAmount: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  payButton: {
    backgroundColor: theme.colors.primary.navy,
    borderRadius: theme.radius.xl,
    paddingHorizontal: 22,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.shadows.sm,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
});
