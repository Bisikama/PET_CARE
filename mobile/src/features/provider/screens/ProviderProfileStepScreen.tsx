import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../../core/components/Screen';
import { Button } from '../../../core/components/Button';
import { Icon } from '../../../core/components/Icon';
import { Toast } from '../../../core/components/Toast';
import { theme } from '../../../core/theme';
import { providerApi } from '../api/providerApi';
import { ProviderType } from '../types/provider.types';

export default function ProviderProfileStepScreen() {
  const router = useRouter();
  
  const [selectedType, setSelectedType] = useState<ProviderType>(ProviderType.SITTER);
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = async () => {
    if (!experience) {
      setError('Please enter your years of experience');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await providerApi.createProfile({
        providerType: selectedType,
        experienceYears: parseInt(experience, 10) || 0,
        bio: bio.trim(),
      });
      
      router.push('/(customer)/become-provider/step-address');
    } catch (err: any) {
      setError(err?.message || 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { id: ProviderType.SITTER, label: 'Pet Sitter', icon: 'home', desc: 'Boarding, house sitting, drop-in visits' },
    { id: ProviderType.GROOMER, label: 'Groomer', icon: 'scissors', desc: 'Bathing, haircuts, nail trimming' },
    { id: ProviderType.VET, label: 'Veterinarian', icon: 'heart', desc: 'Medical consultations, checkups' },
  ];

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="chevron-left" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 1 of 3</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '33%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What services do you provide?</Text>
        <Text style={styles.subtitle}>Select your primary service category.</Text>

        <View style={styles.typesContainer}>
          {types.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                onPress={() => setSelectedType(type.id as ProviderType)}
                activeOpacity={0.7}
              >
                <View style={[styles.typeIconBox, isSelected && styles.typeIconBoxSelected]}>
                  <Icon 
                    name={type.icon as any} 
                    size={24} 
                    color={isSelected ? theme.colors.primary.navy : theme.colors.text.secondary} 
                  />
                </View>
                <View style={styles.typeTextContainer}>
                  <Text style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}>
                    {type.label}
                  </Text>
                  <Text style={styles.typeDesc}>{type.desc}</Text>
                </View>
                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Experience & Bio</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Years of Experience *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3"
              keyboardType="number-pad"
              value={experience}
              onChangeText={setExperience}
              maxLength={2}
            />
            <Text style={styles.inputSuffix}>Years</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>About You</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell pet owners a little about yourself, your experience with pets, and why they should choose you..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={bio}
            onChangeText={setBio}
            maxLength={500}
          />
          <Text style={styles.charCount}>{bio.length}/500</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          label="Continue to Location" 
          onPress={handleNext} 
          isLoading={loading}
          rightIcon="arrow-right"
        />
      </View>

      <Toast 
        visible={!!error}
        message={error}
        variant="error"
        onHide={() => setError('')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[2],
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[4],
  },
  backButton: {
    padding: theme.spacing[2],
  },
  headerTitle: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.text.secondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.surface.containerHigh,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.navy,
  },
  content: {
    padding: theme.spacing[5],
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[6],
  },
  typesContainer: {
    gap: theme.spacing[3],
    marginBottom: theme.spacing[8],
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  typeCardSelected: {
    borderColor: theme.colors.primary.navy,
    backgroundColor: theme.colors.primary.light,
  },
  typeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface.containerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
  },
  typeIconBoxSelected: {
    backgroundColor: theme.colors.surface.default,
  },
  typeTextContainer: {
    flex: 1,
  },
  typeLabel: {
    ...theme.typography.bodyLg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  typeLabelSelected: {
    color: theme.colors.primary.navy,
  },
  typeDesc: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing[2],
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary.navy,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  },
  inputGroup: {
    marginBottom: theme.spacing[5],
  },
  inputLabel: {
    ...theme.typography.bodySmMedium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.default,
    paddingHorizontal: theme.spacing[4],
  },
  input: {
    flex: 1,
    height: 48,
    ...theme.typography.bodyMd,
    color: theme.colors.text.primary,
  },
  inputSuffix: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing[2],
  },
  textArea: {
    height: 120,
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.default,
    paddingHorizontal: theme.spacing[4],
  },
  charCount: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    textAlign: 'right',
    marginTop: theme.spacing[1],
  },
  footer: {
    padding: theme.spacing[5],
    paddingBottom: 40,
    backgroundColor: theme.colors.surface.default,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
});
