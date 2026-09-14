import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../core/components/Button';
import { Input } from '../../../core/components/Input';
import { Screen } from '../../../core/components/Screen';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { typography } from '../../../core/theme/typography';
import { authApi } from '../api/authApi';

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();

  const handleReset = async () => {
    if (!otp || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    if (password.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await authApi.resetPassword({ email, token: otp, password, confirmPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.text.primary }]}>Đặt lại mật khẩu</Text>
        <Text style={[typography.bodyLg, { color: colors.text.secondary, marginTop: spacing[1] }]}>
          Mã xác thực đã được gửi đến {email}
        </Text>
      </View>

      <View style={styles.form}>
        {!success ? (
          <>
            <Input
              label="Mã OTP"
              placeholder="Nhập mã OTP (6 số)"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
            />
            
            <Input
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Input
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={error}
            />

            <Button label="Lưu Mật Khẩu"
              onPress={handleReset}
              isLoading={loading}
              style={{ marginTop: spacing[4] }}
            />
          </>
        ) : (
          <View style={styles.successBox}>
            <Text style={[typography.h3, { color: colors.semantic.success, marginBottom: spacing[2] }]}>Thành công!</Text>
            <Text style={[typography.bodyMd, { textAlign: 'center', color: colors.text.secondary }]}>
              Mật khẩu của bạn đã được đặt lại thành công.
            </Text>
            <Button label="Đăng nhập ngay"
              onPress={() => router.push('/(auth)/login')}
              style={{ marginTop: spacing[8], width: '100%' }}
            />
          </View>
        )}
      </View>
      
      {!success && (
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={[typography.button, { color: colors.primary.default }]}>Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </View>
      )}
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
  successBox: {
    alignItems: 'center',
    padding: spacing[6],
    backgroundColor: colors.semantic.successContainer,
    borderRadius: spacing[4],
    marginTop: spacing[8],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[8],
  },
});
