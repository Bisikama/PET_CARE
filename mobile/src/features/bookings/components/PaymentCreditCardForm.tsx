import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { CreditCard, ShieldCheck, Lock } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface PaymentCreditCardFormProps {
  cardNumber: string;
  onChangeCardNumber: (text: string) => void;
  cardHolder: string;
  onChangeCardHolder: (text: string) => void;
  expiryDate: string;
  onChangeExpiryDate: (text: string) => void;
  cvv: string;
  onChangeCvv: (text: string) => void;
  saveCard: boolean;
  onToggleSaveCard: (val: boolean) => void;
}

export function PaymentCreditCardForm({
  cardNumber,
  onChangeCardNumber,
  cardHolder,
  onChangeCardHolder,
  expiryDate,
  onChangeExpiryDate,
  cvv,
  onChangeCvv,
  saveCard,
  onToggleSaveCard,
}: PaymentCreditCardFormProps) {
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    onChangeCardNumber(formatted);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      onChangeExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      onChangeExpiryDate(cleaned);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Card Visual Preview */}
      <View style={styles.cardPreview}>
        <View style={styles.cardPreviewTop}>
          <Text style={styles.bankTitle}>PETCARE SECURE CARD</Text>
          <CreditCard size={24} color="#F59E0B" />
        </View>

        <View style={styles.chipRow}>
          <View style={styles.chip} />
          <Lock size={14} color="rgba(255,255,255,0.7)" />
        </View>

        <Text style={styles.cardNumberText}>
          {cardNumber || '•••• •••• •••• ••••'}
        </Text>

        <View style={styles.cardPreviewBottom}>
          <View style={styles.cardCol}>
            <Text style={styles.cardSmallLabel}>CHỦ THẺ</Text>
            <Text style={styles.cardHolderText} numberOfLines={1}>
              {cardHolder || 'NGUYEN VAN A'}
            </Text>
          </View>

          <View style={styles.cardCol}>
            <Text style={styles.cardSmallLabel}>HẾT HẠN</Text>
            <Text style={styles.cardHolderText}>{expiryDate || 'MM/YY'}</Text>
          </View>
        </View>
      </View>

      {/* 2. Inputs */}
      <View style={styles.inputsSection}>
        {/* Card Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Số thẻ</Text>
          <TextInput
            style={styles.textInput}
            placeholder="4123 4567 8901 2345"
            placeholderTextColor={theme.colors.text.muted}
            value={cardNumber}
            onChangeText={formatCardNumber}
            keyboardType="numeric"
            maxLength={19}
          />
        </View>

        {/* Cardholder Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tên in trên thẻ</Text>
          <TextInput
            style={styles.textInput}
            placeholder="NGUYEN VAN A"
            placeholderTextColor={theme.colors.text.muted}
            value={cardHolder}
            onChangeText={(t) => onChangeCardHolder(t.toUpperCase())}
            autoCapitalize="characters"
          />
        </View>

        {/* Expiry & CVV Row */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Ngày hết hạn (MM/YY)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="12/28"
              placeholderTextColor={theme.colors.text.muted}
              value={expiryDate}
              onChangeText={formatExpiry}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Mã bảo mật CVV</Text>
            <TextInput
              style={styles.textInput}
              placeholder="•••"
              placeholderTextColor={theme.colors.text.muted}
              value={cvv}
              onChangeText={(t) => onChangeCvv(t.replace(/\D/g, '').slice(0, 4))}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />
          </View>
        </View>

        {/* Save Card Toggle */}
        <View style={styles.saveCardRow}>
          <View style={styles.saveCardTextCol}>
            <Text style={styles.saveCardTitle}>Lưu thông tin thẻ an toàn</Text>
            <Text style={styles.saveCardDesc}>Dùng cho các lần đặt lịch sau</Text>
          </View>
          <Switch
            value={saveCard}
            onValueChange={onToggleSaveCard}
            trackColor={{ false: '#CBD5E1', true: theme.colors.primary.navy }}
            thumbColor="white"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing[4],
  },
  cardPreview: {
    backgroundColor: '#0B2A4A',
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: 12,
    ...theme.shadows.md,
  },
  cardPreviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#93C5FD',
    letterSpacing: 1,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    width: 32,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    opacity: 0.85,
  },
  cardNumberText: {
    ...theme.typography.h3,
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 2,
    marginVertical: 4,
  },
  cardPreviewBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardCol: {
    gap: 2,
  },
  cardSmallLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 0.5,
  },
  cardHolderText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  inputsSection: {
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    ...theme.typography.label,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  textInput: {
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing[3],
    height: 44,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  saveCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[3],
    marginTop: 4,
  },
  saveCardTextCol: {
    gap: 2,
  },
  saveCardTitle: {
    ...theme.typography.label,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  saveCardDesc: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
});
