import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../core/components/Button';
import { Input } from '../../../core/components/Input';
import { Screen } from '../../../core/components/Screen';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { typography } from '../../../core/theme/typography';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        await login(res.data.accessToken, res.data.user);
        // _layout handles redirect based on AuthContext state change, 
        // but can safely just let it happen.
      } else {
        setError(res.message || 'Đăng nhập thất bại');
      }
    } catch (err: any) {
      setError(err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // This is a placeholder for actual Google SDK integration.
    // In a real app, you would use @react-native-google-signin/google-signin
    // to get the idToken and then call authApi.googleLogin({ idToken })
    alert("Tính năng Đăng nhập Google đang được phát triển.");
  };

  return (
    <Screen style={styles.container} >
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.text.primary }]}>Chào mừng trở lại</Text>
        <Text style={[typography.bodyLg, { color: colors.text.secondary, marginTop: spacing[1] }]}>
          Đăng nhập để tiếp tục chăm sóc thú cưng của bạn
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Email"
          placeholder="Nhập email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          error={error ? ' ' : undefined} 
        />
        
        <Input
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={error}
        />

        <TouchableOpacity 
          style={styles.forgotPassword} 
          onPress={() => router.push('/(auth)/forgot-password')}
        >
          <Text style={[typography.button, { color: colors.primary.default }]}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <Button label="Đăng Nhập"
          onPress={handleLogin}
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
        <Text style={[typography.bodyMd, { color: colors.text.secondary }]}>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={[typography.button, { color: colors.primary.default }]}>Đăng ký ngay</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing[2],
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
