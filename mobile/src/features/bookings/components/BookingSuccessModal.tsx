import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { CheckCircle2, Calendar, Clock, MapPin, Sparkles, ArrowRight } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { formatCurrency } from '@/core/utils/currency';

interface BookingSuccessModalProps {
  visible: boolean;
  bookingCode?: string;
  serviceTitle: string;
  providerName: string;
  petName: string;
  dateSlotText: string;
  totalPrice: number;
  onViewBooking: () => void;
  onGoHome: () => void;
}

export function BookingSuccessModal({
  visible,
  bookingCode = 'BK-2026-9812',
  serviceTitle,
  providerName,
  petName,
  dateSlotText,
  totalPrice,
  onViewBooking,
  onGoHome,
}: BookingSuccessModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Success Badge */}
          <View style={styles.successIconOuter}>
            <View style={styles.successIconInner}>
              <CheckCircle2 size={36} color="white" strokeWidth={2.5} />
            </View>
          </View>

          {/* Title & Code */}
          <Text style={styles.modalTitle}>Đặt lịch thành công! 🎉</Text>
          <Text style={styles.modalSubtitle}>
            Chuyên viên chăm sóc đã nhận được yêu cầu và sẵn sàng phục vụ bé yêu.
          </Text>

          <View style={styles.codeBadge}>
            <Text style={styles.codeLabel}>Mã lịch hẹn:</Text>
            <Text style={styles.codeValue}>#{bookingCode}</Text>
          </View>

          {/* Summary Box */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Dịch vụ</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {serviceTitle}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Chuyên viên</Text>
              <Text style={styles.summaryValue}>{providerName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Thú cưng</Text>
              <Text style={styles.summaryValue}>{petName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Thời gian</Text>
              <Text style={styles.summaryValue}>{dateSlotText}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalPrice)} đ</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsCol}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onViewBooking}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Xem chi tiết lịch hẹn</Text>
              <ArrowRight size={16} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onGoHome}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBtnText}>Về trang chủ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[5],
  },
  container: {
    width: '100%',
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius['2xl'],
    padding: theme.spacing[5],
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  successIconOuter: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[3],
  },
  successIconInner: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: theme.spacing[2],
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surface.container,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[3],
  },
  codeLabel: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
  codeValue: {
    ...theme.typography.label,
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[3],
    gap: 8,
    marginBottom: theme.spacing[4],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    ...theme.typography.label,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.primary,
    maxWidth: '65%',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.subdued,
    marginVertical: 2,
  },
  totalLabel: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  totalValue: {
    ...theme.typography.label,
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  actionsCol: {
    width: '100%',
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary.navy,
    borderRadius: theme.radius.lg,
    height: 48,
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
  secondaryBtn: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
});
