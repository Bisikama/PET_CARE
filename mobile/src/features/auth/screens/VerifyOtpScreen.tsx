import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { Screen } from '../../../core/components/Screen';
import { Input } from '../../../core/components/Input';
import { Button } from '../../../core/components/Button';
import { Icon } from '../../../core/components/Icon';
import { Toast } from '../../../core/components/Toast';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../../core/theme';

export default function VerifyOtpScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(100); // 01:40 -> 100 seconds
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length < 6) {
      setError('Vui lòng nhập đủ 6 số OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await authApi.verifyOtp({ email, otp });
      if (res.success && res.data) {
        await login(res.data.accessToken, res.data.user);
        router.replace('/(customer)/(tabs)/home');
      } else {
        setError(res.message || 'Mã OTP không hợp lệ');
      }
    } catch (err: any) {
      setError(err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResendLoading(true);
    setError('');
    try {
      const res = await authApi.resendOtp({ email });
      if (res.success) {
        setCountdown(100);
        setToastMessage(res.message || 'Mã OTP mới đã được gửi đến email của bạn!');
        setToastVisible(true);
      } else {
        setError(res.message || 'Không thể gửi lại mã OTP');
      }
    } catch (err: any) {
      setError(err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
          <Icon name="mail" size={32} color={theme.colors.primary.navy} />
          <View style={styles.logoBadge}>
            <Icon name="paw-print" size={8} color={theme.colors.secondary.container} />
          </View>
        </View>

        <Text style={styles.title}>Verify Your Account</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={{ color: theme.colors.text.primary, fontWeight: '600' }}>{email || 'your email'}</Text>
        </Text>

        <TouchableOpacity style={styles.changeEmailButton} onPress={() => router.back()}>
          <Text style={styles.changeEmailText}>CHANGE EMAIL</Text>
        </TouchableOpacity>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Input
            placeholder="Enter OTP code"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            error={error}
            textAlign="center"
            style={{ fontSize: 24, letterSpacing: 8, fontWeight: 'bold', color: theme.colors.primary.navy }}
          />

          <View style={styles.expiresBadge}>
            <Icon name="clock" size={14} color={theme.colors.semantic.warning} />
            <Text style={styles.expiresText}>Code expires in {formatTime(countdown)}</Text>
          </View>

          <View style={styles.resendContainer}>
            <Text style={styles.didNotReceiveText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={countdown > 0 || resendLoading}>
              <Text style={[
                styles.resendText, 
                { color: countdown > 0 ? theme.colors.text.muted : theme.colors.primary.navy }
              ]}>
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>

          <Button 
            label="Verify Code"
            onPress={handleVerify}
            isLoading={loading}
            rightIcon="arrow-right"
            style={styles.submitButton}
            textStyle={styles.submitButtonText}
          />
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconBox}>
            <Icon name="shield-check" size={20} color={theme.colors.semantic.success} />
          </View>
          <View style={styles.infoBannerText}>
            <Text style={styles.infoBannerTitle}>PetCare SAFETY FIRST</Text>
            <Text style={styles.infoBannerSub}>Protecting your pets and bookings with advanced verification.</Text>
          </View>
        </View>

        <View style={styles.secureFooter}>
          <Icon name="lock" size={14} color={theme.colors.text.muted} />
          <Text style={styles.secureFooterText}>Secured with 256-bit encryption • PetCare Safety</Text>
        </View>
      </View>
      
      <Toast 
        visible={toastVisible}
        message={toastMessage}
        variant="success"
        icon="check-circle"
        onHide={() => setToastVisible(false)}
      />
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
    marginBottom: theme.spacing[4],
  },
  changeEmailButton: {
    backgroundColor: theme.colors.surface.containerHigh,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: 20,
    marginBottom: theme.spacing[6],
  },
  changeEmailText: {
    ...theme.typography.caption,
    color: theme.colors.primary.navy,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  formCard: {
    width: '100%',
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[5],
    ...theme.shadows.sm,
    marginBottom: theme.spacing[6],
    alignItems: 'center',
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.semantic.error,
    alignSelf: 'flex-start',
    marginTop: -theme.spacing[2],
  },
  expiresBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.semantic.warningContainer,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: 16,
    marginTop: theme.spacing[4],
    gap: 4,
  },
  expiresText: {
    ...theme.typography.caption,
    color: theme.colors.semantic.warning,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  didNotReceiveText: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
  },
  resendText: {
    ...theme.typography.bodyMd,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: theme.colors.secondary.container,
    borderRadius: theme.radius.md,
    width: '100%',
  },
  submitButtonText: {
    color: theme.colors.text.primary,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.containerHigh,
    padding: theme.spacing[4],
    borderRadius: theme.radius.lg,
    width: '100%',
    marginBottom: theme.spacing[6],
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
  },
  infoBannerText: {
    flex: 1,
  },
  infoBannerTitle: {
    ...theme.typography.caption,
    color: theme.colors.primary.navy,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoBannerSub: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  secureFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginTop: theme.spacing[6],
  },
  secureFooterText: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
  }
});
