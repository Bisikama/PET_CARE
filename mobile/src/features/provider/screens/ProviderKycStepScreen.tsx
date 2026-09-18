import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../../../core/components/Screen';
import { Button } from '../../../core/components/Button';
import { Icon } from '../../../core/components/Icon';
import { Toast } from '../../../core/components/Toast';
import { theme } from '../../../core/theme';
import { providerApi } from '../api/providerApi';

interface ImageAsset {
  uri: string;
  type: string;
  name: string;
}

export default function ProviderKycStepScreen() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // Simple string for now, ideally DatePicker
  const [nationality, setNationality] = useState('Vietnamese');
  
  const [frontImage, setFrontImage] = useState<ImageAsset | null>(null);
  const [backImage, setBackImage] = useState<ImageAsset | null>(null);
  const [faceImage, setFaceImage] = useState<ImageAsset | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pickImage = async (setter: React.Dispatch<React.SetStateAction<ImageAsset | null>>) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setter({
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || `image_${Date.now()}.jpg`,
        });
      }
    } catch (e: any) {
      setError('Failed to pick image.');
    }
  };

  const handleNext = async () => {
    if (!fullName || !idNumber || !dateOfBirth || !nationality) {
      setError('Please fill in all personal information');
      return;
    }
    
    if (!frontImage || !backImage || !faceImage) {
      setError('Please upload all required images');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Validate date format simply
      const parsedDate = new Date(dateOfBirth);
      if (isNaN(parsedDate.getTime())) {
        setError('Invalid Date of Birth format. Please use YYYY-MM-DD');
        setLoading(false);
        return;
      }
      
      await providerApi.uploadKyc(
        {
          fullName: fullName.trim(),
          idNumber: idNumber.trim(),
          dateOfBirth: parsedDate.toISOString(),
          nationality: nationality.trim(),
        },
        frontImage,
        backImage,
        faceImage
      );
      
      router.push('/(customer)/become-provider/success');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit KYC. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderImageUpload = (
    title: string, 
    desc: string, 
    image: ImageAsset | null, 
    setter: React.Dispatch<React.SetStateAction<ImageAsset | null>>
  ) => (
    <View style={styles.uploadSection}>
      <Text style={styles.uploadTitle}>{title}</Text>
      <Text style={styles.uploadDesc}>{desc}</Text>
      <TouchableOpacity 
        style={styles.uploadBox}
        onPress={() => pickImage(setter)}
        activeOpacity={0.8}
      >
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.uploadedImage} />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <View style={styles.uploadIconBox}>
              <Icon name="camera" size={24} color={theme.colors.primary.navy} />
            </View>
            <Text style={styles.uploadActionText}>Tap to Upload</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="chevron-left" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 3 of 3</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '100%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Identity Verification (eKYC)</Text>
        <Text style={styles.subtitle}>
          We need to verify your identity to ensure the safety of all pets and users on PetCare.
        </Text>

        <View style={styles.infoBanner}>
          <Icon name="shield-check" size={20} color={theme.colors.semantic.success} />
          <Text style={styles.infoBannerText}>
            Your data is securely encrypted and never shared.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Personal Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Legal Name *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="As shown on your ID card"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ID / Passport Number *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter ID number"
              value={idNumber}
              onChangeText={setIdNumber}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date of Birth (YYYY-MM-DD) *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1995-10-25"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Documents</Text>

        {renderImageUpload(
          'ID Card - Front',
          'Ensure all text and your photo are clearly visible.',
          frontImage,
          setFrontImage
        )}
        
        {renderImageUpload(
          'ID Card - Back',
          'Ensure the text and barcode are clearly visible.',
          backImage,
          setBackImage
        )}

        {renderImageUpload(
          'Selfie Photo',
          'A clear photo of your face, matching the ID card.',
          faceImage,
          setFaceImage
        )}

      </ScrollView>

      <View style={styles.footer}>
        <Button 
          label="Submit Application" 
          onPress={handleNext} 
          isLoading={loading}
          rightIcon="check-circle"
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
    marginBottom: theme.spacing[4],
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.containerHigh,
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing[6],
    gap: theme.spacing[3],
  },
  infoBannerText: {
    ...theme.typography.bodySmMedium,
    color: theme.colors.primary.navy,
    flex: 1,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
    marginTop: theme.spacing[2],
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
  uploadSection: {
    marginBottom: theme.spacing[6],
  },
  uploadTitle: {
    ...theme.typography.bodyLg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  uploadDesc: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[3],
  },
  uploadBox: {
    height: 160,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    borderStyle: 'dashed',
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.default,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[3],
  },
  uploadActionText: {
    ...theme.typography.bodySmMedium,
    color: theme.colors.primary.navy,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  footer: {
    padding: theme.spacing[5],
    paddingBottom: 40,
    backgroundColor: theme.colors.surface.default,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
});
