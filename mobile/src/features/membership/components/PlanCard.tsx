import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { formatCurrency } from '@/core/utils/currency';
import type { SubscriptionPlan } from '@/infrastructure/api';

export const formatPlanPeriod = (days: number) =>
  days % 365 === 0 ? `${days / 365} năm` : days % 30 === 0 ? `${days / 30} tháng` : `${days} ngày`;

interface PlanCardProps {
  plan: SubscriptionPlan;
  selected: boolean;
  isCurrent: boolean;
  /** Đang dùng gói khác còn hạn => không chọn được */
  disabled: boolean;
  onPress: () => void;
}

export function PlanCard({ plan, selected, isCurrent, disabled, onPress }: PlanCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[styles.card, selected && styles.cardSelected, disabled && styles.cardDisabled]}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.name}>{plan.name}</Text>
          {isCurrent && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Đang dùng</Text>
            </View>
          )}
        </View>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <Check size={12} color="white" />}
        </View>
      </View>

      <Text style={styles.priceRow}>
        <Text style={styles.price}>{formatCurrency(plan.price)} đ</Text>
        <Text style={styles.period}> / {formatPlanPeriod(plan.durationDays)}</Text>
      </Text>

      {plan.description ? <Text style={styles.description}>{plan.description}</Text> : null}

      {plan.benefits.length > 0 && (
        <View style={styles.benefits}>
          {plan.benefits.map((b) => (
            <View key={b} style={styles.benefitRow}>
              <Check size={14} color={theme.colors.tertiary.default} />
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>
      )}

      {disabled && (
        <Text style={styles.disabledHint}>Chọn được sau khi gói hiện tại hết hạn</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
    padding: theme.spacing[4],
    gap: 6,
  },
  cardSelected: {
    borderColor: theme.colors.primary.navy,
    backgroundColor: theme.colors.surface.subdued,
  },
  cardDisabled: {
    opacity: 0.45,
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
    flexShrink: 1,
  },
  name: {
    ...theme.typography.h4,
    color: theme.colors.primary.navy,
  },
  currentBadge: {
    backgroundColor: theme.colors.semantic.successContainer,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  currentBadgeText: {
    ...theme.typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: theme.colors.primary.navy,
    borderColor: theme.colors.primary.navy,
  },
  priceRow: {
    marginTop: 2,
  },
  price: {
    ...theme.typography.h3,
    color: theme.colors.tertiary.default,
    fontWeight: '800',
  },
  period: {
    ...theme.typography.bodySm,
    color: theme.colors.text.muted,
  },
  description: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
  },
  benefits: {
    gap: 4,
    marginTop: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  benefitText: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  disabledHint: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    fontStyle: 'italic',
  },
});
