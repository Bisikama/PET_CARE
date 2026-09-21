import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Dog,
  MapPin,
  Lock,
  LogOut,
  ChevronRight,
  Briefcase,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function ProfileRoute() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const avatar = user?.avatar_url || user?.avatarUrl;

  return (
    <Screen style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <Image 
                source={require('../../../assets/images/logo.png')} 
                style={styles.logoImage} 
                resizeMode="contain" 
              />
            )}
          </View>
          <Text style={styles.userName}>{user?.full_name || user?.fullName || 'Người Dùng'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
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
            onPress={() => router.push('/(customer)/become-provider')}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <Briefcase size={20} color={theme.colors.primary.navy} />
              </View>
              <Text style={styles.menuTitle}>Trở thành Đối tác</Text>
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

      {/* Logout Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đăng xuất khỏi PetCare?</Text>
            <Text style={styles.modalSubtitle}>Bạn có chắc chắn muốn đăng xuất? Lần tới bạn sẽ cần nhập lại email và mật khẩu.</Text>
            
            <View style={styles.modalUserInfo}>
              <View style={styles.modalAvatarContainer}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImage} />
                ) : (
                  <Image source={require('../../../assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
                )}
              </View>
              <View style={styles.modalUserText}>
                <Text style={styles.modalUserName}>{user?.full_name || user?.fullName || 'Người Dùng'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Dog size={12} color={theme.colors.text.secondary} />
                  <Text style={styles.modalUserStatus}>Hồ sơ được lưu an toàn</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.logoutConfirmBtn} onPress={logout}>
              <LogOut size={20} color="white" />
              <Text style={styles.logoutConfirmText}>Có, Đăng xuất</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutCancelBtn} onPress={() => setShowLogoutModal(false)}>
              <Text style={styles.logoutCancelText}>Hủy, Giữ đăng nhập</Text>
            </TouchableOpacity>
            
            <View style={styles.modalFooter}>
              <Lock size={14} color={theme.colors.text.muted} />
              <Text style={styles.modalFooterText}>Dữ liệu sức khỏe thú cưng được bảo mật an toàn trên đám mây</Text>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[3],
    borderWidth: 2,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  logoImage: {
    width: 50,
    height: 50,
    opacity: 0.9,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[5],
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: theme.radius.xl,
    padding: theme.spacing[6],
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.primary.navy,
    textAlign: 'center',
    marginBottom: theme.spacing[3],
  },
  modalSubtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
    lineHeight: 22,
  },
  modalUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.subdued,
    padding: theme.spacing[4],
    borderRadius: theme.radius.lg,
    width: '100%',
    marginBottom: theme.spacing[6],
  },
  modalAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[4],
    overflow: 'hidden',
  },
  modalUserText: {
    flex: 1,
  },
  modalUserName: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  modalUserStatus: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  logoutConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.semantic.error,
    width: '100%',
    paddingVertical: theme.spacing[4],
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing[3],
    gap: 8,
  },
  logoutConfirmText: {
    ...theme.typography.bodyLg,
    color: 'white',
    fontWeight: '600',
  },
  logoutCancelBtn: {
    width: '100%',
    paddingVertical: theme.spacing[4],
    borderRadius: theme.radius.lg,
    backgroundColor: '#E0E7FF', // Light blue background
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  logoutCancelText: {
    ...theme.typography.bodyLg,
    color: theme.colors.primary.navy,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  modalFooterText: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    flex: 1,
    lineHeight: 18,
  }
});
