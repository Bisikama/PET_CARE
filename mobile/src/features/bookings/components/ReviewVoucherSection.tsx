import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Tag, Check, X, Sparkles, Percent, Ticket } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { VoucherItem } from '../types/booking.types';
import { formatCurrency } from '@/core/utils/currency';

interface ReviewVoucherSectionProps {
  availableVouchers: VoucherItem[];
  appliedVoucher: VoucherItem | null;
  discountAmount: number;
  onApplyVoucher: (voucher: VoucherItem) => void;
  onRemoveVoucher: () => void;
  orderSubtotal: number;
}

export function ReviewVoucherSection({
  availableVouchers,
  appliedVoucher,
  discountAmount,
  onApplyVoucher,
  onRemoveVoucher,
  orderSubtotal,
}: ReviewVoucherSectionProps) {
  const [inputCode, setInputCode] = useState('');

  const handleApplyInputCode = () => {
    const trimmed = inputCode.trim().toUpperCase();
    if (!trimmed) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã ưu đãi.');
      return;
    }

    const found = availableVouchers.find(
      (v) => v.code.toUpperCase() === trimmed
    );

    if (!found) {
      Alert.alert('Không hợp lệ', 'Mã ưu đãi không tồn tại hoặc đã hết hạn.');
      return;
    }

    if (orderSubtotal < found.minOrderValue) {
      Alert.alert(
        'Chưa đạt điều kiện',
        `Mã này yêu cầu giá trị đơn hàng tối thiểu từ ${formatCurrency(
          found.minOrderValue
        )}đ.`
      );
      return;
    }

    onApplyVoucher(found);
    setInputCode('');
  };

  const handleSelectQuickVoucher = (voucher: VoucherItem) => {
    if (orderSubtotal < voucher.minOrderValue) {
      Alert.alert(
        'Chưa đạt điều kiện',
        `Mã này yêu cầu giá trị đơn hàng tối thiểu từ ${formatCurrency(
          voucher.minOrderValue
        )}đ.`
      );
      return;
    }
    onApplyVoucher(voucher);
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Ticket size={18} color={theme.colors.secondary.onContainer} />
          <Text style={styles.titleText}>Ưu đãi & Voucher</Text>
        </View>
        {appliedVoucher && (
          <View style={styles.savingTag}>
            <Sparkles size={11} color={theme.colors.feedback.success} />
            <Text style={styles.savingTagText}>
              Tiết kiệm {formatCurrency(discountAmount)}đ
            </Text>
          </View>
        )}
      </View>

      {/* Applied Voucher Card */}
      {appliedVoucher ? (
        <View style={styles.appliedCard}>
          <View style={styles.appliedIconCircle}>
            <Check size={16} color="#059669" strokeWidth={3} />
          </View>
          <View style={styles.appliedInfoCol}>
            <View style={styles.appliedCodeRow}>
              <Text style={styles.appliedCodeText}>{appliedVoucher.code}</Text>
              <View style={styles.appliedBadge}>
                <Text style={styles.appliedBadgeText}>Đang áp dụng</Text>
              </View>
            </View>
            <Text style={styles.appliedDescText}>{appliedVoucher.title}</Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemoveVoucher}
            activeOpacity={0.7}
          >
            <X size={16} color={theme.colors.text.muted} />
          </TouchableOpacity>
        </View>
      ) : (
        /* Input Row */
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <Tag size={16} color={theme.colors.text.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Nhập mã ưu đãi (ví dụ: PETCARE50)"
              placeholderTextColor={theme.colors.text.muted}
              value={inputCode}
              onChangeText={setInputCode}
              autoCapitalize="characters"
            />
          </View>
          <TouchableOpacity
            style={[
              styles.applyBtn,
              !inputCode.trim() && styles.applyBtnDisabled,
            ]}
            onPress={handleApplyInputCode}
            disabled={!inputCode.trim()}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.applyBtnText,
                !inputCode.trim() && styles.applyBtnTextDisabled,
              ]}
            >
              Áp dụng
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Select Voucher Pills */}
      {!appliedVoucher && availableVouchers.length > 0 && (
        <View style={styles.quickVouchersSection}>
          <Text style={styles.quickVouchersLabel}>GỢI Ý MÃ GIẢM GIÁ CHO BẠN:</Text>
          <View style={styles.quickVouchersList}>
            {availableVouchers.map((v) => (
              <TouchableOpacity
                key={v.code}
                style={styles.voucherPill}
                onPress={() => handleSelectQuickVoucher(v)}
                activeOpacity={0.7}
              >
                <View style={styles.voucherPillLeft}>
                  <Percent size={12} color={theme.colors.secondary.onContainer} />
                  <Text style={styles.voucherCodeText}>{v.code}</Text>
                </View>
                <View style={styles.pillDivider} />
                <Text style={styles.voucherPillDesc} numberOfLines={1}>
                  {v.discountType === 'PERCENT'
                    ? `Giảm ${v.discountValue}%`
                    : `Giảm ${formatCurrency(v.discountValue)}đ`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  titleWithIcon: {
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
  savingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  savingTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing[3],
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
    padding: 0,
  },
  applyBtn: {
    backgroundColor: theme.colors.primary.navy,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: theme.colors.surface.containerHigh,
  },
  applyBtnText: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.inverse,
  },
  applyBtnTextDisabled: {
    color: theme.colors.text.muted,
  },
  appliedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: theme.radius.lg,
    padding: theme.spacing[3],
  },
  appliedIconCircle: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appliedInfoCol: {
    flex: 1,
    gap: 2,
  },
  appliedCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appliedCodeText: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
  },
  appliedBadge: {
    backgroundColor: '#BBF7D0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radius.full,
  },
  appliedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  appliedDescText: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: '#166534',
  },
  removeButton: {
    padding: 6,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  quickVouchersSection: {
    gap: 6,
    paddingTop: 2,
  },
  quickVouchersLabel: {
    ...theme.typography.label,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.muted,
    letterSpacing: 0.5,
  },
  quickVouchersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  voucherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.container,
    borderRadius: theme.radius.md,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    borderStyle: 'dashed',
  },
  voucherPillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voucherCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  pillDivider: {
    width: 1,
    height: 10,
    backgroundColor: theme.colors.border.subdued,
    marginHorizontal: 6,
  },
  voucherPillDesc: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.secondary.onContainer,
  },
});
