import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Check,
  ArrowRight,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { BookingStepHeader } from '../components/BookingStepHeader';
import { ReviewServiceRecapCard } from '../components/ReviewServiceRecapCard';
import { ReviewVoucherSection } from '../components/ReviewVoucherSection';
import { ReviewPriceBreakdownCard } from '../components/ReviewPriceBreakdownCard';
import { ReviewPaymentMethodSelector } from '../components/ReviewPaymentMethodSelector';
import { ReviewNotesInput } from '../components/ReviewNotesInput';
import { ReviewTrustPolicyCard } from '../components/ReviewTrustPolicyCard';
import {
  VoucherItem,
  PaymentMethodType,
} from '../types/booking.types';
import { formatCurrency } from '@/core/utils/currency';
import { useBookingFlow } from '../context/BookingContext';
import { bookingsApi } from '@/infrastructure/api/bookings.api';

const mockVouchers: VoucherItem[] = [
  {
    code: 'PETLOVE20',
    title: 'Giảm 20.000đ cho đơn đầu tiên',
    description: 'Áp dụng cho mọi dịch vụ từ 200.000đ',
    discountType: 'FIXED',
    discountValue: 20000,
    minOrderValue: 200000,
    expiryDate: '30/09/2026',
  },
  {
    code: 'VIPCARE15',
    title: 'Giảm 15% gói chăm sóc toàn diện',
    description: 'Giảm tối đa 100.000đ cho đơn từ 300.000đ',
    discountType: 'PERCENT',
    discountValue: 15,
    maxDiscount: 100000,
    minOrderValue: 300000,
    expiryDate: '15/10/2026',
  },
  {
    code: 'FREESHIP30',
    title: 'Giảm 30.000đ phí an toàn & bảo hiểm',
    description: 'Áp dụng cho đơn từ 150.000đ',
    discountType: 'FIXED',
    discountValue: 30000,
    minOrderValue: 150000,
    expiryDate: '31/12/2026',
  },
];

