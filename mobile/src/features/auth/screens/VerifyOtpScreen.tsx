import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Screen } from '../../../core/components/Screen';
import { OTPInput } from '../../../core/components/OTPInput';
import { Button } from '../../../core/components/Button';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { typography } from '../../../core/theme/typography';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';

export default function VerifyOtpScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    let timer: NodeJS.Timeout;
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
        setCountdown(60);
      } else {
        setError(res.message || 'Không thể gửi lại mã OTP');
      }
    } catch (err: any) {
      setError(err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Screen style={styles.container} >
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.text.primary }]}>Xác thực OTP</Text>
        <Text style={[typography.bodyLg, { color: colors.text.secondary, marginTop: spacing[1] }]}>
          Mã xác thực đã được gửi đến {email}
        </Text>
      </View>

      <View style={styles.form}>
        <OTPInput
          length={6}
          value={otp}
          onChange={setOtp}
          error={error ? "Lỗi" : undefined}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button label="Xác Nhận"
          onPress={handleVerify}
          isLoading={loading}
          style={{ marginTop: spacing[4], width: '100%' }}
        />

        <View style={styles.resendContainer}>
          <Text style={[typography.bodyMd, { color: colors.text.secondary }]}>Chưa nhận được mã? </Text>
          <TouchableOpacity onPress={handleResend} disabled={countdown > 0 || resendLoading}>
            <Text style={[
              typography.bodyMd, 
              { color: countdown > 0 ? colors.text.secondary : colors.primary.default, fontWeight: 'bold' }
            ]}>
              {resendLoading ? 'Đang gửi...' : (countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã')}
            </Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    gap: spacing[4],
  },
  errorText: {
    ...typography.caption,
    color: colors.semantic.error,
    alignSelf: 'flex-start',
    marginTop: -spacing[2],
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  }
});
