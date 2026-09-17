import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Screen } from '../../../core/components/Screen';
import { Button } from '../../../core/components/Button';
import { Icon } from '../../../core/components/Icon';
import { Toast } from '../../../core/components/Toast';
import { theme } from '../../../core/theme';
import { providerApi } from '../api/providerApi';

export default function ProviderAddressStepScreen() {
  const router = useRouter();
  
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  
  // Default coordinate (e.g. Ho Chi Minh City center)
  const [coordinate, setCoordinate] = useState({
    latitude: 10.7769,
    longitude: 106.7009,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = async () => {
    if (!addressLine1 || !city) {
      setError('Please fill in Address Line 1 and City');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await providerApi.updateBaseAddress({
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        country: 'Vietnam', // default or ask user
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });
      
      router.push('/(customer)/become-provider/step-kyc');
    } catch (err: any) {
      setError(err?.message || 'Failed to update address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="chevron-left" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 2 of 3</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '66%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Where are you located?</Text>
        <Text style={styles.subtitle}>
          This will be your base location for providing services. You can add specific service areas later.
        </Text>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: coordinate.latitude,
              longitude: coordinate.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={(e) => setCoordinate(e.nativeEvent.coordinate)}
          >
            <Marker 
              coordinate={coordinate} 
              draggable 
              onDragEnd={(e) => setCoordinate(e.nativeEvent.coordinate)}
            />
          </MapView>
          <View style={styles.mapHint}>
            <Icon name="info" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.mapHintText}>Tap or drag the pin to set your exact location</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Address Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address Line 1 *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="House number, street name"
              value={addressLine1}
              onChangeText={setAddressLine1}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address Line 2 (Optional)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Apartment, suite, unit, etc."
              value={addressLine2}
              onChangeText={setAddressLine2}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>City / Province *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ho Chi Minh City"
              value={city}
              onChangeText={setCity}
            />
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Button 
          label="Continue to Verification" 
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
  mapContainer: {
    width: '100%',
    height: 250,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: theme.spacing[6],
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapHint: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: theme.spacing[2],
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  mapHintText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    flex: 1,
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
  footer: {
    padding: theme.spacing[5],
    paddingBottom: 40,
    backgroundColor: theme.colors.surface.default,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
});
