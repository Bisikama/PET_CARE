import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalendarDays } from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';

export default function BookingsRoute() {
  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lịch Hẹn & Đặt Chỗ</Text>
      </View>
      <View style={styles.centerContent}>
        <View style={styles.iconCircle}>
          <CalendarDays size={36} color={theme.colors.primary.navy} />
        </View>
        <Text style={styles.emptyTitle}>Chưa có lịch hẹn nào</Text>
        <Text style={styles.emptySubtitle}>
          Khi bạn đặt lịch chăm sóc cho thú cưng, thông tin chi tiết sẽ xuất hiện tại đây.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
  },
  header: {
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[3],
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.primary.navy,
    fontWeight: '700',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[6],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[4],
  },
  emptyTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    fontWeight: '700',
    marginBottom: theme.spacing[2],
  },
  emptySubtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
