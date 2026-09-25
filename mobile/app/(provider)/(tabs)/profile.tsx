import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UserCheck, LogOut } from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function ProviderProfileRoute() {
  const { user, logout } = useAuth();

  return (
    <Screen style={styles.container} backgroundColor="#F8F9FF">
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <UserCheck size={36} color="#0B2A4A" />
        </View>
        <Text style={styles.name}>{user?.full_name || 'Đối tác PetCare'}</Text>
        <Text style={styles.roleTag}>ĐỐI TÁC DỊCH VỤ</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => logout()}
          activeOpacity={0.8}
        >
          <LogOut size={18} color="#BA1A1A" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
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
    width: '100%',
    maxWidth: 320,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCE9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2A4A',
    marginBottom: 4,
  },
  roleTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5D4200',
    backgroundColor: '#FFDEA5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: '#74777F',
    marginBottom: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFDAD6',
    width: '100%',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#BA1A1A',
  },
});
