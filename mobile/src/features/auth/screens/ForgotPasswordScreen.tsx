import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../core/components/Button';
import { Input } from '../../../core/components/Input';
import { Screen } from '../../../core/components/Screen';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { typography } from '../../../core/theme/typography';
// Assume we have an endpoint for forgot password although API client doesn't export it yet, it exists in contract
import { apiClient } from '../../../infrastructure/api/client';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleReset = async () => {
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Direct call since not added to authApi yet
      await apiClient.post('/auth/forgot-password', { email });
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email }
      });
    } catch (err: any) {
      setError(err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container} >
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.text.primary }]}>Quên mật khẩu</Text>
        <Text style={[typography.bodyLg, { color: colors.text.secondary, marginTop: spacing[1] }]}>
          Nhập email của bạn để nhận mã khôi phục mật khẩu
        </Text>
      </View>

      <View style={styles.form}>
          <>
            <Input
              label="Email"
              placeholder="Nhập email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={error}
            />

            <Button label="Gửi Yêu Cầu"
              onPress={handleReset}
              isLoading={loading}
              style={{ marginTop: spacing[4] }}
            />
          </>
      </View>
      
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={[typography.button, { color: colors.primary.default }]}>Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[6],
  },
  header: {
    marginTop: spacing[10],
    marginBottom: spacing[8],
  },
  form: {
    gap: spacing[4],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[8],
  },
});
