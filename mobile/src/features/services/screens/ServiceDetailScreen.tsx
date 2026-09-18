import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { ServiceDetailHeader } from '../components/ServiceDetailHeader';
import { ServiceHeroBanner } from '../components/ServiceHeroBanner';
import { ServiceOverviewCard } from '../components/ServiceOverviewCard';
import { ServiceIncludedGrid } from '../components/ServiceIncludedGrid';
import { PetSizeSelector } from '../components/PetSizeSelector';
import { ServiceAddonsSelector } from '../components/ServiceAddonsSelector';
import { ServicePolicyCard } from '../components/ServicePolicyCard';
import { ServiceBottomBookingBar } from '../components/ServiceBottomBookingBar';
import { ServiceDetail } from '../types/service.types';

const mockServiceDetail: ServiceDetail = {
  id: 'serv-01',
  title: 'Premium Dog Grooming',
  categoryTag: 'Top Rated Grooming',
  completedCount: 1200,
  providerId: 'prov-01',
  providerName: 'Happy Paws Care',
  isVerified: true,
  rating: 4.9,
  reviewCount: 320,
  durationText: '60–90 min',
  imageUrl:
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
  overviewDescription:
    'Our fear-free grooming philosophy ensures your pup feels calm, respected, and indulged. Each session combines gentle detangling, hypoallergenic organic hydro-massage baths, temperature-regulated blowouts, and artisanal scissoring tailored to your dog’s specific coat typology.',
  includedItems: [
    { id: 'inc-1', title: 'Organic Bath', iconName: 'bath' },
    { id: 'inc-2', title: 'Warm Blow Dry', iconName: 'blow_dry' },
    { id: 'inc-3', title: 'Hair Trimming', iconName: 'hair_trim' },
    { id: 'inc-4', title: 'Nail Trimming', iconName: 'nail_trim' },
    { id: 'inc-5', title: 'Ear Cleaning', iconName: 'ear_clean' },
    { id: 'inc-6', title: 'Basic Brushing', iconName: 'brush' },
  ],
  petSizes: [
    { id: 'small', label: 'Small dog', weightRange: '< 10 kg', price: 200000 },
    { id: 'medium', label: 'Medium dog', weightRange: '10 – 25 kg', price: 250000 },
    { id: 'large', label: 'Large dog', weightRange: '> 25 kg', price: 300000 },
  ],
  addons: [
    {
      id: 'addon-1',
      label: 'Teeth cleaning',
      description: 'Enzymatic plaque removal',
      price: 50000,
    },
    {
      id: 'addon-2',
      label: 'Flea & tick treatment',
      description: 'Herbal preventative rinse',
      price: 60000,
    },
    {
      id: 'addon-3',
      label: 'Premium oatmeal shampoo',
      description: 'For extra sensitive or dry skin',
      price: 30000,
    },
  ],
  suitablePets: 'Dogs of all breeds and temperaments.',
  healthRequirements: 'Must be up to date on mandatory Rabies and DHPP vaccines.',
  cancellationPolicy: '100% full refund for cancellations made up to 24 hours prior.',
};

export default function ServiceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; title?: string; providerName?: string }>();

  // State
  const [selectedSizeId, setSelectedSizeId] = useState<string>('medium');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  const service = useMemo(() => {
    return {
      ...mockServiceDetail,
      title: params.title || mockServiceDetail.title,
      providerName: params.providerName || mockServiceDetail.providerName,
    };
  }, [params.title, params.providerName]);

  // Calculate live total price
  const totalPrice = useMemo(() => {
    const selectedSize = service.petSizes.find((s) => s.id === selectedSizeId);
    const basePrice = selectedSize ? selectedSize.price : 0;

    const addonsPrice = service.addons
      .filter((a) => selectedAddonIds.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);

    return basePrice + addonsPrice;
  }, [service, selectedSizeId, selectedAddonIds]);

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleBook = () => {
    router.push({
      pathname: '/(customer)/bookings/select-pet',
      params: {
        serviceId: service.id,
        serviceTitle: service.title,
        providerName: service.providerName,
        price: totalPrice.toString(),
        selectedSizeId,
        selectedAddonIds: JSON.stringify(selectedAddonIds),
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

      {/* 1. Header Navigation */}
      <ServiceDetailHeader
        title="Sitter Details"
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Hero Image Banner */}
        <ServiceHeroBanner
          imageUrl={service.imageUrl}
          durationText={service.durationText}
          rating={service.rating}
          reviewCount={service.reviewCount}
          serviceTitle={service.title}
        />

        {/* 3. Service Overview & Provider */}
        <ServiceOverviewCard
          categoryTag={service.categoryTag}
          completedCount={service.completedCount}
          title={service.title}
          providerName={service.providerName}
          isVerified={service.isVerified}
          overviewDescription={service.overviewDescription}
        />

        {/* 4. What's Included Grid */}
        <ServiceIncludedGrid items={service.includedItems} />

        {/* 5. Select Pet Size Single-choice */}
        <PetSizeSelector
          sizes={service.petSizes}
          selectedSizeId={selectedSizeId}
          onSelectSize={setSelectedSizeId}
        />

        {/* 6. Optional Add-ons Multiple-choice */}
        <ServiceAddonsSelector
          addons={service.addons}
          selectedAddonIds={selectedAddonIds}
          onToggleAddon={handleToggleAddon}
        />

        {/* 7. Important Policies */}
        <ServicePolicyCard
          suitablePets={service.suitablePets}
          healthRequirements={service.healthRequirements}
          cancellationPolicy={service.cancellationPolicy}
        />
      </ScrollView>

      {/* 8. Sticky Bottom Booking Bar */}
      <ServiceBottomBookingBar
        totalPrice={totalPrice}
        onBook={handleBook}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110, // Margin for sticky bottom booking bar
  },
});
