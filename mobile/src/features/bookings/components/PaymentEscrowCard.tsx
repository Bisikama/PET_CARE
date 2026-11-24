import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, Lock, Clock } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { formatCurrency } from '@/core/utils/currency';

interface PaymentEscrowCardProps {
  totalAmount: number;
  /** Mã đặt lịch thật — chỉ có sau khi booking được tạo */
  bookingCode?: string | null;
  /**
   * Mốc hết giữ chỗ do backend trả về (ISO). Chưa có booking => null => không hiện đồng hồ,
   * vì lúc đó chưa có slot nào đang được giữ.
   */
  expiresAt?: string | null;
  /** Gọi một lần khi đồng hồ về 0 */
  onExpire?: () => void;
}

function secondsUntil(deadline: number) {
  return Math.max(0, Math.floor((deadline - Date.now()) / 1000));
}

export function PaymentEscrowCard({
  totalAmount,
  bookingCode,
  expiresAt,
  onExpire,
}: PaymentEscrowCardProps) {
  const deadline = expiresAt ? new Date(expiresAt).getTime() : NaN;
  const hasDeadline = Number.isFinite(deadline);
  const [secondsLeft, setSecondsLeft] = useState(() => (hasDeadline ? secondsUntil(deadline) : 0));

  // Giữ onExpire mới nhất mà không khởi động lại đồng hồ mỗi lần render
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!hasDeadline) return;
    let fired = false;
    const tick = () => {
      const left = secondsUntil(deadline);
      setSecondsLeft(left);
      if (left === 0 && !fired) {
        fired = true;
        onExpireRef.current?.();
      }
      return left;
    };
    // Tính lại theo đồng hồ thật (không trừ dần) để đúng cả khi app vừa chạy nền
    if (tick() === 0) return;
    const timer = setInterval(() => {
      if (tick() === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline, hasDeadline]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const urgent = hasDeadline && secondsLeft <= 5 * 60;

  return (
    <View style={styles.card}>
      {/* Top Header Badge */}
      <View style={styles.topRow}>
        <View style={styles.securityBadge}>
          <ShieldCheck size={14} color="#059669" />
          <Text style={styles.securityBadgeText}>BẢO VỆ KÝ QUỸ ESCROW</Text>
        </View>

        {hasDeadline && (
          <View
            style={[styles.timerBadge, urgent && styles.timerBadgeUrgent]}
            accessibilityLabel={
              secondsLeft > 0
                ? `Còn ${minutes} phút ${seconds} giây giữ chỗ`
                : 'Đã hết thời gian giữ chỗ'
            }
          >
            <Clock size={12} color={urgent ? '#BE123C' : '#D97706'} />
            <Text style={[styles.timerText, urgent && styles.timerTextUrgent]}>
              {secondsLeft > 0 ? formattedTime : 'Hết hạn'}
            </Text>
          </View>
        )}
      </View>

      {/* Amount Display */}
      <View style={styles.amountSection}>
        <Text style={styles.amountLabel}>SỐ TIỀN CẦN THANH TOÁN</Text>
        <Text style={styles.amountValue}>{formatCurrency(totalAmount)} đ</Text>
        {bookingCode ? (
          <Text style={styles.codeText}>Mã đặt lịch: #{bookingCode}</Text>
        ) : (
          <Text style={styles.codeText}>Khung giờ sẽ được giữ cho bạn khi bấm thanh toán</Text>
        )}
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
  timerBadgeUrgent: {
    backgroundColor: '#FFE4E6',
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    fontVariant: ['tabular-nums'],
  },
  timerTextUrgent: {
    color: '#BE123C',
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
