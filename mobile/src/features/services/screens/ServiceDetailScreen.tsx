import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  StatusBar,
  View,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { ErrorState } from '@/core/components/ErrorState';
import {
  servicesApi,
  ServiceCategory,
  PricingRule,
  ChecklistTemplate,
} from '@/infrastructure/api/services.api';
import { ServiceDetailHeader } from '../components/ServiceDetailHeader';
import { ServiceHeroBanner } from '../components/ServiceHeroBanner';
import { ServiceOverviewCard } from '../components/ServiceOverviewCard';
import { ServiceIncludedGrid } from '../components/ServiceIncludedGrid';
import { PetSizeSelector } from '../components/PetSizeSelector';
import { ServiceAddonsSelector } from '../components/ServiceAddonsSelector';
import { ServicePolicyCard } from '../components/ServicePolicyCard';
import { ServiceBottomBookingBar } from '../components/ServiceBottomBookingBar';
import { ServiceDetail } from '../types/service.types';

// Default service image by category
const getServiceImage = (category?: string | null, name?: string): string => {
  const text = `${category || ''} ${name || ''}`.toLowerCase();
  if (text.includes('groom') || text.includes('tắm') || text.includes('spa') || text.includes('cắt tỉa')) {
    return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';
  }
  if (text.includes('dắt') || text.includes('walk') || text.includes('vận động')) {
    return 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80';
  }
  if (text.includes('hotel') || text.includes('trông') || text.includes('board') || text.includes('nhà')) {
    return 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80';
  }
  if (text.includes('y tế') || text.includes('khám') || text.includes('tiêm') || text.includes('vet')) {
    return 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80';
};

const defaultAddons = [
  {
    id: 'addon-teeth',
    label: 'Vệ sinh răng miệng',
    description: 'Làm sạch mảng bám men răng với gel thảo mộc',
    price: 50000,
  },
  {
    id: 'addon-flea',
    label: 'Xịt ngừa ve rận & bọ chét',
    description: 'Dung dịch thảo mộc an toàn cho da nhạy cảm',
    price: 60000,
  },
  {
    id: 'addon-shampoo',
    label: 'Dầu tắm yến mạch dưỡng lông',
    description: 'Cung cấp ẩm và dưỡng lông suôn mượt cho bé',
    price: 40000,
  },
];

export default function ServiceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; title?: string; providerName?: string }>();
  const serviceId = params.id || '';

  const [rawService, setRawService] = useState<ServiceCategory | null>(null);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Selection states
  const [selectedSizeId, setSelectedSizeId] = useState<string>('');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  // Fetch real service details, pricing rules and checklists from database
  const loadServiceData = useCallback(async () => {
    if (!serviceId) {
      setErrorMsg('Không tìm thấy mã dịch vụ');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const [serviceData, rulesData, checklistData] = await Promise.all([
        servicesApi.getServiceDetails(serviceId),
        servicesApi.getPricingRules(serviceId),
        servicesApi.getChecklistTemplates(serviceId),
      ]);

      if (!serviceData) {
        setErrorMsg('Dịch vụ này hiện không khả dụng hoặc đã bị gỡ.');
        return;
      }

      setRawService(serviceData);
      setPricingRules(rulesData || []);
      setChecklists(checklistData || []);

      // Auto-select first pricing rule or size
      if (rulesData && rulesData.length > 0) {
        setSelectedSizeId(rulesData[0].id);
      } else {
        setSelectedSizeId('default-size');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể tải thông tin dịch vụ từ máy chủ.');
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    loadServiceData();
  }, [loadServiceData]);

  // Construct UI-ready ServiceDetail object
  const service: ServiceDetail = useMemo(() => {
    if (!rawService) {
      return {
        id: serviceId,
        title: params.title || 'Dịch vụ chăm sóc thú cưng',
        categoryTag: 'Dịch vụ chuyên nghiệp',
        completedCount: 120,
        providerId: 'prov-default',
        providerName: params.providerName || 'Chuyên viên PetCare',
        isVerified: true,
        rating: 4.9,
        reviewCount: 48,
        durationText: '60 phút',
        imageUrl: getServiceImage(null, params.title),
        overviewDescription: 'Chăm sóc và phục vụ chu đáo với quy trình tiêu chuẩn cao cấp.',
        includedItems: [],
        petSizes: [],
        addons: defaultAddons,
        suitablePets: 'Thú cưng mọi giống loài và kích cỡ.',
        healthRequirements: 'Cần tiêm phòng dại và mũi phòng bệnh cơ bản đầy đủ.',
        cancellationPolicy: 'Hoàn tiền 100% nếu hủy trước 24 giờ kể từ thời gian dịch vụ bắt đầu.',
      };
    }

    // Map database pricing rules to PetSizes
    let sizes = pricingRules.map((rule) => {
      let label = 'Kích thước';
      let weightRange = '';

      if (rule.minWeight && rule.maxWeight) {
        label = `Cỡ ${rule.minWeight < 10 ? 'Nhỏ' : rule.minWeight < 25 ? 'Vừa' : 'Lớn'}`;
        weightRange = `${rule.minWeight} – ${rule.maxWeight} kg`;
      } else if (rule.minWeight) {
        label = 'Cỡ Lớn';
        weightRange = `> ${rule.minWeight} kg`;
      } else if (rule.maxWeight) {
        label = 'Cỡ Nhỏ';
        weightRange = `< ${rule.maxWeight} kg`;
      } else {
        label = rule.petSpecies === 'CAT' ? 'Mèo cưng' : 'Chó cưng';
        weightRange = 'Tiêu chuẩn';
      }

      return {
        id: rule.id,
        label,
        weightRange,
        price: Number(rule.price),
      };
    });

    if (sizes.length === 0) {
      sizes = [
        {
          id: 'default-size',
          label: 'Gói tiêu chuẩn',
          weightRange: 'Áp dụng cho mọi thú cưng',
          price: Number(rawService.basePrice || 150000),
        },
      ];
    }

    // Map database checklist templates to Included items
    let included = checklists.map((item) => ({
      id: item.id,
      title: item.title,
      iconName: 'check_circle',
    }));

    if (included.length === 0) {
      included = [
        { id: 'inc-1', title: 'Khám kiểm tra thể trạng ban đầu', iconName: 'bath' },
        { id: 'inc-2', title: 'Thực hiện dịch vụ theo đúng quy trình', iconName: 'blow_dry' },
        { id: 'inc-3', title: 'Hình ảnh & video nghiệm thu gửi chủ nuôi', iconName: 'hair_trim' },
        { id: 'inc-4', title: 'Vệ sinh & khử khuẩn sạch sẽ trước khi bàn giao', iconName: 'brush' },
      ];
    }

    return {
      id: rawService.id,
      title: rawService.name,
      categoryTag: rawService.category || 'Dịch vụ chuyên nghiệp',
      completedCount: 250,
      providerId: 'prov-01',
      providerName: params.providerName || 'PetCare Certified Specialist',
      isVerified: true,
      rating: rawService.rating || 4.95,
      reviewCount: rawService.reviewCount || 86,
      durationText: `${rawService.durationMinutes || 60} phút`,
      imageUrl: rawService.imageUrl || getServiceImage(rawService.category, rawService.name),
      overviewDescription:
        rawService.description ||
        'Dịch vụ chuẩn 5 sao từ đội ngũ chuyên viên PetCare, cam kết mang đến trải nghiệm an toàn, nhẹ nhàng và thoải mái nhất cho bé cưng.',
      includedItems: included,
      petSizes: sizes,
      addons: defaultAddons,
      suitablePets: 'Thích hợp cho chó, mèo mọi giống loài và tính cách.',
      healthRequirements: 'Bé cần được tiêm phòng bệnh cơ bản đầy đủ và không mắc bệnh truyền nhiễm.',
      cancellationPolicy: 'Hoàn tiền 100% nếu hủy trước 24 giờ kể từ thời điểm hẹn.',
    };
  }, [rawService, pricingRules, checklists, serviceId, params.title, params.providerName]);

  // Calculate live total price
  const totalPrice = useMemo(() => {
    const selectedSize = service.petSizes.find((s) => s.id === selectedSizeId);
    const basePrice = selectedSize ? selectedSize.price : (service.petSizes[0]?.price || 0);

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

  if (isLoading) {
    return (
      <Screen style={styles.centered} backgroundColor={theme.colors.background.default}>
        <ActivityIndicator size="large" color="#0B2A4A" />
      </Screen>
    );
  }

  if (errorMsg || !rawService) {
    return (
      <Screen style={styles.centered} backgroundColor={theme.colors.background.default}>
        <ErrorState
          title="Không tìm thấy dịch vụ"
          description={errorMsg || 'Vui lòng kiểm tra lại đường dẫn hoặc thử lại sau.'}
          onRetry={loadServiceData}
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

      {/* 1. Header Navigation */}
      <ServiceDetailHeader
        title={service.title}
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
        {service.petSizes.length > 0 && (
          <PetSizeSelector
            sizes={service.petSizes}
            selectedSizeId={selectedSizeId || service.petSizes[0]?.id}
            onSelectSize={setSelectedSizeId}
          />
        )}

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
    paddingBottom: 110, // Margin for sticky bottom booking bar
  },
});