export default function ReviewSummaryScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useBookingFlow();
  const params = useLocalSearchParams<Record<string, string>>();

  // Extract from params or draft
  const serviceId = params.serviceId || draft.serviceId || '';
  const serviceTitle = params.serviceTitle || draft.serviceTitle || 'Chăm sóc thú cưng cao cấp';
  const providerId = params.providerId || draft.providerId || '';
  const providerName = params.providerName || draft.providerName || 'PetCare Partner';
  const providerAvatar =
    params.providerAvatar ||
    draft.providerAvatar ||
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80';
  const providerRating = Number(params.providerRating) || draft.providerRating || 4.9;
  const providerWorkingSlotId =
    params.providerWorkingSlotId || draft.providerWorkingSlotId || '';

  const petId = params.petId || draft.petId || '';
  const petName = params.petName || draft.petName || 'Thú cưng';
  const petBreed = params.petBreed || draft.petBreed || 'Chó cưng';
  const petAvatarUrl =
    params.petAvatarUrl ||
    draft.petAvatarUrl ||
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80';
  const petWeight = params.petWeight || (draft.petWeight ? `${draft.petWeight} kg` : '5 kg');
  const addressId = params.addressId || draft.addressId || '';

  const day = params.day || '20';
  const slotTime = params.slotTime || draft.timeSlot || '09:00 - 10:30';
  const dateSlotText = `Ngày ${day} · ${slotTime}`;

  // Price base calculations
  const rawBasePrice = Number(params.basePrice) || draft.servicePrice || draft.basePrice || 250000;
  const sizeSurcharge = params.selectedSizeId === 'size-lg' ? 60000 : 0;
  const addonsPrice = 0;
  const platformFee = 15000; // Care & Insurance fee

  // State
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherItem | null>(null);
  const [notes, setNotes] = useState(draft.customerNote || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    draft.paymentMethod || 'WALLET'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Dynamic calculated pricing
  const [serverPrice, setServerPrice] = useState<{
    servicePrice: number;
    travelFee: number;
    distanceKm: number;
    discountAmount: number;
    finalPrice: number;
  } | null>(null);

  // Call calculate price endpoint if valid IDs exist
  useEffect(() => {
    const fetchServerQuote = async () => {
      if (petId && serviceId && addressId && providerId) {
        try {
          setIsCalculating(true);
          const quote = await bookingsApi.calculatePrice({
            petId,
            serviceId,
            addressId,
            providerId,
            promoCode: appliedVoucher?.code,
          });
          setServerPrice(quote);
        } catch (e) {
          // Fallback to local calculation
        } finally {
          setIsCalculating(false);
        }
      }
    };

    fetchServerQuote();
  }, [petId, serviceId, addressId, providerId, appliedVoucher]);

  // Price calculation fallback
  const subtotal = rawBasePrice + sizeSurcharge + addonsPrice + platformFee;

  const discountAmount = useMemo(() => {
    if (serverPrice) return serverPrice.discountAmount;
    if (!appliedVoucher) return 0;
    if (appliedVoucher.discountType === 'PERCENT') {
      const calc = Math.round((subtotal * appliedVoucher.discountValue) / 100);
      return appliedVoucher.maxDiscount ? Math.min(calc, appliedVoucher.maxDiscount) : calc;
    }
    return appliedVoucher.discountValue;
  }, [appliedVoucher, subtotal, serverPrice]);

  const finalTotal = useMemo(() => {
    if (serverPrice) return serverPrice.finalPrice;
    return Math.max(0, subtotal - discountAmount);
  }, [serverPrice, subtotal, discountAmount]);

  const handleApplyVoucher = (voucher: VoucherItem) => {
    setAppliedVoucher(voucher);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
  };

  const handleConfirmBooking = () => {
    // Update booking context draft
    updateDraft({
      customerNote: notes,
      promoCode: appliedVoucher?.code,
      discountAmount,
      totalPrice: finalTotal,
      servicePrice: rawBasePrice,
      travelFee: serverPrice?.travelFee || 0,
      distanceKm: serverPrice?.distanceKm || 0,
      paymentMethod,
    });

    router.push({
      pathname: '/(customer)/bookings/payment',
      params: {
        serviceId,
        serviceTitle,
        providerId,
        providerName,
        providerWorkingSlotId,
        addressId,
        petId,
        petName,
        totalPrice: String(finalTotal),
        dateSlotText,
        paymentMethod,
        customerNote: notes,
        promoCode: appliedVoucher?.code || '',
      },
    });
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
        title="Xác nhận đặt lịch"
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Top Progress Tracker (Step 4 of 4) */}
        <View style={styles.trackerSection}>
          <View style={styles.stepNodesRow}>
            {/* Step 1: Pet (Completed) */}
            <View style={styles.nodeCol}>
              <View style={styles.nodeCircleCompleted}>
                <Check size={13} color="white" strokeWidth={3} />
              </View>
              <Text style={styles.nodeLabelCompleted}>Thú cưng</Text>
            </View>

            <View style={styles.nodeLineCompleted} />

            {/* Step 2: Time (Completed) */}
            <View style={styles.nodeCol}>
              <View style={styles.nodeCircleCompleted}>
                <Check size={13} color="white" strokeWidth={3} />
              </View>
              <Text style={styles.nodeLabelCompleted}>Thời gian</Text>
            </View>

            <View style={styles.nodeLineCompleted} />

            {/* Step 3: Provider (Completed) */}
            <View style={styles.nodeCol}>
              <View style={styles.nodeCircleCompleted}>
                <Check size={13} color="white" strokeWidth={3} />
              </View>
              <Text style={styles.nodeLabelCompleted}>Chuyên viên</Text>
            </View>

            <View style={styles.nodeLineCompleted} />

            {/* Step 4: Pay & Review (Active) */}
            <View style={styles.nodeCol}>
              <View style={styles.nodeCircleActive}>
                <Text style={styles.nodeActiveNumber}>4</Text>
              </View>
              <Text style={styles.nodeLabelActive}>Xác nhận</Text>
            </View>
          </View>

          {/* Title Header */}
          <View style={styles.titleBanner}>
            <Text style={styles.screenTitle}>Kiểm tra thông tin đơn hẹn</Text>
            <Text style={styles.screenSubtitle}>
              Vui lòng rà soát lại thông tin dịch vụ, thú cưng và chi phí trước khi thanh toán.
            </Text>
          </View>
        </View>

        {/* 3. Service & Pet Recap Card */}
        <View style={styles.sectionWrap}>
          <ReviewServiceRecapCard
            serviceTitle={serviceTitle}
            providerName={providerName}
            providerAvatar={providerAvatar}
            providerRating={providerRating}
            petName={petName}
            petBreed={petBreed}
            petAvatarUrl={petAvatarUrl}
            petWeight={petWeight}
            dateSlotText={dateSlotText}
          />
        </View>

        {/* 4. Voucher & Promo Code Section */}
        <View style={styles.sectionWrap}>
          <ReviewVoucherSection
            availableVouchers={mockVouchers}
            appliedVoucher={appliedVoucher}
            discountAmount={discountAmount}
            onApplyVoucher={handleApplyVoucher}
            onRemoveVoucher={handleRemoveVoucher}
            orderSubtotal={subtotal}
          />
        </View>

        {/* 5. Itemized Price Breakdown Card */}
        <View style={styles.sectionWrap}>
          <ReviewPriceBreakdownCard
            basePrice={rawBasePrice}
            sizeSurcharge={sizeSurcharge}
            addonsPrice={addonsPrice}
            platformFee={serverPrice ? serverPrice.travelFee : platformFee}
            discountAmount={discountAmount}
            totalPrice={finalTotal}
            voucherCode={appliedVoucher?.code}
          />
        </View>

        {/* 6. Payment Method Selector */}
        <View style={styles.sectionWrap}>
          <ReviewPaymentMethodSelector
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
            walletBalance={1250000}
          />
        </View>

        {/* 7. Special Notes Input */}
        <View style={styles.sectionWrap}>
          <ReviewNotesInput
            notes={notes}
            onChangeNotes={setNotes}
          />
        </View>

        {/* 8. Trust & Guarantee Policies */}
        <View style={styles.sectionWrap}>
          <ReviewTrustPolicyCard />
        </View>
      </ScrollView>

      {/* 9. Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>TỔNG THANH TOÁN</Text>
          <View style={styles.priceWithDiscountRow}>
            <Text style={styles.bottomPriceValue}>
              {formatCurrency(finalTotal)} đ
            </Text>
            {discountAmount > 0 && (
              <View style={styles.savedBadge}>
                <Text style={styles.savedBadgeText}>
                  -{formatCurrency(discountAmount)}đ
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, isSubmitting && styles.confirmBtnDisabled]}
          onPress={handleConfirmBooking}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.confirmBtnText}>Tiến hành thanh toán</Text>
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
    paddingBottom: 120,
  },
  trackerSection: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[1],
    gap: theme.spacing[3],
  },
  stepNodesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  nodeCol: {
    alignItems: 'center',
    gap: 4,
  },
  nodeCircleCompleted: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.full,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLabelCompleted: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  nodeCircleActive: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeActiveNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: 'white',
  },
  nodeLabelActive: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  nodeLineCompleted: {
    flex: 1,
    height: 2.5,
    backgroundColor: '#059669',
    marginHorizontal: 4,
    marginBottom: 14,
  },
  titleBanner: {
    gap: 3,
    paddingTop: 2,
  },
  screenTitle: {
    ...theme.typography.h2,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  sectionWrap: {
    paddingHorizontal: theme.spacing[5],
    marginTop: theme.spacing[4],
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
  bottomPriceCol: {
    gap: 2,
  },
  bottomPriceLabel: {
    ...theme.typography.label,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.muted,
    letterSpacing: 0.5,
  },
  priceWithDiscountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomPriceValue: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  savedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  savedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  confirmBtn: {
    backgroundColor: theme.colors.primary.navy,
    borderRadius: theme.radius.xl,
    paddingHorizontal: 20,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.shadows.sm,
  },
  confirmBtnDisabled: {
    opacity: 0.7,
  },
  confirmBtnText: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
});
