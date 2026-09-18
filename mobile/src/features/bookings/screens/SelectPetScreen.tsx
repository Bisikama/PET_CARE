import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { BookingStepHeader } from '../components/BookingStepHeader';
import { BookingStepper } from '../components/BookingStepper';
import { BookingServiceContextCard } from '../components/BookingServiceContextCard';
import { BookingPetCard } from '../components/BookingPetCard';
import { AddNewPetButton } from '../components/AddNewPetButton';
import { BookingCareAssurance } from '../components/BookingCareAssurance';
import { BookingBottomActions } from '../components/BookingBottomActions';
import { SelectablePet } from '../types/booking.types';

const mockPets: SelectablePet[] = [
  {
    id: 'milo',
    name: 'Milo',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 28,
    gender: 'Male',
    avatarUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
    tierNote: 'Large Dog Tier Applicable',
  },
  {
    id: 'luna',
    name: 'Luna',
    species: 'Cat',
    breed: 'Ragdoll Cat',
    age: 2,
    weight: 4.2,
    gender: 'Female',
    avatarUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80',
    isVerified: false,
    warningNote: 'Cat Grooming service protocol differs',
  },
];

export default function SelectPetScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    serviceId?: string;
    serviceTitle?: string;
    providerName?: string;
    price?: string;
    selectedSizeId?: string;
    selectedAddonIds?: string;
  }>();

  const [selectedPetId, setSelectedPetId] = useState<string>('milo');

  const serviceTitle = params.serviceTitle || 'Premium Dog Grooming';
  const providerName = params.providerName || 'Happy Paws Care Studio';
  const parsedPrice = params.price ? parseInt(params.price, 10) : 250000;

  const handleAddNewPet = () => {
    Alert.alert(
      'Thêm hồ sơ thú cưng',
      'Mở biểu mẫu đăng ký hồ sơ thú cưng mới.',
      [
        { text: 'Đóng', style: 'cancel' },
        {
          text: 'Tạo hồ sơ',
          onPress: () => router.push('/(customer)/pets'),
        },
      ]
    );
  };

  const handleContinue = () => {
    const selectedPet = mockPets.find((p) => p.id === selectedPetId);
    router.push({
      pathname: '/(customer)/bookings/schedule-time',
      params: {
        serviceId: params.serviceId,
        serviceTitle: serviceTitle,
        providerName: providerName,
        price: parsedPrice.toString(),
        selectedSizeId: params.selectedSizeId,
        selectedAddonIds: params.selectedAddonIds,
        petId: selectedPetId,
        petName: selectedPet?.name || 'Milo',
        petAvatarUrl: selectedPet?.avatarUrl,
      },
    });
  };

  return (
    <Screen
      withPadding={false}
      backgroundColor={theme.colors.background.default}
      edges={['top', 'left', 'right']}
      style={styles.screen}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.default} />

      {/* 1. Top Header */}
      <BookingStepHeader
        title="Select Pet Step"
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Step Progress & Screen Title */}
        <BookingStepper
          currentStep={1}
          totalSteps={4}
          stepName="Pet Selection"
          title="Who is this booking for?"
          subtitle="Choose the pet receiving the care service."
        />

        {/* 3. Selected Service Mini-Context */}
        <BookingServiceContextCard
          serviceTitle={serviceTitle}
          providerName={providerName}
          price={parsedPrice}
        />

        {/* 4. Pet Selection Cards */}
        <View style={styles.petListSection}>
          {mockPets.map((pet) => (
            <BookingPetCard
              key={pet.id}
              pet={pet}
              isSelected={selectedPetId === pet.id}
              onSelect={() => setSelectedPetId(pet.id)}
            />
          ))}

          {/* Add New Pet Button */}
          <AddNewPetButton onPress={handleAddNewPet} />
        </View>

        {/* 5. Care Assurance Note */}
        <BookingCareAssurance />
      </ScrollView>

      {/* 6. Sticky Bottom Actions Bar */}
      <BookingBottomActions
        onBack={() => router.back()}
        onNext={handleContinue}
        nextLabel="Continue to Date & Time"
        disabled={!selectedPetId}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110, // Margin for sticky bottom actions
  },
  petListSection: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
    gap: theme.spacing[3],
  },
});
