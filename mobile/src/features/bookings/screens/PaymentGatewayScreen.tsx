import React, { useState, useEffect } from 'react';
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
  PlusCircle,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { BookingStepHeader } from '../components/BookingStepHeader';
import { PaymentEscrowCard } from '../components/PaymentEscrowCard';
import { PaymentSecurityFooter } from '../components/PaymentSecurityFooter';
import { formatCurrency } from '@/core/utils/currency';
import { useBookingFlow } from '../context/BookingContext';
import { bookingsApi } from '@/infrastructure/api/bookings.api';
import { paymentsApi } from '@/infrastructure/api/payments.api';

type PaymentMethodKey = 'WALLET' | 'VNPAY' | 'MOMO';

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
    (params.paymentMethod as PaymentMethodKey) || 'WALLET'
  );
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isToppingUp, setIsToppingUp] = useState(false);

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

  const handleTopup = async () => {
    try {
      setIsToppingUp(true);
      await paymentsApi.topupWallet(1000000);
      await fetchWallet();
      Alert.alert('Thành công', 'Đã nạp 1.000.000 đ vào ví PetCare để thử nghiệm thanh toán!');
    } catch (e: any) {
      Alert.alert('Lỗi nạp tiền', e?.message || 'Không thể nạp tiền ví.');
    } finally {
      setIsToppingUp(false);
    }
  };

  const methods: {
    id: PaymentMethodKey;
    title: string;
    subtext: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'WALLET',
      title: 'Ví PetCare Wallet',
      subtext: isLoadingWallet
        ? 'Đang tải số dư...'
        : `Khả dụng: ${formatCurrency(walletBalance)} đ · Trừ tiền tự động 1-chạm`,
      icon: <Wallet size={20} color={theme.colors.secondary.onContainer} />,
      badge: 'Khuyên dùng',
      badgeColor: '#10B981',
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

  const handlePay = async () => {
    if (!petId || !serviceId || !addressId || !providerWorkingSlotId) {
      Alert.alert('Thiếu thông tin', 'Vui lòng hoàn tất các bước chọn thú cưng, địa chỉ và lịch trước khi thanh toán.');
      return;
    }

    // 1. Kiểm tra số dư nếu chọn ví
    if (selectedMethod === 'WALLET' && walletBalance < totalAmount) {
      Alert.alert(
        'Số dư ví không đủ',
        `Số dư ví hiện tại là ${formatCurrency(walletBalance)} đ, không đủ thanh toán ${formatCurrency(
          totalAmount
        )} đ. Bạn có muốn nạp nhanh 1.000.000 đ vào ví để tiếp tục không?`,
        [
          { text: 'Đổi phương thức khác', style: 'cancel' },
          {
            text: 'Nạp nhanh 1.000.000đ',
            onPress: async () => {
              await handleTopup();
            },
          },
        ]
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

      // 3. Xử lý thanh toán theo từng phương thức
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

        if (paymentUrl) {
          // Mở In-App Browser cổng VNPAY
          await WebBrowser.openBrowserAsync(paymentUrl);
        }
        completeAndNavigate(bookingCode, 'VNPAY');
        return;
      }

      if (selectedMethod === 'MOMO') {
        const momoRes = await paymentsApi.checkoutMoMo({
          bookingId,
          promotionCode: promoCode,
        });
        const paymentUrl = momoRes?.paymentUrl;
        if (paymentUrl) {
          await WebBrowser.openBrowserAsync(paymentUrl);
        }
        completeAndNavigate(bookingCode, 'MOMO');
        return;
      }
    } catch (apiError: any) {
      console.error('Lỗi khi thanh toán booking:', apiError);
      const msg =
        apiError?.response?.data?.message ||
        apiError?.message ||
        'Đã xảy ra lỗi khi tạo đơn hoặc thanh toán. Vui lòng thử lại.';
      Alert.alert('Thanh toán chưa hoàn tất', msg);
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
            bookingCode="BK-HOLD"
            initialMinutes={15}
            onExpire={() =>
              Alert.alert(
                'Hết hạn giữ chỗ',
                'Thời gian thanh toán cho lịch hẹn đã hết hạn. Vui lòng đặt lại.'
              )
            }
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

          {/* Quick Top-up Button for Testing Wallet */}
          <TouchableOpacity
            style={styles.topupCard}
            onPress={handleTopup}
            disabled={isToppingUp}
            activeOpacity={0.7}
          >
            <View style={styles.topupLeft}>
              <PlusCircle size={18} color="#059669" />
              <Text style={styles.topupText}>Nạp thêm 1.000.000 đ vào ví PetCare (Thử nghiệm)</Text>
            </View>
            {isToppingUp && <ActivityIndicator size="small" color="#059669" />}
          </TouchableOpacity>
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
                {selectedMethod === 'WALLET'
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
  topupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    marginTop: 12,
  },
  topupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topupText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
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
