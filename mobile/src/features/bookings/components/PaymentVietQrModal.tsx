import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { QrCode, Copy, Check, X, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { formatCurrency } from '@/core/utils/currency';

interface PaymentVietQrModalProps {
  visible: boolean;
  amount: number;
  bookingCode?: string;
  onClose: () => void;
  onConfirmPaid: () => void;
}

export function PaymentVietQrModal({
  visible,
  amount,
  bookingCode = 'BK-2026-9812',
  onClose,
  onConfirmPaid,
}: PaymentVietQrModalProps) {
  const bankInfo = {
    bankName: 'MB Bank (Quân Đội)',
    accountNumber: '888899996688',
    accountName: 'PETCARE VIETNAM JSC',
    transferContent: `PETCARE ${bookingCode.replace(/[^A-Za-z0-9]/g, '')}`,
  };

  const handleCopy = (text: string, label: string) => {
    Alert.alert('Đã sao chép', `Đã sao chép ${label}: ${text}`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.titleWrap}>
              <QrCode size={20} color={theme.colors.secondary.onContainer} />
              <Text style={styles.sheetTitle}>Quét mã VietQR Chuyển khoản</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.colors.text.muted} />
            </TouchableOpacity>
          </View>

          {/* QR Code Container */}
          <View style={styles.qrCard}>
            <View style={styles.qrImageWrap}>
              <Image
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=vietqr_petcare_${bookingCode}_${amount}`,
                }}
                style={styles.qrImage}
              />
            </View>
            <Text style={styles.qrSubtext}>
              Mở ứng dụng Mobile Banking bất kỳ để quét mã
            </Text>
          </View>

          {/* Bank Account Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ngân hàng</Text>
              <Text style={styles.detailValue}>{bankInfo.bankName}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số tài khoản</Text>
              <TouchableOpacity
                style={styles.copyValueRow}
                onPress={() => handleCopy(bankInfo.accountNumber, 'Số tài khoản')}
              >
                <Text style={styles.detailValueBold}>{bankInfo.accountNumber}</Text>
                <Copy size={14} color={theme.colors.secondary.onContainer} />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tên người thụ hưởng</Text>
              <Text style={styles.detailValueBold}>{bankInfo.accountName}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số tiền</Text>
              <TouchableOpacity
                style={styles.copyValueRow}
                onPress={() => handleCopy(String(amount), 'Số tiền')}
              >
                <Text style={styles.detailValuePrice}>{formatCurrency(amount)} đ</Text>
                <Copy size={14} color="#059669" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nội dung CK</Text>
              <TouchableOpacity
                style={styles.copyValueRow}
                onPress={() => handleCopy(bankInfo.transferContent, 'Nội dung chuyển khoản')}
              >
                <Text style={styles.detailValueContent}>{bankInfo.transferContent}</Text>
                <Copy size={14} color={theme.colors.secondary.onContainer} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.confirmPaidBtn}
              onPress={onConfirmPaid}
              activeOpacity={0.85}
            >
              <Check size={18} color="white" />
              <Text style={styles.confirmPaidBtnText}>Tôi đã chuyển khoản thành công</Text>
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
    maxHeight: '90%',
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
    width: 180,
    height: 180,
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
  actionsRow: {
    paddingTop: theme.spacing[2],
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
  confirmPaidBtnText: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
});
