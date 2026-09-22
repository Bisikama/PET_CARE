import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useProviderStore } from '../../../src/features/provider/store/useProviderStore';
import BecomeProviderIntroScreen from '../../../src/features/provider/screens/BecomeProviderIntroScreen';
import { theme } from '../../../src/core/theme';

export default function BecomeProviderRoutingScreen() {
  const router = useRouter();
  const { profile, isLoading, fetchProfile } = useProviderStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!profile) {
      // Trạng thái 1: Chưa có hồ sơ (Lỗi 404)
      // Giữ nguyên ở màn hình Intro
      return;
    }

    if (profile.status === 'APPROVED') {
      // Trạng thái 5: Đã trở thành Đối tác
      router.replace('/(provider)');
      return;
    }

    if (profile.status === 'DRAFT') {
      // Trạng thái 2, 3, 4: Đang xử lý đăng ký (KYC null, PENDING, APPROVED)
      // Điều hướng vào màn hình Form. Màn hình Form sẽ tự check kycStatus
      // để mở/khóa các step tương ứng.
      router.replace('/(customer)/become-provider/form');
      return;
    }

  }, [profile, isLoading, router]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  if (!profile) {
    return <BecomeProviderIntroScreen />;
  }

  // Fallback loading while redirecting
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={theme.colors.primary.main} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  }
});
