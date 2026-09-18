import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Wallet,
  CreditCard,
  Banknote,
  CheckCircle2,
  Circle,
  Smartphone,
} from 'lucide-react-native';
import { theme } from '@/core/theme';
import { PaymentMethodType } from '../types/booking.types';
import { formatCurrency } from '@/core/utils/currency';

interface ReviewPaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
  walletBalance?: number;
}

export function ReviewPaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  walletBalance = 1250000,
}: ReviewPaymentMethodSelectorProps) {
  const methods: {
    id: PaymentMethodType;
    title: string;
    subtext: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'WALLET',
      title: 'Ví PetCare Wallet',
      subtext: `Số dư khả dụng: ${formatCurrency(walletBalance)} đ`,
      icon: <Wallet size={18} color={theme.colors.secondary.onContainer} />,
      badge: 'Khuyên dùng',
    },
    {
      id: 'VNPAY',
      title: 'VNPay / Thẻ ATM / QR',
      subtext: 'Thanh toán trực tuyến bảo mật qua VNPAY-QR',
      icon: <CreditCard size={18} color="#2563EB" />,
    },
    {
      id: 'MOMO',
      title: 'Ví MoMo',
      subtext: 'Liên kết thanh toán nhanh chóng một chạm',
      icon: <Smartphone size={18} color="#D946EF" />,
    },
    {
      id: 'CASH',
      title: 'Tiền mặt khi hoàn thành',
      subtext: 'Thanh toán trực tiếp cho chuyên viên chăm sóc',
      icon: <Banknote size={18} color="#16A34A" />,
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Wallet size={18} color={theme.colors.secondary.onContainer} />
          <Text style={styles.titleText}>Phương thức thanh toán</Text>
        </View>
      </View>

      <View style={styles.methodsList}>
        {methods.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodItem,
                isSelected && styles.methodItemSelected,
              ]}
              onPress={() => onSelectMethod(method.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>{method.icon}</View>

              <View style={styles.methodInfoCol}>
                <View style={styles.methodTitleRow}>
                  <Text
                    style={[
                      styles.methodTitleText,
                      isSelected && styles.methodTitleSelected,
                    ]}
                  >
                    {method.title}
                  </Text>
                  {method.badge && (
                    <View style={styles.badgeWrap}>
                      <Text style={styles.badgeText}>{method.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.methodSubtext} numberOfLines={1}>
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
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
    gap: theme.spacing[3],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    ...theme.typography.label,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  methodsList: {
    gap: 8,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    padding: theme.spacing[3],
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.subdued,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  methodItemSelected: {
    backgroundColor: theme.colors.surface.lowest,
    borderColor: theme.colors.secondary.onContainer,
    ...theme.shadows.sm,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.lowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfoCol: {
    flex: 1,
    gap: 2,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  methodTitleText: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  methodTitleSelected: {
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  badgeWrap: {
    backgroundColor: theme.colors.secondary.container,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.secondary.onContainer,
  },
  methodSubtext: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
});
