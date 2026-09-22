import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Image } from 'react-native';
import { Screen } from '../../../core/components/Screen';
import { Input } from '../../../core/components/Input';
import { Button } from '../../../core/components/Button';
import { Icon } from '../../../core/components/Icon';
import { authApi } from '../api/authApi';
import { useRouter } from 'expo-router';
import { typography } from '../../../core/theme/typography';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { theme } from '../../../core/theme';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !fullName || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (!agreeTerms) {
      setError('Bạn cần đồng ý với Điều khoản Dịch vụ');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await authApi.register({ email, fullName, password });
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
  // Check password strength
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return (
    <Screen style={styles.container} preset="scroll">
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Icon name="chevron-left" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          <Image source={require('../../../../assets/images/logo.png')} style={styles.headerLogo} resizeMode="contain" />
          <Text style={[theme.typography.h3, { color: theme.colors.text.primary }]}>PetCare</Text>
        </View>

        <TouchableOpacity style={styles.headerIconProfile}>
          <Icon name="user" size={20} color={theme.colors.surface.default} />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* Center Logo Box */}
        <View style={styles.centerLogoBox}>
          <Icon name="heart" size={32} color={theme.colors.primary.navy} />
          <View style={styles.logoBadge}>
            <Icon name="paw-print" size={8} color={theme.colors.secondary.container} />
          </View>
        </View>

        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>
          Join and book trusted, loving care for your fur{'\n'}family in minutes.
        </Text>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <Text style={styles.inputOptional}>Required</Text>
          </View>
          <Input
            placeholder="Sarah Nguyen"
            value={fullName}
            onChangeText={setFullName}
            leftIcon="user"
          />

          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <Text style={styles.inputOptional}>Required</Text>
          </View>
          <Input
            placeholder="sarah.nguyen@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            leftIcon="mail"
          />



          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.secureBadge}>
              <Text style={styles.secureBadgeText}>Secure</Text>
            </View>
          </View>
          <Input
            placeholder="••••••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon="lock"
            containerStyle={{ marginBottom: theme.spacing[2] }}
          />

          {/* Password Strength */}
          <View style={styles.passwordStrengthBox}>
            <View style={styles.strengthBars}>
              <View style={[styles.strengthBar, hasMinLength ? styles.strengthBarActive : null]} />
              <View style={[styles.strengthBar, hasUppercase ? styles.strengthBarActive : null]} />
              <View style={[styles.strengthBar, hasNumber ? styles.strengthBarActive : null]} />
            </View>
            <View style={styles.strengthHeader}>
              <Text style={styles.strengthTitle}>Strength rating</Text>
              <Text style={styles.strengthStatus}>
                <Icon name="circle" size={8} color={theme.colors.semantic.success} /> Strong password
              </Text>
            </View>
            
            <View style={styles.strengthChecklist}>
              <View style={styles.checkItem}>
                <Icon name="check-circle-2" size={16} color={hasMinLength ? theme.colors.semantic.success : theme.colors.text.muted} />
                <Text style={styles.checkText}>At least 8 characters</Text>
              </View>
              <View style={styles.checkItem}>
                <Icon name="check-circle-2" size={16} color={hasUppercase ? theme.colors.semantic.success : theme.colors.text.muted} />
                <Text style={styles.checkText}>One uppercase letter included</Text>
              </View>
              <View style={styles.checkItem}>
                <Icon name="check-circle-2" size={16} color={hasNumber ? theme.colors.semantic.success : theme.colors.text.muted} />
                <Text style={styles.checkText}>At least one number (0-9)</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            {password === confirmPassword && confirmPassword.length > 0 && (
              <View style={styles.matchBadge}>
                <Icon name="check" size={12} color={theme.colors.semantic.success} />
                <Text style={styles.matchBadgeText}>Match</Text>
              </View>
            )}
          </View>
          <Input
            placeholder="••••••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            leftIcon="shield-check"
            error={error}
          />

          <TouchableOpacity 
            style={styles.checkboxRow} 
            onPress={() => setAgreeTerms(!agreeTerms)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
              {agreeTerms && <Icon name="check" size={12} color={theme.colors.surface.default} />}
            </View>
            <Text style={styles.agreeText}>
              I agree to the <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
            </Text>
          </TouchableOpacity>

          <Button 
            label="Create Account"
            onPress={handleRegister}
            isLoading={loading}
            rightIcon="arrow-right"
            style={styles.submitButton}
            textStyle={styles.submitButtonText}
          />
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconBox}>
            <Icon name="shield-check" size={20} color={theme.colors.primary.navy} />
          </View>
          <View style={styles.infoBannerText}>
            <Text style={styles.infoBannerTitle}>100% Verified Sitters</Text>
            <Text style={styles.infoBannerSub}>Background checked & insured</Text>
          </View>
          <View style={styles.ratingBox}>
            <Icon name="star" size={14} color={theme.colors.secondary.container} />
            <Text style={styles.ratingText}>4.9/5</Text>
          </View>
        </View>

        <View style={styles.footerLinkContainer}>
          <Text style={styles.noAccountText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginText}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
    width: 64,
    height: 64,
    backgroundColor: theme.colors.surface.containerHigh,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[4],
    position: 'relative',
  },
  logoBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.secondary.container,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background.default,
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
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  inputLabel: {
    ...theme.typography.label,
    color: theme.colors.text.primary,
  },
  inputOptional: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
  },
  secureBadge: {
    backgroundColor: theme.colors.semantic.successContainer,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  secureBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.primary.navy,
    fontWeight: 'bold',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.semantic.success,
    fontWeight: 'bold',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.subdued,
    height: theme.dimensions.inputHeight,
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.md,
    gap: theme.spacing[2],
  },
  flagEmoji: {
    fontSize: 16,
  },
  countryCodeText: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },
  passwordStrengthBox: {
    backgroundColor: theme.colors.background.default,
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing[6],
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: theme.spacing[3],
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.border.default,
    borderRadius: 2,
  },
  strengthBarActive: {
    backgroundColor: theme.colors.semantic.success,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
  },
  strengthTitle: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  strengthStatus: {
    ...theme.typography.caption,
    color: theme.colors.semantic.success,
    fontWeight: '600',
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthChecklist: {
    gap: theme.spacing[2],
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  checkText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6],
    marginTop: theme.spacing[2],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.primary.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: theme.colors.primary.navy,
  },
  agreeText: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  linkText: {
    color: theme.colors.primary.navy,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: theme.colors.secondary.container,
    borderRadius: theme.radius.md,
  },
  submitButtonText: {
    color: theme.colors.text.primary,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.subdued,
    padding: theme.spacing[4],
    borderRadius: theme.radius.lg,
    width: '100%',
    marginBottom: theme.spacing[6],
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.semantic.successContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
  },
  infoBannerText: {
    flex: 1,
  },
  infoBannerTitle: {
    ...theme.typography.label,
    color: theme.colors.text.primary,
  },
  infoBannerSub: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...theme.typography.label,
    color: theme.colors.secondary.default,
  },
  footerLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noAccountText: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
  },
  loginText: {
    ...theme.typography.label,
    color: theme.colors.primary.navy,
  },
});
