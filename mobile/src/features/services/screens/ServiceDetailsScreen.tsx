import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '../../../core/components/Screen';
import { ErrorState } from '../../../core/components/ErrorState';
import { servicesApi, ServiceCategory, PricingRule, ChecklistTemplate } from '../../../infrastructure/api/services.api';
import { theme } from '../../../core/theme';
import { ChevronLeft, CheckCircle2, FileText, ListChecks, DollarSign, Clock, Tag } from 'lucide-react-native';
import { formatCurrency } from '../../../core/utils/currency';

export default function ServiceDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [service, setService] = useState<ServiceCategory | null>(null);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [serviceData, rulesData, checklistData] = await Promise.all([
        servicesApi.getServiceDetails(id as string),
        servicesApi.getPricingRules(id as string),
        servicesApi.getChecklistTemplates(id as string),
      ]);
      setService(serviceData);
      setPricingRules(rulesData);
      setChecklists(checklistData);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải thông tin dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Screen style={styles.centered} backgroundColor={theme.colors.surface.lowest}>
        <ActivityIndicator size="large" color={theme.colors.primary.default} />
      </Screen>
    );
  }

  if (error || !service) {
    return (
      <Screen style={styles.centered} backgroundColor={theme.colors.surface.lowest}>
        <ErrorState title="Lỗi" description={error || 'Không tìm thấy dịch vụ'} onRetry={fetchData} />
      </Screen>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Thông tin dịch vụ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title Area */}
        <View style={styles.titleSection}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <View style={styles.statusBadge}>
            <CheckCircle2 size={12} color={theme.colors.semantic.success} />
            <Text style={styles.statusText}>Hoạt động</Text>
          </View>
        </View>

        {/* Info Cards Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <DollarSign size={14} color={theme.colors.semantic.success} />
              <Text style={styles.infoLabel}>GIÁ GỐC TỪ</Text>
            </View>
            <Text style={[styles.infoValue, { color: theme.colors.semantic.success }]}>
              {formatCurrency(service.basePrice)} đ
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Clock size={14} color={theme.colors.semantic.warning} />
              <Text style={styles.infoLabel}>THỜI LƯỢNG</Text>
            </View>
            <Text style={styles.infoValue}>{service.durationMinutes} phút</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Tag size={14} color={theme.colors.primary.default} />
              <Text style={styles.infoLabel}>DANH MỤC</Text>
            </View>
            <Text style={[styles.infoValue, { color: theme.colors.primary.default }]}>
              {service.category || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={18} color={theme.colors.text.secondary} />
            <Text style={styles.sectionTitle}>MÔ TẢ CHI TIẾT</Text>
          </View>
          <View style={styles.sectionBody}>
            <Text style={styles.bodyText}>
              {service.description || 'Chưa có thông tin mô tả chi tiết cho dịch vụ này.'}
            </Text>
          </View>
        </View>

        {/* Pricing Rules Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={18} color={theme.colors.semantic.warning} />
            <Text style={styles.sectionTitle}>BẢNG GIÁ THEO LOÀI & CÂN NẶNG ({pricingRules.length})</Text>
          </View>
          <View style={styles.sectionBody}>
            {pricingRules.length === 0 ? (
              <Text style={styles.bodyText}>Chưa có cấu hình bảng giá riêng theo cân nặng. Dịch vụ áp dụng giá cơ bản chuẩn.</Text>
            ) : (
              pricingRules.map((rule, idx) => (
                <View key={rule.id} style={[styles.ruleItem, idx > 0 && styles.ruleSeparator]}>
                  <Text style={styles.ruleName}>
                    {rule.petSpecies} {rule.minWeight ? `(${rule.minWeight}kg - ${rule.maxWeight}kg)` : ''}
                  </Text>
                  <Text style={styles.rulePrice}>{formatCurrency(rule.price)} đ</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Checklist Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ListChecks size={18} color={theme.colors.primary.default} />
            <Text style={styles.sectionTitle}>DANH SÁCH KIỂM TRA THỰC ĐỊA ({checklists.length})</Text>
          </View>
          <View style={styles.sectionBody}>
            {checklists.length === 0 ? (
              <Text style={styles.bodyText}>Chưa có quy trình checklist chuẩn cho gói dịch vụ này.</Text>
            ) : (
              checklists.map((check, idx) => (
                <View key={check.id} style={styles.checkItem}>
                  <Text style={styles.checkIndex}>{idx + 1}.</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.checkTitle}>{check.title} {check.isRequired && <Text style={styles.requiredMark}>*</Text>}</Text>
                    {check.description && <Text style={styles.checkDesc}>{check.description}</Text>}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={() => router.push(`/(customer)/service/${service.id}/providers`)}
        >
          <Text style={styles.actionButtonText}>TÌM ĐỐI TÁC CUNG CẤP DỊCH VỤ NÀY</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface.lowest,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subdued,
    backgroundColor: theme.colors.surface.lowest,
  },
  backBtn: {
    padding: theme.spacing[1],
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    padding: theme.spacing[5],
    paddingBottom: 100, // Space for footer
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  serviceName: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    gap: 4,
  },
  statusText: {
    ...theme.typography.label,
    color: theme.colors.semantic.success,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  infoCard: {
    flex: 1,
    backgroundColor: theme.colors.surface.subdued,
    padding: theme.spacing[3],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(11, 42, 74, 0.05)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  infoLabel: {
    ...theme.typography.label,
    fontSize: 10,
    color: theme.colors.text.secondary,
    fontWeight: '700',
  },
  infoValue: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },
  section: {
    marginBottom: theme.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  sectionTitle: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.text.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionBody: {
    backgroundColor: theme.colors.surface.subdued,
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(11, 42, 74, 0.05)',
  },
  bodyText: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingVertical: theme.spacing[2],
  },
  ruleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
  },
  ruleSeparator: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subdued,
  },
  ruleName: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.primary,
  },
  rulePrice: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.primary.default,
  },
  checkItem: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[3],
  },
  checkIndex: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.text.secondary,
  },
  checkTitle: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.text.primary,
  },
  requiredMark: {
    color: theme.colors.semantic.error,
  },
  checkDesc: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface.lowest,
    padding: theme.spacing[5],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subdued,
    ...theme.shadows.md,
  },
  actionButton: {
    backgroundColor: theme.colors.primary.navy,
    paddingVertical: theme.spacing[4],
    borderRadius: theme.radius.full,
    alignItems: 'center',
  },
  actionButtonText: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.text.inverse,
    fontWeight: '700',
  },
});
