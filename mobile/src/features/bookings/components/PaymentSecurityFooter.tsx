import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, Lock, CheckCircle2, RotateCcw } from 'lucide-react-native';
import { theme } from '@/core/theme';

export function PaymentSecurityFooter() {
  return (
    <View style={styles.container}>
      <View style={styles.badgeRow}>
        <View style={styles.badgeItem}>
          <ShieldCheck size={14} color="#059669" />
          <Text style={styles.badgeText}>PCI-DSS Level 1</Text>
        </View>

        <View style={styles.dot} />

        <View style={styles.badgeItem}>
          <Lock size={13} color="#2563EB" />
          <Text style={styles.badgeText}>256-bit SSL Encryption</Text>
        </View>

        <View style={styles.dot} />

        <View style={styles.badgeItem}>
          <RotateCcw size={13} color="#D97706" />
          <Text style={styles.badgeText}>100% Hoàn tiền</Text>
        </View>
      </View>

      <Text style={styles.guaranteeText}>
        Mọi giao dịch trên PetCare đều được bảo vệ và mã hóa đầu cuối. Bạn hoàn toàn an tâm khi thanh toán và đặt lịch.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[2],
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surface.lowest,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  badgeText: {
    ...theme.typography.label,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.text.muted,
  },
  guaranteeText: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.muted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
