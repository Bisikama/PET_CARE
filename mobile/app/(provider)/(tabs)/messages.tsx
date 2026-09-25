import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';

export default function ProviderMessagesRoute() {
  return (
    <Screen style={styles.container} backgroundColor="#F8F9FF">
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <MessageSquare size={32} color="#0B2A4A" />
        </View>
        <Text style={styles.title}>Tin nhắn khách hàng</Text>
        <Text style={styles.subtitle}>
          Kênh trao đổi trực tiếp với chủ nuôi khi đơn hẹn được chấp nhận
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCE9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2A4A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#74777F',
    textAlign: 'center',
    maxWidth: 260,
  },
});
