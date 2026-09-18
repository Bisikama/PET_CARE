import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, CheckCircle2 } from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { BookingStepHeader } from '../components/BookingStepHeader';
import { BookingCriteriaSummaryCard } from '../components/BookingCriteriaSummaryCard';
import { ProviderSortFilterBar } from '../components/ProviderSortFilterBar';
import { MatchedProviderCard } from '../components/MatchedProviderCard';
import { BookingSafetyBanner } from '../components/BookingSafetyBanner';
import { BookingBottomActions } from '../components/BookingBottomActions';
import { MatchedProviderItem } from '../types/booking.types';

const mockMatchedProviders: MatchedProviderItem[] = [
  {
    id: 'prov-01',
    name: 'Happy Paws Care Studio',
    avatarUrl:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
    tagline: 'Certified Salon & Mobile Grooming',
    isVerified: true,
    rating: 4.9,
    reviewCount: 320,
    completedJobs: 1450,
    compatibilityScore: 98,
    isBestChoice: true,
    matchReasons: [
      'Experienced with Golden Retrievers & heavy coats',
      'Accepts large dogs (25–40 kg) with non-slip hydraulic tables',
      'Available at your requested time (10:30 AM)',
      'Serves Thao Dien (1.2 km away · 5 min drive)',
    ],
    price: 250000,
    priceSubtext: 'Premium Dog Grooming · Estimated',
    earliestSlot: '10:30 AM',
    distanceKm: 1.2,
    isHomeVisit: true,
  },
  {
    id: 'prov-02',
    name: 'FurEver Friends Care & Spa',
    avatarUrl:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80',
    tagline: 'Master Groomer & Gentle Handling Specialist',
    isVerified: true,
    rating: 4.8,
    reviewCount: 195,
    completedJobs: 820,
    matchReasons: [
      'Specializes in nervous pets (low-noise warm air dryers)',
      'Accepts dogs 10–35 kg',
      'Mobile grooming van arrives equipped at your home',
    ],
    price: 270000,
    priceSubtext: 'Includes aromatherapy bath',
    earliestSlot: '02:30 PM',
    distanceKm: 2.5,
    isHomeVisit: true,
  },
  {
    id: 'prov-03',
    name: 'Pawfect Grooming Studio',
    avatarUrl:
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=400&q=80',
    tagline: 'Quick Care & Standard Grooming',
    isVerified: true,
    rating: 4.7,
    reviewCount: 142,
    completedJobs: 560,
    matchReasons: [
      'Serves District 2 (0.8 km away · Fast local walk-in)',
      'Express 60-min turnaround service',
    ],
    price: 210000,
    priceSubtext: 'Standard Care Package',
    earliestSlot: '11:30 AM',
    distanceKm: 0.8,
  },
];

