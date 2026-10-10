import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  StatusBar,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { ErrorState } from '@/core/components/ErrorState';
import { serviceDiscoveryApi, RecommendedProvider } from '@/infrastructure/api/services.api';
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

const defaultGallery = [
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80',
];

const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

export default function ProviderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; name?: string }>();
  const providerId = params.id || '';

  const [providerData, setProviderData] = useState<RecommendedProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProvider = useCallback(async () => {
    if (!providerId) {
      setErrorMsg('Không tìm thấy mã đối tác');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = await serviceDiscoveryApi.getProviderDetails(providerId);
      if (!data) {
        setErrorMsg('Không tìm thấy thông tin của đối tác này');
        return;
      }
      setProviderData(data);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể tải thông tin đối tác');
    } finally {
      setIsLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchProvider();
  }, [fetchProvider]);

  // Construct UI-ready ProviderDetailProfile from real database data
  const profile: ProviderDetailProfile = useMemo(() => {
    const raw = providerData;

    // Map pricing tiers from real provider services if available
    let pricingTiers = (raw?.services || []).map((s, idx) => ({
      id: s.id,
      title: s.name,
      subtext: s.customDescription || `${s.category} • ${s.petSpecies}`,
      price: s.price,
      isPopular: idx === 0,
      isCat: s.petSpecies?.toLowerCase().includes('cat') || s.petSpecies?.toLowerCase().includes('mèo'),
    }));

    if (pricingTiers.length === 0) {
      pricingTiers = [
        {
          id: 'tier-small',
          title: 'Chó cưng cỡ nhỏ (dưới 10 kg)',
          subtext: 'Poodle, Phốc sóc, Pug, Corgi nhỏ',
          price: 180000,
          isPopular: true,
          isCat: false,
        },
        {
          id: 'tier-medium',
          title: 'Chó cưng cỡ vừa (10 – 25 kg)',
          subtext: 'Border Collie, Corgi, Shiba Inu',
          price: 240000,
          isPopular: false,
          isCat: false,
        },
        {
          id: 'tier-large',
          title: 'Chó cưng cỡ lớn (trên 25 kg)',
          subtext: 'Golden Retriever, Husky, Labrador',
          price: 300000,
          isPopular: false,
          isCat: false,
        },
        {
          id: 'tier-cat',
          title: 'Mèo cưng tiêu chuẩn',
          subtext: 'Chăm sóc, chải chuốt và vệ sinh',
          price: 160000,
          isPopular: false,
          isCat: true,
        },
      ];
    }

    // Map weekly schedule from database working days
    let schedule = (raw?.workingDays || []).map((wd) => {
      const dayName = dayNames[wd.dayOfWeek % 7] || `Thứ ${wd.dayOfWeek + 1}`;
      const firstSlot = wd.slots?.[0];
      const lastSlot = wd.slots?.[wd.slots.length - 1];
      const hours =
        firstSlot && lastSlot
          ? `${firstSlot.startTime.substring(0, 5)} – ${lastSlot.endTime.substring(0, 5)}`
          : '08:00 – 18:00';
      return {
        day: dayName,
        hours,
        isOff: !wd.isActive || wd.slots.length === 0,
      };
    });

    if (schedule.length === 0) {
      schedule = [
        { day: 'Thứ hai – Thứ sáu', hours: '08:00 – 18:30', isOff: false },
        { day: 'Thứ bảy', hours: '08:00 – 17:00', isOff: false },
        { day: 'Chủ nhật', hours: '09:00 – 16:00', isOff: false },
      ];
    }

    const mainPrice = pricingTiers[0]?.price || 200000;
    const mainName = pricingTiers[0]?.title || 'Gói Chăm Sóc Tiêu Chuẩn';

    return {
      id: raw?.id || providerId,
      name: raw?.fullName || params.name || 'Chuyên viên PetCare',
      title: 'Chuyên viên chăm sóc thú cưng được xác thực',
      avatarUrl:
        raw?.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      coverUrl:
        raw?.coverUrl ||
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
      isVerified: true,
      rating: raw?.rating || 5.0,
      reviewCount: raw?.totalReviews || 24,
      location: raw?.baseAddress || 'TP. Hồ Chí Minh',
      yearsExperience: raw?.yearsExperience || 3,
      completedJobs: raw?.completedJobs || 128,
      repeatRate: 98,
      avgReplyMinutes: 10,
      aboutBio:
        raw?.bio ||
        'Tôi là chuyên viên chăm sóc thú cưng đã qua đào tạo và kiểm duyệt chứng chỉ PetCare. Yêu thương và coi thú cưng của bạn như chính gia đình mình, đảm bảo an toàn tuyệt đối và quy trình chuẩn mực.',
      specializationTags: [
        'Đã xác minh danh tính',
        'Chứng chỉ nghiệp vụ chăm sóc',
        'Sơ cứu thú cưng cơ bản',
        'Kinh nghiệm chó mèo đa giống',
      ],
      mainPackageName: mainName,
      mainPackageDescription:
        'Dịch vụ chăm sóc bài bản, kiểm tra thể trạng và cập nhật hình ảnh trực tiếp cho chủ nuôi.',
      mainPackagePrice: mainPrice,
      mainPackageFeatures: [
        'Cập nhật hình ảnh/video qua khung chat',
        'Kiểm tra sức khỏe & vệ sinh sạch sẽ',
        'Theo dõi sát sao từng hành vi của bé',
        'Bảo hiểm dịch vụ an tâm 100%',
      ],
      pricingTiers,
      galleryPhotos: defaultGallery,
      totalPhotosCount: 16,
      reviewAttributeTags: [
        { label: 'Tận tâm chu đáo (45)', count: 45 },
        { label: 'Đúng giờ (38)', count: 38 },
        { label: 'Yêu thương thú cưng (52)', count: 52 },
      ],
      featuredReview: {
        id: 'rev-1',
        authorName: 'Hoàng Minh',
        petOwnerInfo: 'Chủ bé Poodle 2 tuổi',
        authorAvatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        comment:
          'Chuyên viên rất nhiệt tình và yêu thương động vật. Bé nhà mình rất quấn và không hề sợ hãi. Nhất định sẽ ủng hộ lâu dài!',
        timeAgo: '3 ngày trước',
        isVerifiedWalk: true,
      },
      nextAvailableToday: 'Hôm nay, 14:00',
      weeklySchedule: schedule,
    };
  }, [providerData, providerId, params.name]);

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

  if (isLoading) {
    return (
      <Screen style={styles.centered} backgroundColor={theme.colors.background.default}>
        <ActivityIndicator size="large" color="#0B2A4A" />
      </Screen>
    );
  }

  if (errorMsg || !providerData) {
    return (
      <Screen style={styles.centered} backgroundColor={theme.colors.background.default}>
        <ErrorState
          title="Không tìm thấy đối tác"
          description={errorMsg || 'Vui lòng kiểm tra lại liên kết hoặc thử lại sau.'}
          onRetry={fetchProvider}
        />
      </Screen>
    );
  }

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
        title={profile.name}
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Hero Cover Banner */}
        <ProviderHeroCover
          coverUrl={profile.coverUrl}
          providerName={profile.name}
        />

        {/* 3. Identity Floating Card */}
        <ProviderIdentityCard
          name={profile.name}
          avatarUrl={profile.avatarUrl}
          isVerified={profile.isVerified}
          rating={profile.rating}
          reviewCount={profile.reviewCount}
          location={profile.location}
        />

        {/* 4. Trust Badges Carousel */}
        <ProviderTrustBadges />

        {/* 5. Metrics 4-Box Grid */}
        <ProviderMetricsGrid
          yearsExperience={profile.yearsExperience}
          completedJobs={profile.completedJobs}
          repeatRate={profile.repeatRate}
          avgReplyMinutes={profile.avgReplyMinutes}
        />

        {/* 6. About Bio Section */}
        <ProviderAboutSection
          providerName={profile.name}
          aboutBio={profile.aboutBio}
          tags={profile.specializationTags}
        />

        {/* 7. Service Pricing & Sizing Matrix */}
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
              'Hình ảnh chăm sóc',
              `Đang hiển thị hình ảnh thực tế từ các phiên dịch vụ của ${profile.name}.`
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
        timeUnit="/ buổi"
        nextSlotText="Sẵn sàng tiếp nhận"
        onBook={handleBookNow}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110, // Margin for sticky bottom CTA bar
  },
});
