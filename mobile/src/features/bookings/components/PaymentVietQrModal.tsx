import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { QrCode, Copy, Check, X, AlertTriangle, Clock } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { formatCurrency } from '@/core/utils/currency';
import type { BankTransferCheckout } from '@/infrastructure/api/payments.api';

/** Đơn mua gói hội viên không giữ chỗ nên không có `expiresAt`. */
type VietQrCheckout = Omit<BankTransferCheckout, 'expiresAt'> & { expiresAt?: string };

interface PaymentVietQrModalProps {
  visible: boolean;
  checkout: VietQrCheckout | null;
  /** Mặc định: "Quét mã VietQR Chuyển khoản" */
  title?: string;
  /** Thay đoạn cảnh báo mặc định (dành cho đơn đặt lịch) */
  warning?: React.ReactNode;
  /** Đang hỏi backend xem SePay đã báo có chưa */
  isChecking?: boolean;
  onClose: () => void;
  /** Khách bấm "Tôi đã chuyển khoản" -> kiểm tra ngay với backend (không tự xác nhận) */
  onConfirmPaid: () => void;
}

/** Đếm ngược tới hết thời gian giữ chỗ do backend trả về. */
function HoldCountdown({ expiresAt }: { expiresAt: string }) {
  const deadline = React.useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const compute = React.useCallback(
    () => Math.max(0, Math.floor((deadline - Date.now()) / 1000)),
    [deadline]
  );
  const [secondsLeft, setSecondsLeft] = React.useState(compute);

  React.useEffect(() => {
    const timer = setInterval(() => setSecondsLeft(compute()), 1000);
    return () => clearInterval(timer);
  }, [compute]);

  if (!Number.isFinite(deadline)) return null;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const urgent = secondsLeft <= 5 * 60;
  const until = new Date(deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.countdownRow, urgent && styles.countdownRowUrgent]}>
      <View style={styles.countdownLabelWrap}>
        <Clock size={14} color={urgent ? '#BE123C' : theme.colors.text.secondary} />
        <Text style={[styles.countdownLabel, urgent && styles.countdownTextUrgent]}>
          {secondsLeft > 0 ? `Giữ chỗ đến ${until}` : 'Đã hết thời gian giữ chỗ'}
        </Text>
      </View>
      <Text style={[styles.countdownValue, urgent && styles.countdownTextUrgent]}>
        {mm}:{ss}
      </Text>
    </View>
  );
}

export function PaymentVietQrModal({
  visible,
  checkout,
  isChecking = false,
  title = 'Quét mã VietQR Chuyển khoản',
  warning,
  onClose,
  onConfirmPaid,
}: PaymentVietQrModalProps) {
  const handleCopy = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Đã sao chép', `${label}: ${text}`);
  };

  if (!checkout) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.titleWrap}>
              <QrCode size={20} color={theme.colors.secondary.onContainer} />
              <Text style={styles.sheetTitle}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.colors.text.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {checkout.expiresAt ? <HoldCountdown expiresAt={checkout.expiresAt} /> : null}

            {/* QR Code Container */}
            <View style={styles.qrCard}>
              <View style={styles.qrImageWrap}>
                <Image source={{ uri: checkout.qrImageUrl }} style={styles.qrImage} resizeMode="contain" />
              </View>
              <Text style={styles.qrSubtext}>
                Mở ứng dụng ngân hàng bất kỳ để quét mã. Số tiền và nội dung đã được điền sẵn.
              </Text>
            </View>

            {/* Bank Account Details */}
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ngân hàng</Text>
                <Text style={styles.detailValue}>{checkout.bankName}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Số tài khoản</Text>
                <TouchableOpacity
                  style={styles.copyValueRow}
                  onPress={() => handleCopy(checkout.accountNumber, 'Số tài khoản')}
                >
                  <Text style={styles.detailValueBold}>{checkout.accountNumber}</Text>
                  <Copy size={14} color={theme.colors.secondary.onContainer} />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tên người thụ hưởng</Text>
                <Text style={styles.detailValueBold}>{checkout.accountName}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Số tiền</Text>
                <TouchableOpacity
                  style={styles.copyValueRow}
                  onPress={() => handleCopy(String(checkout.amount), 'Số tiền')}
                >
                  <Text style={styles.detailValuePrice}>{formatCurrency(checkout.amount)} đ</Text>
                  <Copy size={14} color="#059669" />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nội dung CK</Text>
                <TouchableOpacity
                  style={styles.copyValueRow}
                  onPress={() => handleCopy(checkout.transferContent, 'Nội dung chuyển khoản')}
                >
                  <Text style={styles.detailValueContent}>{checkout.transferContent}</Text>
                  <Copy size={14} color={theme.colors.secondary.onContainer} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Warning */}
            <View style={styles.warningCard}>
              <AlertTriangle size={16} color="#B45309" />
              <Text style={styles.warningText}>
                Giữ nguyên nội dung <Text style={styles.warningStrong}>{checkout.transferContent}</Text> và
                đúng số tiền.{' '}
                {warning ??
                  'Sai nội dung hệ thống sẽ không tự xác nhận được đơn. Nếu đơn hết hạn giữ chỗ trước khi nhận được tiền, số tiền sẽ được hoàn vào Ví PetCare.'}
              </Text>
            </View>

            {isChecking && (
              <View style={styles.checkingRow}>
                <ActivityIndicator size="small" color={theme.colors.secondary.onContainer} />
                <Text style={styles.checkingText}>Đang chờ ngân hàng xác nhận giao dịch...</Text>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.confirmPaidBtn, isChecking && styles.confirmPaidBtnDisabled]}
              onPress={onConfirmPaid}
              disabled={isChecking}
              activeOpacity={0.85}
            >
              <Check size={18} color="white" />
              <Text style={styles.confirmPaidBtnText}>Tôi đã chuyển khoản</Text>
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
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: theme.colors.surface.lowest,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing[5],
    gap: theme.spacing[3],
    maxHeight: '92%',
  },
  body: {
    gap: theme.spacing[3],
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing[1],
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTitle: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  closeBtn: {
    padding: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.subdued,
  },
  qrCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: 8,
  },
  qrImageWrap: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: theme.radius.lg,
    ...theme.shadows.sm,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrSubtext: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[3],
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  detailLabel: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  detailValue: {
    ...theme.typography.label,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  copyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
    marginLeft: 12,
  },
  detailValueBold: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  detailValuePrice: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  detailValueContent: {
    ...theme.typography.label,
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary.navy,
    backgroundColor: theme.colors.surface.container,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.subdued,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
  },
  countdownRowUrgent: {
    backgroundColor: '#FFF1F2',
  },
  countdownLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  countdownValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  countdownTextUrgent: {
    color: '#BE123C',
  },
  warningCard: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: theme.radius.lg,
    padding: theme.spacing[3],
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#92400E',
  },
  warningStrong: {
    fontWeight: '800',
  },
  checkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkingText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  actionsRow: {
    paddingTop: theme.spacing[1],
  },
  confirmPaidBtn: {
    backgroundColor: theme.colors.primary.navy,
    borderRadius: theme.radius.xl,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.shadows.sm,
  },
  confirmPaidBtnDisabled: {
    opacity: 0.6,
  },
  confirmPaidBtnText: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
});
