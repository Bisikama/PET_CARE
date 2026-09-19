import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Text,
  TouchableOpacity,
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
import { petApi } from '@/features/pets/api/petApi';
import { useBookingFlow } from '../context/BookingContext';

export default function SelectPetScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useBookingFlow();
  const params = useLocalSearchParams<{
    serviceId?: string;
    serviceTitle?: string;
    providerName?: string;
    price?: string;
    selectedSizeId?: string;
    selectedAddonIds?: string;
  }>();

  const [pets, setPets] = useState<SelectablePet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>(draft.petId || '');
  const [isLoadingPets, setIsLoadingPets] = useState(true);

  const serviceTitle = params.serviceTitle || draft.serviceTitle || 'Chăm sóc thú cưng cao cấp';
  const providerName = params.providerName || draft.providerName || 'PetCare Partner';
  const parsedPrice = params.price
    ? parseInt(params.price, 10)
    : draft.servicePrice || draft.basePrice || 250000;

  useEffect(() => {
    // Synchronize initial service info into draft if passed via params
    if (params.serviceId || params.serviceTitle || params.price) {
      updateDraft({
        serviceId: params.serviceId || draft.serviceId,
        serviceTitle: serviceTitle,
        servicePrice: parsedPrice,
        basePrice: parsedPrice,
        providerName: providerName,
      });
    }
  }, [params.serviceId, params.serviceTitle, params.price]);

  useEffect(() => {
    const loadPets = async () => {
      try {
        setIsLoadingPets(true);
        const res = await petApi.getPets();
        if (res.success && res.data && res.data.length > 0) {
          const mapped: SelectablePet[] = res.data.map((p) => ({
            id: p.id,
            name: p.name,
            species: (p.species as any) || 'Dog',
            breed: p.breed || (p.species === 'Cat' ? 'Mèo cưng' : 'Chó cưng'),
            age: p.age || 2,
            weight: Number(p.weight) || 5,
            gender: (p.gender as any) || 'Male',
            avatarUrl:
              p.avatarUrl ||
              p.avatar_url ||
              (p.species === 'Cat'
                ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80'
                : 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80'),
            isVerified: true,
          }));
          setPets(mapped);
          if (!selectedPetId && mapped.length > 0) {
            setSelectedPetId(mapped[0].id);
          }
        } else {
          setPets([]);
        }
      } catch (e) {
        setPets([]);
      } finally {
        setIsLoadingPets(false);
      }
    };
    loadPets();
  }, []);

  const handleAddNewPet = () => {
    router.push('/(customer)/pets/add');
  };

  const handleContinue = () => {
    const selectedPet = pets.find((p) => p.id === selectedPetId);
    if (!selectedPet) return;

    // Save to context
    updateDraft({
      petId: selectedPet.id,
      petName: selectedPet.name,
      petSpecies: selectedPet.species,
      petBreed: selectedPet.breed,
      petAge: selectedPet.age,
      petWeight: selectedPet.weight,
      petGender: selectedPet.gender,
      petAvatarUrl: selectedPet.avatarUrl,
    });

    // Navigate to Step 2
    router.push({
      pathname: '/(customer)/bookings/schedule-time',
      params: {
        serviceId: params.serviceId || draft.serviceId,
        serviceTitle: serviceTitle,
        providerName: providerName,
        price: parsedPrice.toString(),
        selectedSizeId: params.selectedSizeId,
        selectedAddonIds: params.selectedAddonIds,
        petId: selectedPet.id,
        petName: selectedPet.name,
        petBreed: selectedPet.breed,
        petAvatarUrl: selectedPet.avatarUrl,
        petWeight: `${selectedPet.weight} kg`,
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
        title="Chọn thú cưng"
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
          stepName="Chọn thú cưng"
          title="Bạn đặt lịch cho bé nào?"
          subtitle="Chọn thú cưng để hệ thống tính giá và ghép đối tác phù hợp."
        />

        {/* 3. Selected Service Mini-Context */}
        <BookingServiceContextCard
          serviceTitle={serviceTitle}
          providerName={providerName}
          price={parsedPrice}
        />

        {/* 4. Pet Selection Cards */}
        <View style={styles.petListSection}>
          {isLoadingPets ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={theme.colors.primary.navy} />
              <Text style={styles.loadingText}>Đang tải hồ sơ thú cưng...</Text>
            </View>
          ) : pets.length > 0 ? (
            pets.map((pet) => (
              <BookingPetCard
                key={pet.id}
                pet={pet}
                isSelected={selectedPetId === pet.id}
                onSelect={() => setSelectedPetId(pet.id)}
              />
            ))
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>Chưa có hồ sơ thú cưng</Text>
              <Text style={styles.emptySubtitle}>
                Vui lòng thêm thú cưng của bạn để tiếp tục đặt lịch chăm sóc.
              </Text>
            </View>
          )}

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
        nextLabel="Tiếp tục chọn Ngày & Giờ"
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
    paddingBottom: 110,
  },
  petListSection: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
    gap: theme.spacing[3],
  },
  loadingWrap: {
    padding: theme.spacing[6],
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
  },
  emptyWrap: {
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[5],
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  emptyTitle: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  emptySubtitle: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
