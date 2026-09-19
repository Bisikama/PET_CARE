import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Receipt, ShieldAlert } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { formatCurrency } from '@/core/utils/currency';

interface ReviewPriceBreakdownCardProps {
  basePrice: number;
  sizeSurcharge: number;
  addonsPrice: number;
  platformFee: number;
  discountAmount: number;
  totalPrice: number;
  voucherCode?: string;
  sizeLabel?: string;
}

export function ReviewPriceBreakdownCard({
  basePrice,
  sizeSurcharge,
  addonsPrice,
  platformFee,
  discountAmount,
  totalPrice,
  voucherCode,
  sizeLabel = 'Cỡ lớn',
}: ReviewPriceBreakdownCardProps) {
  return (
    <View style={styles.card}>
      {/* Title */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Receipt size={18} color={theme.colors.secondary.onContainer} />
          <Text style={styles.titleText}>Chi tiết thanh toán</Text>
        </View>
        <Text style={styles.currencyBadge}>VND</Text>
      </View>

      <View style={styles.divider} />

      {/* Breakdown Items */}
      <View style={styles.itemsList}>
        {/* Base Service */}
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Giá dịch vụ tiêu chuẩn</Text>
          <Text style={styles.itemValue}>{formatCurrency(basePrice)} đ</Text>
        </View>

        {/* Size Surcharge */}
        {sizeSurcharge > 0 && (
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>
              Phụ phí cân nặng ({sizeLabel})
            </Text>
            <Text style={styles.itemValue}>+{formatCurrency(sizeSurcharge)} đ</Text>
          </View>
        )}

        {/* Add-ons */}
        {addonsPrice > 0 && (
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Dịch vụ bổ sung (Add-ons)</Text>
            <Text style={styles.itemValue}>+{formatCurrency(addonsPrice)} đ</Text>
          </View>
        )}

        {/* Platform Care Fee */}
        <View style={styles.itemRow}>
          <View style={styles.feeLabelWrap}>
            <Text style={styles.itemLabel}>Bảo hiểm & Phí an toàn PetCare</Text>
          </View>
          <Text style={styles.itemValue}>{formatCurrency(platformFee)} đ</Text>
        </View>

        {/* Voucher Discount */}
        {discountAmount > 0 && (
          <View style={styles.itemRow}>
            <View style={styles.discountLabelWrap}>
              <Text style={styles.discountLabel}>Ưu đãi Voucher</Text>
              {voucherCode && (
                <View style={styles.codeTag}>
                  <Text style={styles.codeTagText}>{voucherCode}</Text>
                </View>
              )}
            </View>
            <Text style={styles.discountValue}>
              -{formatCurrency(discountAmount)} đ
            </Text>
          </View>
        )}
      </View>

      <View style={styles.dividerBold} />

      {/* Total Amount Row */}
      <View style={styles.totalRow}>
        <View style={styles.totalLabelCol}>
          <Text style={styles.totalLabel}>TỔNG THANH TOÁN</Text>
          <Text style={styles.totalSubtext}>Đã bao gồm thuế GTGT & phí dịch vụ</Text>
        </View>
        <Text style={styles.totalValue}>{formatCurrency(totalPrice)} đ</Text>
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
  currencyBadge: {
    ...theme.typography.label,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text.muted,
    backgroundColor: theme.colors.surface.subdued,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.subdued,
  },
  dividerBold: {
    height: 1.5,
    backgroundColor: theme.colors.border.default,
  },
  itemsList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLabel: {
    ...theme.typography.bodySm,
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  itemValue: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  feeLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  discountLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  discountLabel: {
    ...theme.typography.bodySm,
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  codeTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radius.full,
  },
  codeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  discountValue: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  totalLabelCol: {
    gap: 2,
  },
  totalLabel: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primary.navy,
    letterSpacing: 0.3,
  },
  totalSubtext: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.muted,
  },
  totalValue: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
});
