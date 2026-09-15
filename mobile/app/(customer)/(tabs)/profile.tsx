import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Dog,
  MapPin,
  Lock,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function ProfileRoute() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <Screen style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <User size={36} color={theme.colors.primary.navy} />
          </View>
          <Text style={styles.userName}>{user?.full_name || 'Sarah Nguyen'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'customer@petcare.com'}</Text>
        </View>

        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/(customer)/pets')}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <Dog size={20} color={theme.colors.primary.navy} />
              </View>
              <Text style={styles.menuTitle}>Hồ sơ thú cưng</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.text.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/(customer)/addresses')}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <MapPin size={20} color={theme.colors.primary.navy} />
              </View>
              <Text style={styles.menuTitle}>Địa chỉ giao nhận</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.text.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/(customer)/change-password')}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <Lock size={20} color={theme.colors.primary.navy} />
              </View>
              <Text style={styles.menuTitle}>Đổi mật khẩu</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.text.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, styles.logoutIconBox]}>
                <LogOut size={20} color={theme.colors.semantic.error} />
              </View>
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  container: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[3],
  },
  userName: {
    ...theme.typography.h3,
    color: theme.colors.primary.navy,
    fontWeight: '700',
  },
  userEmail: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  menuGroup: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing[1],
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subdued,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.subdued,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutIconBox: {
    backgroundColor: theme.colors.semantic.errorContainer,
  },
  logoutText: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.semantic.error,
    fontWeight: '600',
  },
});
