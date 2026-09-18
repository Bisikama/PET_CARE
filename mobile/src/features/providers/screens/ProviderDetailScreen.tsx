import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { ProviderProfileHeader } from '../components/ProviderProfileHeader';
import { ProviderHeroCover } from '../components/ProviderHeroCover';
import { ProviderIdentityCard } from '../components/ProviderIdentityCard';
import { ProviderTrustBadges } from '../components/ProviderTrustBadges';
import { ProviderMetricsGrid } from '../components/ProviderMetricsGrid';
import { ProviderAboutSection } from '../components/ProviderAboutSection';
import { ProviderServicePricingMatrix } from '../components/ProviderServicePricingMatrix';
import { ProviderGallerySection } from '../components/ProviderGallerySection';
import { ProviderReviewsSection } from '../components/ProviderReviewsSection';
import { ProviderWeeklySchedule } from '../components/ProviderWeeklySchedule';
import { ProviderBottomCtaBar } from '../components/ProviderBottomCtaBar';
import { ProviderDetailProfile } from '../types/provider.types';

const defaultProviderProfile: ProviderDetailProfile = {
  id: 'prov-01',
  name: 'Elena Rostova',
  title: 'Certified Sitter & Grooming Specialist',
  avatarUrl:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  coverUrl:
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
  isVerified: true,
  rating: 4.98,
  reviewCount: 142,
  location: 'Downtown & Waterfront District (Within 5.5 miles)',
  yearsExperience: 5,
  completedJobs: 142,
  repeatRate: 100,
  avgReplyMinutes: 12,
  aboutBio:
    'Certified veterinary technician assistant & passionate dog walker. I specialize in energetic golden retrievers and senior pets needing gentle pace and medication administering. Every companion receives unconditional love, keen safety supervision, and structured physical stimulation.',
  specializationTags: [
    'Senior Dogs Specialist',
    'Oral Medication Given',
    'Leash Pulling Training',
    'Certified Groomer',
  ],
  mainPackageName: '60-Min Active Dog Walk & Groom',
  mainPackageDescription:
    'Comprehensive physical exercise with mindful pacing, socialization, and complete post-walk freshening.',
  mainPackagePrice: 250000,
  mainPackageFeatures: [
    'Live GPS Route Tracking',
    'Fresh Water Refill',
    '10+ HD Photo Updates',
    'Gentle Paw Cleaning',
  ],
  pricingTiers: [
    {
      id: 't-1',
      title: 'Dog (0–5 kg)',
      subtext: 'Toy breeds (Chihuahua, Pomeranian)',
      price: 200000,
    },
    {
      id: 't-2',
      title: 'Dog (5–10 kg)',
      subtext: 'Small (Beagle, French Bulldog, Pug)',
      price: 250000,
      isPopular: true,
    },
    {
      id: 't-3',
      title: 'Dog (10–20 kg)',
      subtext: 'Medium (Border Collie, Cocker Spaniel)',
      price: 280000,
    },
    {
      id: 't-4',
      title: 'Dog (20+ kg)',
      subtext: 'Large (Golden Retriever, German Shepherd)',
      price: 320000,
    },
    {
      id: 't-5',
      title: 'Cat Standard Care',
      subtext: 'Feeding, litter cleaning, gentle playtime',
      price: 180000,
      isCat: true,
    },
  ],
  galleryPhotos: [
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80',
  ],
  totalPhotosCount: 38,
  reviewAttributeTags: [
    { label: 'Reliable (98)', count: 98 },
    { label: 'Caring (112)', count: 112 },
    { label: 'Always on time (84)', count: 84 },
    { label: 'Sends great photos (79)', count: 79 },
  ],
  featuredReview: {
    id: 'rev-01',
    authorName: 'Sarah J.',
    petOwnerInfo: 'Owner of Copper (Golden Retriever)',
    authorAvatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment:
      '"Elena is extraordinary! Copper literally waits by the door when she\'s on her way. She handles his high energy with so much calm confidence and the photo updates are pure joy."',
    timeAgo: '3 days ago',
    isVerifiedWalk: true,
  },
  nextAvailableToday: '02:30 PM – 03:30 PM',
  weeklySchedule: [
    { day: 'Mon', hours: '9-5' },
    { day: 'Tue', hours: '9-5' },
    { day: 'Wed', hours: '9-5' },
    { day: 'Thu', hours: '9-5' },
    { day: 'Fri', hours: '9-5' },
    { day: 'Sat', hours: '10-3' },
    { day: 'Sun', hours: 'Off', isOff: true },
  ],
};

