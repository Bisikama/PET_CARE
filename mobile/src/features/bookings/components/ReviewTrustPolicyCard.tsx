import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, CheckCircle2, RotateCcw, HeartHandshake } from 'lucide-react-native';
import { theme } from '@/core/theme';

export function ReviewTrustPolicyCard() {
  const policies = [
    {
      icon: <RotateCcw size={16} color="#059669" />,
      title: 'Hủy lịch linh hoạt miễn phí',
      desc: 'Hủy hoặc đổi lịch hẹn không mất phí trước 24 giờ so với giờ hẹn.',
    },
    {
      icon: <ShieldCheck size={16} color="#2563EB" />,
      title: 'Bảo hiểm an toàn thú cưng PetCare Trust',
      desc: 'Bảo vệ toàn diện sức khỏe thú cưng với mức hỗ trợ y tế lên tới 10.000.000đ.',
    },
    {
      icon: <HeartHandshake size={16} color="#D97706" />,
      title: '100% Chuyên viên được kiểm định',
      desc: 'Được cấp chứng chỉ hành nghề và đạt đánh giá trên 4.8 sao từ cộng đồng.',
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <ShieldCheck size={18} color={theme.colors.secondary.onContainer} />
        <Text style={styles.headerTitle}>Cam kết dịch vụ & An tâm thú cưng</Text>
      </View>

      <View style={styles.list}>
        {policies.map((p, idx) => (
          <View key={idx} style={styles.policyItem}>
            <View style={styles.iconCircle}>{p.icon}</View>
            <View style={styles.textCol}>
              <Text style={styles.policyTitle}>{p.title}</Text>
              <Text style={styles.policyDesc}>{p.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: theme.spacing[3],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  list: {
    gap: theme.spacing[3],
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 2,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  policyTitle: {
    ...theme.typography.label,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  policyDesc: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
    lineHeight: 16,
  },
});
