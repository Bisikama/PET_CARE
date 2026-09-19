import React from 'react';
import { View, StyleSheet, Text, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../../core/components/Screen';
import { Button } from '../../../core/components/Button';
import { Icon } from '../../../core/components/Icon';
import { theme } from '../../../core/theme';

export default function BecomeProviderIntroScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/(customer)/become-provider/step-profile');
  };

  const benefits = [
    {
      icon: 'briefcase',
      title: 'Be Your Own Boss',
      description: 'Choose your own schedule, services, and prices.',
    },
    {
      icon: 'heart',
      title: 'Do What You Love',
      description: 'Spend your time caring for adorable pets and get paid for it.',
    },
    {
      icon: 'shield',
      title: 'PetCare Protection',
      description: 'Every booking is covered by our premium insurance and support.',
    },
  ];

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2669&auto=format&fit=crop' }} 
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.overlay} />
          <View style={styles.headerContent}>
            <Text style={styles.title}>Join PetCare</Text>
            <Text style={styles.subtitle}>Turn your passion for pets into a rewarding business</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Why become a PetCare Provider?</Text>
          
          <View style={styles.benefitsList}>
            {benefits.map((item, index) => (
              <View key={index} style={styles.benefitCard}>
                <View style={styles.iconBox}>
                  <Icon name={item.icon as any} size={24} color={theme.colors.primary.navy} />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>{item.title}</Text>
                  <Text style={styles.benefitDesc}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          label="Get Started" 
          onPress={handleStart} 
          rightIcon="arrow-right"
          style={styles.startButton}
        />
        <Text style={styles.termsText}>
          By tapping "Get Started", you agree to PetCare's Provider Terms of Service.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
  },
  scrollContent: {
    paddingBottom: theme.spacing[8],
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerContent: {
    position: 'absolute',
    bottom: theme.spacing[6],
    left: theme.spacing[5],
    right: theme.spacing[5],
  },
  title: {
    ...theme.typography.h1,
    color: '#FFF',
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    ...theme.typography.bodyLg,
    color: '#E0E0E0',
    fontWeight: '500',
  },
  content: {
    padding: theme.spacing[5],
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[6],
  },
  benefitsList: {
    gap: theme.spacing[4],
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    padding: theme.spacing[4],
    borderRadius: theme.radius.lg,
    ...theme.shadows.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[4],
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  benefitDesc: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
  },
  footer: {
    padding: theme.spacing[5],
    backgroundColor: theme.colors.surface.default,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subdued,
    paddingBottom: 40,
  },
  startButton: {
    marginBottom: theme.spacing[3],
  },
  termsText: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
});
