import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, Lock, Clock, AlertCircle } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { formatCurrency } from '@/core/utils/currency';

interface PaymentEscrowCardProps {
  totalAmount: number;
  bookingCode?: string;
  initialMinutes?: number;
  onExpire?: () => void;
}

export function PaymentEscrowCard({
  totalAmount,
  bookingCode = 'BK-2026-9812',
  initialMinutes = 15,
  onExpire,
}: PaymentEscrowCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(
    seconds
  ).padStart(2, '0')}`;

  return (
    <View style={styles.card}>
      {/* Top Header Badge */}
      <View style={styles.topRow}>
        <View style={styles.securityBadge}>
          <ShieldCheck size={14} color="#059669" />
          <Text style={styles.securityBadgeText}>BẢO VỆ KÝ QUỸ ESCROW</Text>
        </View>

        <View style={styles.timerBadge}>
          <Clock size={12} color="#D97706" />
          <Text style={styles.timerText}>{formattedTime}</Text>
        </View>
      </View>

      {/* Amount Display */}
      <View style={styles.amountSection}>
        <Text style={styles.amountLabel}>SỐ TIỀN CẦN THANH TOÁN</Text>
        <Text style={styles.amountValue}>{formatCurrency(totalAmount)} đ</Text>
        <Text style={styles.codeText}>Mã đặt lịch: #{bookingCode}</Text>
      </View>

      {/* Escrow Note */}
      <View style={styles.escrowNoteBox}>
        <Lock size={15} color={theme.colors.secondary.onContainer} style={styles.lockIcon} />
        <Text style={styles.escrowNoteText}>
          Số tiền được giữ an toàn tại PetCare Escrow và chỉ giải ngân cho chuyên viên sau khi bé hoàn thành dịch vụ và bạn hài lòng 100%.
        </Text>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  securityBadge: {
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
  securityBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
    gap: 3,
  },
  amountLabel: {
    ...theme.typography.label,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text.muted,
    letterSpacing: 0.8,
  },
  amountValue: {
    ...theme.typography.h1,
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.primary.navy,
    letterSpacing: -0.5,
  },
  codeText: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  escrowNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[3],
  },
  lockIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  escrowNoteText: {
    flex: 1,
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
    lineHeight: 16,
  },
});