export default function SelectProviderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    serviceId?: string;
    serviceTitle?: string;
    providerName?: string;
    price?: string;
    selectedSizeId?: string;
    selectedAddonIds?: string;
    petId?: string;
    petName?: string;
    petAvatarUrl?: string;
    day?: string;
    slotTime?: string;
  }>();

  const [selectedProviderId, setSelectedProviderId] = useState<string>('prov-01');
  const [selectedFilterId, setSelectedFilterId] = useState<string>('best_match');

  const petName = params.petName || 'Milo';
  const serviceTitle = params.serviceTitle || 'Premium Dog Grooming';
  const slotTime = params.slotTime || '10:30 AM';
  const day = params.day || '20';
  const dateSlotText = `Sat, ${day} Sep 2026 · ${slotTime}`;

  // Filtered providers
  const filteredProviders = useMemo(() => {
    let list = [...mockMatchedProviders];
    if (selectedFilterId === 'highest_rated') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (selectedFilterId === 'lowest_price') {
      list.sort((a, b) => a.price - b.price);
    } else if (selectedFilterId === 'home_visit') {
      list = list.filter((p) => p.isHomeVisit);
    } else if (selectedFilterId === 'verified_only') {
      list = list.filter((p) => p.isVerified);
    }
    return list;
  }, [selectedFilterId]);

  const handleContinue = () => {
    const selectedProvider = mockMatchedProviders.find(
      (p) => p.id === selectedProviderId
    );
    Alert.alert(
      'Xác nhận chuyên viên',
      `Bạn đã chọn ${selectedProvider?.name || 'Happy Paws Care'}. Sẵn sàng tiếp tục sang Phase 4 (Payment & Review)?`,
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Tiếp tục',
          onPress: () => {
            // Sẵn sàng liên kết sang Phase 4
            Alert.alert('Phase 4', 'Chuyển sang bước thanh toán & hoàn tất đặt lịch!');
          },
        },
      ]
    );
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
      <BookingStepHeader
        title="Choose Provider"
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Top Progress Tracker (Step 3 of 4) */}
        <View style={styles.trackerSection}>
          <View style={styles.stepNodesRow}>
            {/* Step 1: Pet (Completed) */}
            <View style={styles.nodeCol}>
              <View style={styles.nodeCircleCompleted}>
                <Check size={14} color={theme.colors.text.inverse} strokeWidth={3} />
              </View>
              <Text style={styles.nodeLabel}>Pet</Text>
            </View>

            <View style={styles.nodeLineCompleted} />

            {/* Step 2: Date & Time (Completed) */}
            <View style={styles.nodeCol}>
              <View style={styles.nodeCircleCompleted}>
                <Check size={14} color={theme.colors.text.inverse} strokeWidth={3} />
              </View>
              <Text style={styles.nodeLabel}>Date & Time</Text>
            </View>

            <View style={styles.nodeLineActive} />

            {/* Step 3: Provider (Active) */}
            <View style={styles.nodeCol}>
              <View style={styles.nodeCircleActive}>
                <Text style={styles.nodeNumberActive}>3</Text>
              </View>
              <Text style={styles.nodeLabelActive}>Provider</Text>
            </View>

            <View style={styles.nodeLineInactive} />

            {/* Step 4: Payment */}
            <View style={styles.nodeCol}>
              <View style={styles.nodeCircleInactive}>
                <Text style={styles.nodeNumberInactive}>4</Text>
              </View>
              <Text style={styles.nodeLabelInactive}>Payment</Text>
            </View>
          </View>

          {/* Title and Step badge */}
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              <Text style={styles.screenTitle}>Choose Provider</Text>
              <View style={styles.stepPill}>
                <Text style={styles.stepPillText}>Step 3 of 4</Text>
              </View>
            </View>
            <Text style={styles.screenSubtitle}>
              Select the provider that best matches {petName}’s needs.
            </Text>
          </View>
        </View>

        {/* 3. Booking Criteria Summary Card */}
        <BookingCriteriaSummaryCard
          petName={petName}
          serviceTitle={serviceTitle}
          dateSlotText={dateSlotText}
          onEdit={() => router.back()}
        />

        {/* 4. Quick Sort & Filter Bar */}
        <ProviderSortFilterBar
          selectedFilterId={selectedFilterId}
          onSelectFilter={setSelectedFilterId}
        />

        {/* 5. Results Count Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredProviders.length} Recommended Providers
          </Text>
          <Text style={styles.resultsSort}>Sorted by Best Match</Text>
        </View>

        {/* 6. Matched Provider Cards List */}
        <View style={styles.providersList}>
          {filteredProviders.map((provider) => (
            <MatchedProviderCard
              key={provider.id}
              provider={provider}
              isSelected={selectedProviderId === provider.id}
              petName={petName}
              onSelect={() => setSelectedProviderId(provider.id)}
              onViewDetails={() =>
                router.push({
                  pathname: '/(customer)/providers/[id]',
                  params: {
                    id: provider.id,
                    name: provider.name,
                  },
                })
              }
            />
          ))}
        </View>

        {/* 7. Safety Guarantee Banner */}
        <BookingSafetyBanner />
      </ScrollView>

      {/* 8. Bottom Sticky Actions */}
      <BookingBottomActions
        onBack={() => router.back()}
        onNext={handleContinue}
        nextLabel="Continue with Selected Provider"
        disabled={!selectedProviderId}
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
  trackerSection: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    gap: theme.spacing[3],
  },
  stepNodesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    paddingHorizontal: 6,
  },
  nodeCol: {
    alignItems: 'center',
    gap: 4,
    zIndex: 2,
  },
  nodeCircleCompleted: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCircleActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary.container,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(245, 184, 46, 0.3)',
    ...theme.shadows.sm,
  },
  nodeCircleInactive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surface.containerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeNumberActive: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.secondary.onContainer,
  },
  nodeNumberInactive: {
    ...theme.typography.label,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.muted,
  },
  nodeLabel: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  nodeLabelActive: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.primary.navy,
    fontWeight: '800',
  },
  nodeLabelInactive: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.text.muted,
    fontWeight: '500',
  },
  nodeLineCompleted: {
    flex: 1,
    height: 2.5,
    backgroundColor: theme.colors.primary.navy,
    marginTop: -18,
  },
  nodeLineActive: {
    flex: 1,
    height: 2.5,
    backgroundColor: theme.colors.secondary.container,
    marginTop: -18,
  },
  nodeLineInactive: {
    flex: 1,
    height: 2.5,
    backgroundColor: theme.colors.surface.containerHigh,
    marginTop: -18,
  },
  titleRow: {
    gap: 3,
    marginTop: 2,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  screenTitle: {
    ...theme.typography.h2,
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primary.navy,
    letterSpacing: -0.4,
  },
  stepPill: {
    backgroundColor: 'rgba(245, 184, 46, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  stepPillText: {
    ...theme.typography.label,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.secondary.onContainer,
  },
  screenSubtitle: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[1],
  },
  resultsCount: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  resultsSort: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.muted,
  },
  providersList: {
    paddingHorizontal: theme.spacing[5],
    gap: theme.spacing[3],
    paddingTop: theme.spacing[1],
  },
});
