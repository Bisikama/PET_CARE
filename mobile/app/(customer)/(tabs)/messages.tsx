import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';

export default function MessagesRoute() {
  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tin Nhắn</Text>
      </View>
      <View style={styles.centerContent}>
        <View style={styles.iconCircle}>
          <MessageSquare size={36} color={theme.colors.primary.navy} />
        </View>
        <Text style={styles.emptyTitle}>Chưa có cuộc hội thoại nào</Text>
        <Text style={styles.emptySubtitle}>
          Trò chuyện trực tiếp với người chăm sóc và cơ sở spa thú cưng tại đây.
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
