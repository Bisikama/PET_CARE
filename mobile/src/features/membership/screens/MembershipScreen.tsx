import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Crown, Landmark, Wallet, CreditCard, CheckCircle2 } from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { ScreenHeader } from '@/core/components/ScreenHeader';
import { theme } from '@/core/theme';
import { formatCurrency } from '@/core/utils/currency';
import {
  subscriptionsApi,
  type SubscriptionBankTransferCheckout,
  type SubscriptionOrderStatus,
  type SubscriptionPaymentMethod,
} from '@/infrastructure/api';
import { PaymentVietQrModal } from '@/features/bookings/components/PaymentVietQrModal';
import { PlanCard } from '../components/PlanCard';
import { useMembership, useSubscriptionOrderStatus } from '../hooks/useMembership';

const METHODS: { key: SubscriptionPaymentMethod; label: string; hint: string; Icon: typeof Landmark }[] = [
  { key: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng (VietQR)', hint: 'Quét mã, kích hoạt tự động', Icon: Landmark },
  { key: 'WALLET', label: 'Ví PetCare', hint: 'Dùng số dư hoàn tiền', Icon: Wallet },
  { key: 'VNPAY', label: 'VNPay', hint: 'Thẻ ATM / ví điện tử', Icon: CreditCard },
];

const ORDER_STATUS: Record<SubscriptionOrderStatus, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Chờ thanh toán', color: '#B45309', bg: theme.colors.semantic.warningContainer },
  PAID: { label: 'Đã thanh toán', color: '#047857', bg: theme.colors.semantic.successContainer },
  CANCELLED: { label: 'Đã huỷ', color: theme.colors.text.muted, bg: theme.colors.background.subtle },
};
const METHOD_LABEL: Record<SubscriptionPaymentMethod, string> = {
  BANK_TRANSFER: 'Chuyển khoản',
  VNPAY: 'VNPay',
  WALLET: 'Ví PetCare',
};

