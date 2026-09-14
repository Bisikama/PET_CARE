import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Screen } from '../../../core/components/Screen';
import { Input } from '../../../core/components/Input';
import { Button } from '../../../core/components/Button';
import { authApi } from '../api/authApi';
import { useRouter } from 'expo-router';
import { typography } from '../../../core/theme/typography';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !fullName || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await authApi.register({ email, full_name: fullName, password });
      if (res.success) {
        // Go to verify OTP screen
        router.push({ pathname: '/(auth)/verify-otp', params: { email } });
      } else {
        setError(res.message || 'Đăng ký thất bại');
      }
    } catch (err: any) {
      setError(err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    alert("Tính năng Đăng ký bằng Google đang được phát triển.");
  };

  return (
    <Screen style={styles.container} >
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.text.primary }]}>Tạo tài khoản</Text>
        <Text style={[typography.bodyLg, { color: colors.text.secondary, marginTop: spacing[1] }]}>
          Trở thành thành viên của cộng đồng PetCare
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Họ và tên"
          placeholder="Nhập họ và tên"
          value={fullName}
          onChangeText={setFullName}
        />

        <Input
          label="Email"
          placeholder="Nhập email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        
        <Input
          label="Mật khẩu"
          placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={error}
        />

        <Button label="Đăng Ký"
          onPress={handleRegister}
          isLoading={loading}
          style={{ marginTop: spacing[4] }}
        />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>Hoặc</Text>
          <View style={styles.line} />
        </View>

        <Button label="Tiếp tục với Google"
          onPress={handleGoogleLogin}
          variant="outline"
          style={{ marginTop: spacing[2] }}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[typography.bodyMd, { color: colors.text.secondary }]}>Đã có tài khoản? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={[typography.button, { color: colors.primary.default }]}>Đăng nhập</Text>
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[4],
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.default,
  },
  dividerText: {
    ...typography.caption,
    color: colors.text.secondary,
    paddingHorizontal: spacing[4],
  }
});
