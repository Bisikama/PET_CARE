import React, { useState } from 'react';
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
import {
  ShieldCheck,
  Wallet,
  CreditCard,
  QrCode,
  Smartphone,
  Banknote,
  CheckCircle2,
  Circle,
  ArrowRight,
  Lock,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { BookingStepHeader } from '../components/BookingStepHeader';
import { PaymentEscrowCard } from '../components/PaymentEscrowCard';
import { PaymentCreditCardForm } from '../components/PaymentCreditCardForm';
import { PaymentVietQrModal } from '../components/PaymentVietQrModal';
import { PaymentSecurityFooter } from '../components/PaymentSecurityFooter';
import { formatCurrency } from '@/core/utils/currency';
import { useBookingFlow } from '../context/BookingContext';
import { bookingsApi } from '@/infrastructure/api/bookings.api';

type PaymentMethodKey = 'WALLET' | 'VIETQR' | 'MOMO' | 'CARD' | 'CASH';

export default function PaymentGatewayScreen() {
  const router = useRouter();
  const { draft, resetDraft, updateDraft } = useBookingFlow();
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
    (params.paymentMethod as PaymentMethodKey) || draft.paymentMethod || 'WALLET'
  );
  const [walletBalance, setWalletBalance] = useState(1250000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVietQrModalVisible, setIsVietQrModalVisible] = useState(false);

  // Card form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('NGUYEN VAN A');
  const [expiryDate, setExpiryDate] = useState('12/28');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

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
      subtext: `Khả dụng: ${formatCurrency(walletBalance)} đ (Trừ tiền tự động)`,
      icon: <Wallet size={20} color={theme.colors.secondary.onContainer} />,
      badge: 'Khuyên dùng',
      badgeColor: '#10B981',
    },
    {
      id: 'VIETQR',
      title: 'VietQR / App Ngân Hàng',
      subtext: 'Quét mã QR chuyển khoản tự động xác nhận tức thì',
      icon: <QrCode size={20} color="#2563EB" />,
      badge: 'Phổ biến',
      badgeColor: '#2563EB',
    },
    {
      id: 'MOMO',
      title: 'Ví MoMo',
      subtext: 'Thanh toán bảo mật một chạm qua ứng dụng MoMo',
      icon: <Smartphone size={20} color="#D946EF" />,
    },
    {
      id: 'CARD',
      title: 'Thẻ Quốc tế (Visa / MasterCard)',
      subtext: 'Thanh toán trực tiếp bằng thẻ ghi nợ/tín dụng quốc tế',
      icon: <CreditCard size={20} color="#F59E0B" />,
    },
    {
      id: 'CASH',
      title: 'Tiền mặt khi hoàn thành',
      subtext: 'Thanh toán trực tiếp cho chuyên viên tại salon/nhà',
      icon: <Banknote size={20} color="#16A34A" />,
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
    if (selectedMethod === 'WALLET' && walletBalance < totalAmount) {
      Alert.alert(
        'Số dư ví không đủ',
        `Số dư hiện tại (${formatCurrency(
          walletBalance
        )}đ) không đủ để thanh toán ${formatCurrency(
          totalAmount
        )}đ. Vui lòng nạp thêm hoặc chọn phương thức khác.`
      );
      return;
    }

    if (selectedMethod === 'CARD') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ 16 số thẻ.');
        return;
      }
      if (!cvv || cvv.length < 3) {
        Alert.alert('Thông báo', 'Vui lòng nhập mã bảo mật CVV.');
        return;
      }
    }

    if (selectedMethod === 'VIETQR') {
      setIsVietQrModalVisible(true);
      return;
    }

    setIsProcessing(true);

    try {
      // If we have actual database IDs, attempt real API booking creation
      if (petId && serviceId && addressId && providerWorkingSlotId) {
        try {
          const res = await bookingsApi.createBooking({
            petId,
            serviceId,
            addressId,
            providerWorkingSlotId,
            customerNote,
            promoCode,
          });

          const bookingCode = res?.booking?.booking_code || `BK-${Date.now().toString().slice(-6)}`;
          if (selectedMethod === 'WALLET') {
            setWalletBalance((prev) => prev - totalAmount);
          }
          completeAndNavigate(bookingCode, selectedMethod);
          return;
        } catch (apiError: any) {
          // If conflict or specific error
          const msg = apiError?.response?.data?.message || apiError?.message;
          if (msg && typeof msg === 'string' && !msg.includes('Network Error')) {
            // If real business error (e.g. slot conflict), notify user
            Alert.alert('Đặt lịch chưa hoàn tất', msg);
            setIsProcessing(false);
            return;
          }
        }
      }

      // Fallback graceful confirmation
      setTimeout(() => {
        setIsProcessing(false);
        if (selectedMethod === 'WALLET') {
          setWalletBalance((prev) => prev - totalAmount);
        }
        const generatedCode = `BK-${Date.now().toString().slice(-6)}`;
        completeAndNavigate(generatedCode, selectedMethod);
      }, 1000);
    } catch (error) {
      setIsProcessing(false);
      const generatedCode = `BK-${Date.now().toString().slice(-6)}`;
      completeAndNavigate(generatedCode, selectedMethod);
    }
  };

  const handleQrPaymentConfirmed = async () => {
    setIsVietQrModalVisible(false);
    setIsProcessing(true);

    try {
      if (petId && serviceId && addressId && providerWorkingSlotId) {
        try {
          const res = await bookingsApi.createBooking({
            petId,
            serviceId,
            addressId,
            providerWorkingSlotId,
            customerNote,
            promoCode,
          });
          const code = res?.booking?.booking_code || `BK-${Date.now().toString().slice(-6)}`;
          completeAndNavigate(code, 'VIETQR');
          return;
        } catch (e) {
          // fallback
        }
      }
      setTimeout(() => {
        setIsProcessing(false);
        const code = `BK-${Date.now().toString().slice(-6)}`;
        completeAndNavigate(code, 'VIETQR');
      }, 800);
    } catch (e) {
      setIsProcessing(false);
      const code = `BK-${Date.now().toString().slice(-6)}`;
      completeAndNavigate(code, 'VIETQR');
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
        </View>

        {/* 4. Sub-form for Credit Card (when CARD selected) */}
        {selectedMethod === 'CARD' && (
          <View style={styles.sectionWrap}>
            <View style={styles.cardFormContainer}>
              <PaymentCreditCardForm
                cardNumber={cardNumber}
                onChangeCardNumber={setCardNumber}
                cardHolder={cardHolder}
                onChangeCardHolder={setCardHolder}
                expiryDate={expiryDate}
                onChangeExpiryDate={setExpiryDate}
                cvv={cvv}
                onChangeCvv={setCvv}
                saveCard={saveCard}
                onToggleSaveCard={setSaveCard}
              />
            </View>
          </View>
        )}

        {/* 5. Security Trust Badges */}
        <View style={styles.sectionWrap}>
          <PaymentSecurityFooter />
        </View>
      </ScrollView>

      {/* 6. Bottom Sticky Action Bar */}
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
                  ? 'Hiện mã VietQR'
                  : selectedMethod === 'CASH'
                  ? 'Hoàn tất đặt lịch'
                  : 'Xác nhận & Thanh toán'}
              </Text>
              <ArrowRight size={16} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* 7. VietQR Modal */}
      <PaymentVietQrModal
        visible={isVietQrModalVisible}
        amount={totalAmount}
        bookingCode="BK-QR"
        onClose={() => setIsVietQrModalVisible(false)}
        onConfirmPaid={handleQrPaymentConfirmed}
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
  cardFormContainer: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
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