const formatDate = (val: string) => new Date(val).toLocaleDateString('vi-VN');
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function MembershipScreen() {
  const { plans, mySubscription, orders, walletBalance, isLoading, isRefreshing, error, reload, refresh } =
    useMembership();

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [method, setMethod] = useState<SubscriptionPaymentMethod>('BANK_TRANSFER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transfer, setTransfer] = useState<SubscriptionBankTransferCheckout | null>(null);
  const { status: transferStatus, isChecking, checkNow } = useSubscriptionOrderStatus(transfer?.orderId ?? null);

  // Đang có gói còn hạn => chỉ gia hạn được đúng gói đó
  const lockedTo = mySubscription?.planCode ?? null;

  useEffect(() => {
    if (selectedCode || plans.length === 0) return;
    setSelectedCode(lockedTo ?? plans[0].code);
  }, [plans, lockedTo, selectedCode]);

  const selectedPlan = useMemo(() => plans.find((p) => p.code === selectedCode) ?? null, [plans, selectedCode]);

  const showActivated = (planName: string) => {
    Alert.alert('Kích hoạt thành công', `${planName} đã được kích hoạt. Cảm ơn bạn đã đồng hành cùng PetCare!`);
    reload();
  };

  // Webhook SePay báo có => đơn chuyển sang PAID
  useEffect(() => {
    if (!transfer || !transferStatus) return;
    if (transferStatus === 'PAID') {
      const name = transfer.planName;
      setTransfer(null);
      showActivated(name);
    } else if (transferStatus === 'CANCELLED') {
      setTransfer(null);
      Alert.alert(
        'Mã thanh toán đã hết hiệu lực',
        'Nếu bạn đã chuyển tiền vào mã này, số tiền sẽ được hoàn tự động vào Ví PetCare.',
      );
      reload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferStatus]);

  const handleConfirmTransferred = async () => {
    const result = await checkNow();
    if (result === 'PENDING') {
      Alert.alert(
        'Chưa nhận được tiền',
        'Ngân hàng thường báo về trong vài giây đến 1–2 phút. Vui lòng giữ màn hình này, gói sẽ tự kích hoạt.',
      );
    }
  };

  /** Sau khi đóng trình duyệt VNPay, hỏi backend vài lần xem IPN đã kích hoạt gói chưa. */
  const waitForVnpay = async (orderId: string, planName: string) => {
    for (let i = 0; i < 5; i++) {
      try {
        const order = await subscriptionsApi.getMyOrder(orderId);
        if (order.status === 'PAID') return showActivated(planName);
      } catch {
        // thử lại
      }
      await sleep(2000);
    }
    Alert.alert(
      'Chưa xác nhận được thanh toán',
      'Nếu bạn đã thanh toán thành công trên VNPay, gói sẽ được kích hoạt trong ít phút. Kéo xuống để làm mới.',
    );
    reload();
  };

  const pay = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    try {
      if (method === 'BANK_TRANSFER') {
        setTransfer(await subscriptionsApi.checkoutBankTransfer(selectedPlan.code));
      } else if (method === 'WALLET') {
        await subscriptionsApi.checkoutWallet(selectedPlan.code);
        showActivated(selectedPlan.name);
      } else {
        const { paymentUrl, orderId } = await subscriptionsApi.checkoutVnpay(selectedPlan.code);
        if (!paymentUrl) throw new Error('Không tạo được liên kết thanh toán VNPay.');
        await WebBrowser.openBrowserAsync(paymentUrl);
        await waitForVnpay(orderId, selectedPlan.name);
      }
    } catch (e: any) {
      Alert.alert('Không thể thanh toán', e?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePay = () => {
    if (!selectedPlan) return;
    if (method === 'WALLET') {
      if (walletBalance !== null && walletBalance < selectedPlan.price) {
        Alert.alert('Số dư không đủ', `Ví PetCare còn ${formatCurrency(walletBalance)} đ. Vui lòng chọn phương thức khác.`);
        return;
      }
      Alert.alert(
        'Xác nhận thanh toán',
        `Trừ ${formatCurrency(selectedPlan.price)} đ từ Ví PetCare để ${lockedTo ? 'gia hạn' : 'mua'} ${selectedPlan.name}?`,
        [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Thanh toán', onPress: pay },
        ],
      );
      return;
    }
    pay();
  };

  if (isLoading) {
    return (
      <Screen style={styles.screen}>
        <ScreenHeader title="Gói Hội Viên" />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary.navy} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen} edges={['top', 'left', 'right']}>
      <ScreenHeader title="Gói Hội Viên" />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
      >
        {mySubscription ? (
          <View style={styles.currentCard}>
            <CheckCircle2 size={22} color={theme.colors.tertiary.default} />
            <View style={styles.flex1}>
              <Text style={styles.currentLabel}>Gói đang dùng</Text>
              <Text style={styles.currentName}>{mySubscription.planName}</Text>
              <Text style={styles.currentExpiry}>Hiệu lực đến {formatDate(mySubscription.expiresAt)}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.heroCard}>
            <Crown size={24} color={theme.colors.secondary.gold} />
            <View style={styles.flex1}>
              <Text style={styles.heroTitle}>Trở thành hội viên PetCare</Text>
              <Text style={styles.heroText}>Nhận ưu đãi khi đặt dịch vụ chăm sóc thú cưng.</Text>
            </View>
          </View>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Text style={styles.sectionTitle}>{lockedTo ? 'Gia hạn gói' : '1. Chọn gói'}</Text>
        {plans.length === 0 ? (
          <Text style={styles.emptyText}>Hiện chưa có gói nào được mở bán.</Text>
        ) : (
          <View style={styles.list}>
            {plans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                selected={selectedCode === p.code}
                isCurrent={lockedTo === p.code}
                disabled={Boolean(lockedTo && lockedTo !== p.code)}
                onPress={() => setSelectedCode(p.code)}
              />
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>2. Phương thức thanh toán</Text>
        <View style={styles.list}>
          {METHODS.map(({ key, label, hint, Icon }) => {
            const active = method === key;
            const walletHint =
              key === 'WALLET' && walletBalance !== null ? `Số dư: ${formatCurrency(walletBalance)} đ` : hint;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.85}
                onPress={() => setMethod(key)}
                style={[styles.methodRow, active && styles.methodRowActive]}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <View style={[styles.methodIcon, active && styles.methodIconActive]}>
                  <Icon size={18} color={active ? 'white' : theme.colors.primary.navy} />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.methodLabel}>{label}</Text>
                  <Text style={styles.methodHint}>{walletHint}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {orders.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Lịch sử mua gói</Text>
            <View style={styles.historyCard}>
              {orders.map((o, idx) => (
                <View key={o.id} style={[styles.historyRow, idx > 0 && styles.historyDivider]}>
                  <View style={styles.flex1}>
                    <Text style={styles.historyName}>{o.planName}</Text>
                    <Text style={styles.historyMeta}>
                      {formatDate(o.createdAt)} · {METHOD_LABEL[o.method]}
                    </Text>
                    {o.transferContent ? <Text style={styles.historyCode}>{o.transferContent}</Text> : null}
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyAmount}>{formatCurrency(o.amount)} đ</Text>
                    <View style={[styles.statusPill, { backgroundColor: ORDER_STATUS[o.status].bg }]}>
                      <Text style={[styles.statusText, { color: ORDER_STATUS[o.status].color }]}>
                        {ORDER_STATUS[o.status].label}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, (!selectedPlan || isSubmitting) && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={!selectedPlan || isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payBtnText}>
              {selectedPlan
                ? `${lockedTo ? 'Gia hạn' : 'Thanh toán'} ${formatCurrency(selectedPlan.price)} đ`
                : 'Chọn một gói'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <PaymentVietQrModal
        visible={Boolean(transfer)}
        checkout={transfer}
        title={transfer ? `Chuyển khoản mua ${transfer.planName}` : undefined}
        warning={
          transfer
            ? `Sai mã ${transfer.paymentCode}, hệ thống không tự kích hoạt gói được. Gói được kích hoạt ngay khi ngân hàng báo có.`
            : undefined
        }
        isChecking={isChecking}
        onClose={() => {
          setTransfer(null);
          reload();
        }}
        onConfirmPaid={handleConfirmTransferred}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingBottom: theme.spacing[8],
    gap: theme.spacing[3],
  },
  flex1: {
    flex: 1,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    backgroundColor: theme.colors.primary.navy,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[4],
  },
  heroTitle: {
    ...theme.typography.h4,
    color: 'white',
  },
  heroText: {
    ...theme.typography.bodySm,
    color: theme.colors.primary.surface,
    marginTop: 2,
  },
  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    backgroundColor: theme.colors.semantic.successContainer,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[4],
  },
  currentLabel: {
    ...theme.typography.caption,
    color: '#047857',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  currentName: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
  },
  currentExpiry: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
  },
  errorText: {
    ...theme.typography.bodySm,
    color: theme.colors.semantic.error,
  },
  sectionTitle: {
    ...theme.typography.label,
    color: theme.colors.text.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: theme.spacing[3],
  },
  emptyText: {
    ...theme.typography.bodySm,
    color: theme.colors.text.muted,
    textAlign: 'center',
    paddingVertical: theme.spacing[6],
  },
  list: {
    gap: theme.spacing[3],
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
    padding: theme.spacing[3],
  },
  methodRowActive: {
    borderColor: theme.colors.primary.navy,
    backgroundColor: theme.colors.surface.subdued,
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.subdued,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconActive: {
    backgroundColor: theme.colors.primary.navy,
  },
  methodLabel: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  methodHint: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
  },
  historyCard: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    paddingHorizontal: theme.spacing[4],
  },
  historyRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[3],
  },
  historyDivider: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subdued,
  },
  historyName: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  historyMeta: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
  },
  historyCode: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyAmount: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  statusPill: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusText: {
    ...theme.typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  footer: {
    padding: theme.spacing[4],
    backgroundColor: theme.colors.surface.lowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  payBtn: {
    backgroundColor: theme.colors.primary.navy,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing[4],
    alignItems: 'center',
  },
  payBtnDisabled: {
    opacity: 0.5,
  },
  payBtnText: {
    ...theme.typography.button,
    color: 'white',
    fontWeight: '700',
  },
});
