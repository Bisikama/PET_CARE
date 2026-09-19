import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Button } from '../../../core/components/Button';
import { Input } from '../../../core/components/Input';
import { Screen } from '../../../core/components/Screen';
import { Icon } from '../../../core/components/Icon';
import { theme } from '../../../core/theme';
import { authApi } from '../api/authApi';

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
      await authApi.forgotPassword({ email });
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
          <Icon name="shield" size={32} color={theme.colors.primary.navy} />
          <View style={styles.innerPaw}>
            <Icon name="paw-print" size={14} color={theme.colors.primary.navy} />
          </View>
          <View style={styles.logoBadge}>
            <Icon name="lock" size={8} color={theme.colors.primary.navy} />
          </View>
        </View>

        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          No worries! Enter the email address associated with your account and we'll send you a 6-digit verification code.
        </Text>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>Registered Email</Text>
            <Text style={styles.stepText}>Step 1 of 2</Text>
          </View>

          <Input
            placeholder="sarah.nguyen@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            leftIcon="mail"
            error={error}
          />

          <View style={styles.secureBox}>
            <View style={styles.secureIconBox}>
              <Icon name="shield-check" size={16} color={theme.colors.primary.navy} />
            </View>
            <View style={styles.secureTextContent}>
              <Text style={styles.secureTitle}>Secure Account Recovery</Text>
              <Text style={styles.secureDesc}>We will never share your contact details with anyone outside of PetCare.</Text>
            </View>
          </View>

          <Button 
            label="Send Verification Code"
            onPress={handleReset}
            isLoading={loading}
            rightIcon="arrow-right"
            style={styles.submitButton}
            textStyle={styles.submitButtonText}
          />
        </View>

        {/* Support Banner */}
        <View style={styles.supportBanner}>
          <View style={styles.supportImageContainer}>
             <View style={styles.dogAvatarPlaceholder}>
                <Icon name="smile" size={24} color={theme.colors.primary.navy} />
             </View>
             <View style={styles.supportBadge}>
               <Icon name="paw-print" size={8} color={theme.colors.surface.default} />
             </View>
          </View>
          
          <View style={styles.supportTextContent}>
            <Text style={styles.supportTitle}>Can't access your inbox?</Text>
            <Text style={styles.supportDesc}>Our Concierge Care Team can verify your identity and help you log in securely.</Text>
            <TouchableOpacity style={styles.chatButton}>
              <Text style={styles.chatButtonText}>Chat with Support</Text>
              <Icon name="arrow-right" size={14} color={theme.colors.primary.navy} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerLinkContainer}>
          <Text style={styles.noAccountText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginText}>Back to Sign In</Text>
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
  innerPaw: {
    position: 'absolute',
    top: 22,
  },
  logoBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: theme.colors.secondary.container,
    width: 20,
    height: 20,
    borderRadius: 10,
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
    marginBottom: theme.spacing[6],
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface.containerHigh,
    borderRadius: theme.radius.md,
    padding: 4,
    width: '100%',
    marginBottom: theme.spacing[6],
  },
  segmentButton: {
    flex: 1,
    paddingVertical: theme.spacing[2],
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.surface.default,
    ...theme.shadows.sm,
  },
  segmentText: {
    ...theme.typography.label,
    color: theme.colors.text.secondary,
  },
  segmentTextActive: {
    color: theme.colors.primary.navy,
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
  stepText: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    fontWeight: 'bold',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
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
  secureBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface.containerHigh,
    padding: theme.spacing[3],
    borderRadius: theme.radius.md,
    marginVertical: theme.spacing[4],
    gap: theme.spacing[3],
  },
  secureIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureTextContent: {
    flex: 1,
  },
  secureTitle: {
    ...theme.typography.caption,
    color: theme.colors.primary.navy,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  secureDesc: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: theme.colors.secondary.container,
    borderRadius: theme.radius.md,
  },
  submitButtonText: {
    color: theme.colors.text.primary,
  },
  supportBanner: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary.navy,
    padding: theme.spacing[4],
    borderRadius: theme.radius.lg,
    width: '100%',
    marginBottom: theme.spacing[6],
    gap: theme.spacing[4],
    alignItems: 'center',
  },
  supportImageContainer: {
    position: 'relative',
  },
  dogAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.tertiary.default,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary.navy,
  },
  supportTextContent: {
    flex: 1,
  },
  supportTitle: {
    ...theme.typography.label,
    color: theme.colors.surface.default,
    marginBottom: 2,
  },
  supportDesc: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    lineHeight: 16,
    marginBottom: theme.spacing[2],
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary.container,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: 16,
    gap: 4,
  },
  chatButtonText: {
    ...theme.typography.caption,
    color: theme.colors.primary.navy,
    fontWeight: 'bold',
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