export default function ProviderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; name?: string }>();

  const profile = useMemo(() => {
    return {
      ...defaultProviderProfile,
      name: params.name || defaultProviderProfile.name,
      id: params.id || defaultProviderProfile.id,
    };
  }, [params.name, params.id]);

  const handleBookNow = () => {
    router.push({
      pathname: '/(customer)/bookings/select-pet',
      params: {
        providerId: profile.id,
        providerName: profile.name,
        serviceTitle: profile.mainPackageName,
        price: profile.mainPackagePrice.toString(),
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

      {/* 1. Header App Bar */}
      <ProviderProfileHeader
        title="Sitter Profile"
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Hero Cover Photo */}
        <ProviderHeroCover
          coverUrl={profile.coverUrl}
          providerName={profile.name}
          isAvailableToday={true}
        />

        {/* 3. Identity Card with Overlapping Avatar */}
        <ProviderIdentityCard
          avatarUrl={profile.avatarUrl}
          name={profile.name}
          isVerified={profile.isVerified}
          rating={profile.rating}
          reviewCount={profile.reviewCount}
          location={profile.location}
        />

        {/* 4. Trust Badges Row */}
        <ProviderTrustBadges />

        {/* 5. Metrics 4-Column Grid */}
        <ProviderMetricsGrid
          yearsExperience={profile.yearsExperience}
          completedJobs={profile.completedJobs}
          repeatRate={profile.repeatRate}
          avgReplyMinutes={profile.avgReplyMinutes}
        />

        {/* 6. About Me Section */}
        <ProviderAboutSection
          providerName={profile.name}
          aboutBio={profile.aboutBio}
          tags={profile.specializationTags}
        />

        {/* 7. Service Package & Weight Pricing Matrix */}
        <ProviderServicePricingMatrix
          packageName={profile.mainPackageName}
          packageDescription={profile.mainPackageDescription}
          basePrice={profile.mainPackagePrice}
          tiers={profile.pricingTiers}
        />

        {/* 8. Recent Service Gallery */}
        <ProviderGallerySection
          photos={profile.galleryPhotos}
          totalCount={profile.totalPhotosCount}
          onViewAll={() =>
            Alert.alert(
              'Bộ sưu tập hình ảnh',
              `Đang xem toàn bộ ${profile.totalPhotosCount} hình ảnh chăm sóc thú cưng của ${profile.name}.`
            )
          }
        />

        {/* 9. Reviews & Ratings */}
        <ProviderReviewsSection
          rating={profile.rating}
          reviewCount={profile.reviewCount}
          featuredReview={profile.featuredReview}
        />

        {/* 10. Availability Weekly Schedule */}
        <ProviderWeeklySchedule
          nextSlotTime={profile.nextAvailableToday}
          schedule={profile.weeklySchedule}
          onSelectSlot={handleBookNow}
        />
      </ScrollView>

      {/* 11. Bottom Sticky CTA Bar */}
      <ProviderBottomCtaBar
        price={profile.mainPackagePrice}
        timeUnit="/ 60-min session"
        nextSlotText="Today, 2:30 PM"
        onBook={handleBookNow}
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
    paddingBottom: 110, // Margin for sticky bottom CTA bar
  },
});
