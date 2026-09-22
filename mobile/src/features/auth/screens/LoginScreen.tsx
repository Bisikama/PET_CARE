import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Button } from '../../../core/components/Button';
import { Input } from '../../../core/components/Input';
import { Screen } from '../../../core/components/Screen';
import { Icon } from '../../../core/components/Icon';
import { theme } from '../../../core/theme';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
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
        router.replace('/(customer)/(tabs)/home');
      } else {
        setError(res.message || 'Đăng nhập thất bại');
      }
    } catch (err: any) {
      if (err?.originalMessage === 'EMAIL_CONFIRMATION_PENDING') {
        // Redirect to OTP verification screen if not verified
        router.push({ pathname: '/(auth)/verify-otp', params: { email } });
      } else {
        setError(err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Screen style={styles.container} preset="scroll">
      {/* Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerIcon} />
        
        <View style={styles.headerTitle}>
          <Image source={require('../../../../assets/images/logo.png')} style={styles.headerLogo} resizeMode="contain" />
          <Text style={[theme.typography.h3, { color: theme.colors.text.primary }]}>PetCare</Text>
        </View>

        <TouchableOpacity style={styles.headerIconProfile}>
          <Icon name="user" size={20} color={theme.colors.surface.default} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Center Logo Box */}
        <View style={styles.centerLogoBox}>
          <Image source={require('../../../../assets/images/logo.png')} style={styles.mainLogo} resizeMode="contain" />
        </View>

        {/* Badge */}
        <View style={styles.badge}>
          <Icon name="paw-print" size={14} color={theme.colors.secondary.container} />
          <Text style={styles.badgeText}>VERIFIED PET CARE</Text>
        </View>

        {/* Titles */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to continue caring for your beloved{'\n'}companions
        </Text>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Input
            label="Email"
            placeholder="abc@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            leftIcon="at-sign"
            error={error ? ' ' : undefined}
          />
          
          <Input
            label="Password"
            placeholder="••••••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon="lock"
            error={error}
          />

          <View style={styles.formOptions}>
            <TouchableOpacity 
              style={styles.checkboxRow} 
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Icon name="check" size={12} color={theme.colors.surface.default} />}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
          </View>

          <Button 
            label="Sign In"
            onPress={handleLogin}
            isLoading={loading}
            rightIcon="arrow-right"
            style={styles.signInButton}
            textStyle={styles.signInButtonText}
          />
        </View>

        {/* Footer info */}
        <View style={styles.encryptionInfo}>
          <Icon name="shield-check" size={16} color={theme.colors.semantic.success} />
          <Text style={styles.encryptionText}>256-bit encrypted healthcare & vet records</Text>
        </View>

        <View style={styles.registerLinkContainer}>
          <Text style={styles.noAccountText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Banner */}
        <TouchableOpacity style={styles.providerBanner} activeOpacity={0.8}>
          <View style={styles.providerIconBox}>
            <Icon name="briefcase" size={20} color={theme.colors.secondary.onContainer} />
          </View>
          <View style={styles.providerBannerText}>
            <Text style={styles.providerBannerTitle}>Become a Verified Provider</Text>
            <Text style={styles.providerBannerSub}>Join our certified care network</Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
  },
  headerIcon: {
    padding: theme.spacing[2],
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  headerLogo: {
    width: 24,
    height: 24,
  },
  headerIconProfile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[6],
    paddingBottom: theme.spacing[8],
    alignItems: 'center',
  },
  centerLogoBox: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[4],
  },
  mainLogo: {
    width: 50,
    height: 50,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.containerHigh,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  badgeText: {
    ...theme.typography.label,
    color: theme.colors.primary.navy,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primary.navy,
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[8],
  },
  formCard: {
    width: '100%',
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[5],
    ...theme.shadows.sm,
    marginBottom: theme.spacing[6],
  },
  formOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -theme.spacing[2],
    marginBottom: theme.spacing[6],
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.primary.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: theme.colors.primary.navy,
  },
  rememberText: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
  },
  signInButton: {
    backgroundColor: theme.colors.secondary.container,
    borderRadius: theme.radius.md,
  },
  signInButtonText: {
    color: theme.colors.text.primary,
  },
  encryptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[6],
  },
  encryptionText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  },
  noAccountText: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
  },
  registerText: {
    ...theme.typography.label,
    color: theme.colors.primary.navy,
  },
  providerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.container,
    padding: theme.spacing[4],
    borderRadius: theme.radius.lg,
    width: '100%',
  },
  providerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary.container,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
  },
  providerBannerText: {
    flex: 1,
  },
  providerBannerTitle: {
    ...theme.typography.label,
    color: theme.colors.text.primary,
  },
  providerBannerSub: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
});
