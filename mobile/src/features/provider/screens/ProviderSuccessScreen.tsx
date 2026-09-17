import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../../core/components/Screen';
import { Button } from '../../../core/components/Button';
import { theme } from '../../../core/theme';
import { Icon } from '../../../core/components/Icon';

export default function ProviderSuccessScreen() {
  const router = useRouter();

  const handleFinish = () => {
    // Navigate to pending approval or switch role
    router.replace('/(provider)/pending-approval');
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Icon name="check" size={48} color={theme.colors.semantic.success} />
          </View>
        </View>
        
        <Text style={styles.title}>Application Submitted!</Text>
        
        <Text style={styles.subtitle}>
          Your application to become a PetCare Provider has been successfully submitted and is now under review.
        </Text>
        
        <View style={styles.infoCard}>
          <Icon name="clock" size={24} color={theme.colors.primary.navy} />
          <Text style={styles.infoTitle}>What happens next?</Text>
          <Text style={styles.infoText}>
            Our team will review your application and eKYC documents within 1-2 business days. 
            You will receive a notification once your account is approved.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          label="Go to Dashboard" 
          onPress={handleFinish} 
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
  },
  content: {
    flex: 1,
    padding: theme.spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing[6],
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.semantic.successContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.bodyLg,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[8],
  },
  infoCard: {
    backgroundColor: theme.colors.surface.containerHigh,
    padding: theme.spacing[5],
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    width: '100%',
  },
  infoTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[2],
  },
  infoText: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  footer: {
    padding: theme.spacing[5],
    paddingBottom: 40,
  },
});
