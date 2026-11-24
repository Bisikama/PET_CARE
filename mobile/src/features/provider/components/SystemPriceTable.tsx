import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Info } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { formatCurrency } from '@/core/utils/currency';
import { servicesApi, type PricingRule } from '@/infrastructure/api/services.api';

interface SystemPriceTableProps {
  serviceId: string;
  petSpecies: string;
  /** Giá gốc của gói — áp dụng khi gói chưa có bảng giá theo cân nặng */
  fallbackPrice?: number;
}

const kg = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 2 });

function weightLabel(rule: PricingRule): string {
  const min = rule.minWeight ?? 0;
  const max = rule.maxWeight ?? null;
  if (max === null) return `Từ ${kg(min)} kg`;
  if (min <= 0) return `Dưới ${kg(Math.ceil(max))} kg`;
  if (!Number.isInteger(min)) return `Trên ${kg(Math.floor(min))} – ${kg(max)} kg`;
  return `${kg(min)} – ${kg(max)} kg`;
}

/** Bảng giá do PetCare niêm yết (chỉ xem) — đối tác không tự đặt giá. */
export function SystemPriceTable({ serviceId, petSpecies, fallbackPrice }: SystemPriceTableProps) {
  const [rules, setRules] = useState<PricingRule[] | null>(null);

  useEffect(() => {
    if (!serviceId) return;
    let cancelled = false;
    setRules(null);
    servicesApi.getPricingRules(serviceId).then((list) => {
      if (!cancelled) setRules(list.filter((r) => r.isActive !== false));
    });
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  if (!serviceId) return null;
  if (rules === null) {
    return <ActivityIndicator color={theme.colors.primary.navy} style={styles.loading} />;
  }

  const speciesRules = rules
    .filter((r) => r.petSpecies.toLowerCase() === petSpecies.toLowerCase())
    .sort((a, b) => (a.minWeight ?? 0) - (b.minWeight ?? 0));
  const speciesLabel = petSpecies === 'Cat' ? 'mèo' : 'chó';

  return (
    <View style={styles.card}>
      <View style={styles.noteRow}>
        <Info size={16} color={theme.colors.tertiary.default} />
        <Text style={styles.noteText}>
          {rules.length > 0
            ? 'Giá do PetCare niêm yết theo cân nặng — bạn không cần nhập giá. Khách thanh toán theo bảng dưới (chưa gồm phí di chuyển).'
            : `Gói này chưa có bảng giá theo cân nặng. Đơn sẽ áp dụng giá gốc${
                fallbackPrice !== undefined ? ` ${formatCurrency(fallbackPrice)} đ` : ''
              }.`}
        </Text>
      </View>

      {rules.length > 0 &&
        (speciesRules.length > 0 ? (
          <View>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.headerText, styles.flex1]}>Cân nặng ({speciesLabel})</Text>
              <Text style={styles.headerText}>Giá</Text>
            </View>
            {speciesRules.map((r) => (
              <View key={r.id} style={styles.row}>
                <Text style={[styles.weight, styles.flex1]}>{weightLabel(r)}</Text>
                <Text style={styles.price}>{formatCurrency(r.price)} đ</Text>
              </View>
            ))}
            <View style={styles.row}>
              <Text style={[styles.muted, styles.flex1]}>Ngoài các mức trên</Text>
              <Text style={styles.muted}>Báo giá riêng</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.warning}>
            Gói này chưa có giá niêm yết cho {speciesLabel} — khách sẽ không đặt online được.
          </Text>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginVertical: theme.spacing[3],
  },
  card: {
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[3],
    gap: theme.spacing[2],
  },
  noteRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  noteText: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  headerRow: {
    borderTopWidth: 0,
  },
  headerText: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  flex1: {
    flex: 1,
  },
  weight: {
    ...theme.typography.bodySm,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  price: {
    ...theme.typography.bodySm,
    color: theme.colors.primary.navy,
    fontWeight: '700',
  },
  muted: {
    ...theme.typography.bodySm,
    color: theme.colors.text.muted,
  },
  warning: {
    ...theme.typography.bodySm,
    color: '#B45309',
    fontWeight: '600',
  },
});
