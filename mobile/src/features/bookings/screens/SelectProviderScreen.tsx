import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, MapPin, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { BookingStepHeader } from '../components/BookingStepHeader';
import { BookingCriteriaSummaryCard } from '../components/BookingCriteriaSummaryCard';
import { ProviderSortFilterBar } from '../components/ProviderSortFilterBar';
import { MatchedProviderCard } from '../components/MatchedProviderCard';
import { BookingSafetyBanner } from '../components/BookingSafetyBanner';
import { BookingBottomActions } from '../components/BookingBottomActions';
import { MatchedProviderItem } from '../types/booking.types';
import { useBookingFlow } from '../context/BookingContext';
import { addressApi } from '@/features/addresses/api/addressApi';
import { bookingsApi } from '@/infrastructure/api/bookings.api';

export default function SelectProviderScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useBookingFlow();
  const params = useLocalSearchParams<{
    serviceId?: string;
    serviceTitle?: string;
    providerName?: string;
    price?: string;
    selectedSizeId?: string;
    selectedAddonIds?: string;
    petId?: string;
    petName?: string;
    petBreed?: string;
    petAvatarUrl?: string;
    petWeight?: string;
    day?: string;
    date?: string;
    slotTime?: string;
    addressId?: string;
  }>();

  const [providers, setProviders] = useState<MatchedProviderItem[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedFilterId, setSelectedFilterId] = useState<string>('best_match');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(params.addressId || draft.addressId || '');
  const [selectedAddressLine, setSelectedAddressLine] = useState<string>(draft.addressLine || '');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const petName = params.petName || draft.petName || 'Thú cưng';
  const petSpecies = draft.petSpecies || 'Dog';
  const petWeight = params.petWeight || (draft.petWeight ? `${draft.petWeight} kg` : '5 kg');
  const serviceTitle = params.serviceTitle || draft.serviceTitle || 'Chăm sóc thú cưng';
  const slotTime = params.slotTime || draft.timeSlot || '07:00 - 09:00';
  const day = params.day || '20';
  const bookingDate = params.date || draft.bookingDate || new Date().toISOString().split('T')[0];
  const dateSlotText = `Ngày ${day} · ${slotTime}`;

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // 1. Fetch addresses
      let activeAddressId = params.addressId || selectedAddressId || draft.addressId;
      let activeAddressLine = selectedAddressLine || draft.addressLine;

      if (!activeAddressId) {
        try {
          const addrRes: any = await addressApi.getAddresses();
          const addrList = Array.isArray(addrRes)
            ? addrRes
            : Array.isArray(addrRes?.data)
            ? addrRes.data
            : [];
          setAddresses(addrList);

          if (addrList.length > 0) {
            const defaultAddr = addrList.find((a: any) => a.isDefault || a.is_default) || addrList[0];
            activeAddressId = defaultAddr.id;
            activeAddressLine = `${(defaultAddr as any).addressLine || (defaultAddr as any).address_line || ''}, ${
              defaultAddr.ward ? defaultAddr.ward + ', ' : ''
            }${defaultAddr.district || ''}, ${defaultAddr.city || ''}`;
            setSelectedAddressId(activeAddressId || '');
            setSelectedAddressLine(activeAddressLine || '');
            updateDraft({
              addressId: activeAddressId || '',
              addressLine: activeAddressLine || '',
            });
          }
        } catch (addrErr) {
          // continue
        }
      }

      // 2. Search matching providers from DB
      const petId = params.petId || draft.petId;
      const serviceId = params.serviceId || draft.serviceId;

      if (petId && serviceId && activeAddressId) {
        const matchedRes: any = await bookingsApi.searchMatchingProviders({
          petId,
          serviceId,
          addressId: activeAddressId,
          date: bookingDate,
        });

        const list: any[] = Array.isArray(matchedRes)
          ? matchedRes
          : Array.isArray(matchedRes?.data)
          ? matchedRes.data
          : [];

        if (list.length > 0) {
          const mapped: MatchedProviderItem[] = list.map((p, idx) => {
            const matchedSlot = p.slots?.find((s: any) => {
              const fullTime = `${s.startTime} - ${s.endTime}`;
              return fullTime === slotTime || s.startTime === slotTime.split(' - ')[0] || s.slotId === params.slotId || s.slotId === draft.slotId;
            }) || p.slots?.[0];

            return {
              id: p.providerId,
              name: p.fullName || `Chuyên viên ${idx + 1}`,
              avatarUrl:
                p.avatarUrl ||
                'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
              tagline: 'Chuyên viên đối tác PetCare',
              isVerified: true,
              isHomeVisit: true,
              rating: p.ratingAvg || 4.9,
              reviewCount: (p.totalCompletedBookings || 5) * 2 + 10,
              completedJobs: p.totalCompletedBookings || 10,
              compatibilityScore: Math.round(p.score) || 98,
              isBestChoice: idx === 0,
              matchReasons:
                p.recommendationReasons && p.recommendationReasons.length > 0
                  ? p.recommendationReasons
                  : [`Chuyên chăm sóc ${petSpecies === 'Cat' ? 'mèo' : 'chó'} (${petWeight})`],
              price: p.servicePrice || draft.servicePrice || 250000,
              priceSubtext: 'Giá dịch vụ theo loài & cân nặng',
              earliestSlot: matchedSlot
                ? `${matchedSlot.startTime} - ${matchedSlot.endTime}`
                : slotTime,
              providerWorkingSlotId: matchedSlot?.providerWorkingSlotId || p.slots?.[0]?.providerWorkingSlotId,
            };
          });

          setProviders(mapped);
          setSelectedProviderId(mapped[0].id);

          // Update draft with first matched provider info
          updateDraft({
            providerId: mapped[0].id,
            providerName: mapped[0].name,
            providerAvatar: mapped[0].avatarUrl,
            providerRating: mapped[0].rating,
            providerWorkingSlotId: mapped[0].providerWorkingSlotId,
            servicePrice: mapped[0].price,
          });
        } else {
          setProviders([]);
          setSelectedProviderId('');
          setErrorMessage('Không tìm thấy chuyên viên phù hợp cho tiêu chí này. Hãy thử đổi ngày làm việc.');
        }
      } else {
        setProviders([]);
        if (!activeAddressId) {
          setErrorMessage('Chưa có địa chỉ. Vui lòng thêm hoặc chọn địa chỉ nhận dịch vụ.');
        } else if (!petId) {
          setErrorMessage('Chưa chọn thú cưng.');
        } else if (!serviceId) {
          setErrorMessage('Chưa chọn dịch vụ.');
        }
      }
    } catch (e: any) {
      console.error('Lỗi searchMatchingProviders:', e);
      setErrorMessage(e?.message || 'Không thể tải danh sách chuyên viên');
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [bookingDate, params.petId, draft.petId, params.serviceId, draft.serviceId, selectedAddressId, draft.addressId]);

  // Filtered providers
  const filteredProviders = useMemo(() => {
    let list = [...providers];
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
  }, [providers, selectedFilterId]);

  const handleContinue = () => {
    const selectedProvider = providers.find((p) => p.id === selectedProviderId) || providers[0];
    if (!selectedProvider) return;

    const finalAddressId = selectedAddressId || draft.addressId || addresses[0]?.id || '';
    const finalAddressLine = selectedAddressLine || draft.addressLine || '';
    const finalWorkingSlotId = selectedProvider.providerWorkingSlotId || draft.providerWorkingSlotId || '';

    if (!finalAddressId) {
      Alert.alert(
        'Chưa có địa chỉ nhận dịch vụ',
        'Vui lòng thêm hoặc chọn địa chỉ nhận dịch vụ để tiếp tục.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Thêm địa chỉ ngay', onPress: () => router.push('/(customer)/addresses/add') },
        ]
      );
      return;
    }

    if (!finalWorkingSlotId) {
      Alert.alert(
        'Chưa có ca làm việc',
        'Chuyên viên chưa có ca làm việc khả dụng trong khung giờ này. Vui lòng chọn ca hoặc ngày khác.'
      );
      return;
    }

    // Save selected provider and address into BookingContext
    updateDraft({
      providerId: selectedProvider.id,
      providerName: selectedProvider.name,
      providerAvatar: selectedProvider.avatarUrl,
      providerRating: selectedProvider.rating,
      providerWorkingSlotId: finalWorkingSlotId,
      addressId: finalAddressId,
      addressLine: finalAddressLine,
      servicePrice: selectedProvider.price,
    });

    router.push({
      pathname: '/(customer)/bookings/review-summary',
      params: {
        serviceId: params.serviceId || draft.serviceId || '',
        serviceTitle: serviceTitle,
        providerId: selectedProvider.id,
        providerName: selectedProvider.name,
        providerAvatar: selectedProvider.avatarUrl,
        providerRating: String(selectedProvider.rating || 4.9),
        providerWorkingSlotId: finalWorkingSlotId,
        addressId: finalAddressId,
        addressLine: finalAddressLine,
        petId: params.petId || draft.petId || '',
        petName: petName,
        petBreed: params.petBreed || draft.petBreed || (petSpecies === 'Cat' ? 'Mèo' : 'Chó'),
        petAvatarUrl: params.petAvatarUrl || draft.petAvatarUrl,
        petWeight: petWeight,
        day: day,
        date: bookingDate,
        slotTime: slotTime,
        basePrice: String(selectedProvider.price),
        selectedSizeId: params.selectedSizeId,
        selectedAddonIds: params.selectedAddonIds,
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
      <BookingStepHeader
        title="Chọn Chuyên viên"
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
              <Text style={styles.nodeLabel}>Thú cưng</Text>
            </View>

            <View style={styles.nodeLineCompleted} />

            {/* Step 2: Date & Time (Completed) */}
            <View style={styles.nodeCol}>
              <View style={styles.nodeCircleCompleted}>
                <Check size={14} color={theme.colors.text.inverse} strokeWidth={3} />
              </View>
              <Text style={styles.nodeLabel}>Ngày & Giờ</Text>
            </View>

            <View style={styles.nodeLineActive} />

            {/* Step 3: Provider (Active) */}
            <View style={styles.nodeCol}>
              <View style={styles.nodeCircleActive}>
                <Text style={styles.nodeNumberActive}>3</Text>
              </View>
              <Text style={styles.nodeLabelActive}>Chuyên viên</Text>
            </View>

            <View style={styles.nodeLineInactive} />

            {/* Step 4: Payment */}
            <View style={styles.nodeCol}>
              <View style={styles.nodeCircleInactive}>
                <Text style={styles.nodeNumberInactive}>4</Text>
              </View>
              <Text style={styles.nodeLabelInactive}>Thanh toán</Text>
            </View>
          </View>

          {/* Title and Step badge */}
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              <Text style={styles.screenTitle}>Chuyên viên phù hợp</Text>
              <View style={styles.stepPill}>
                <Text style={styles.stepPillText}>Bước 3 / 4</Text>
              </View>
            </View>
            <Text style={styles.screenSubtitle}>
              Chuyên viên nhận dịch vụ cho bé {petName} ({petSpecies === 'Cat' ? 'Mèo' : 'Chó'} · {petWeight})
            </Text>
          </View>
        </View>

        {/* 3. Address Preview / Interactive Selector */}
        <TouchableOpacity
          style={styles.addressBar}
          onPress={() => router.push('/(customer)/addresses')}
          activeOpacity={0.7}
        >
          <MapPin size={16} color={theme.colors.primary.navy} />
          <View style={{ flex: 1 }}>
            <Text style={styles.addressText} numberOfLines={1}>
              {selectedAddressLine ? `Địa chỉ: ${selectedAddressLine}` : 'Chưa chọn địa chỉ - Nhấn để thêm'}
            </Text>
          </View>
          <ChevronRight size={16} color={theme.colors.text.tertiary} />
        </TouchableOpacity>

        {/* 4. Booking Criteria Summary Card */}
        <BookingCriteriaSummaryCard
          petName={petName}
          serviceTitle={serviceTitle}
          dateSlotText={dateSlotText}
          onEdit={() => router.back()}
        />

        {/* 5. Quick Sort & Filter Bar */}
        {providers.length > 0 && (
          <ProviderSortFilterBar
            selectedFilterId={selectedFilterId}
            onSelectFilter={setSelectedFilterId}
          />
        )}

        {/* 6. Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {providers.length > 0
              ? `${filteredProviders.length} Chuyên viên từ cơ sở dữ liệu`
              : 'Kết quả tìm kiếm đối tác'}
          </Text>
          {providers.length > 0 && (
            <Text style={styles.resultsSort}>Kiểm tra loài & cân nặng</Text>
          )}
        </View>

        {/* 7. Matched Provider Cards List */}
        <View style={styles.providersList}>
          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={theme.colors.primary.navy} />
              <Text style={styles.loadingText}>
                Đang kiểm tra chuyên viên nhận {petSpecies === 'Cat' ? 'mèo' : 'chó'} ({petWeight})...
              </Text>
            </View>
          ) : filteredProviders.length > 0 ? (
            filteredProviders.map((provider) => (
              <MatchedProviderCard
                key={provider.id}
                provider={provider}
                isSelected={selectedProviderId === provider.id}
                petName={petName}
                onSelect={() => {
                  setSelectedProviderId(provider.id);
                  updateDraft({
                    providerId: provider.id,
                    providerName: provider.name,
                    providerAvatar: provider.avatarUrl,
                    providerRating: provider.rating,
                    providerWorkingSlotId: provider.providerWorkingSlotId,
                    servicePrice: provider.price,
                  });
                }}
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
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <AlertCircle size={32} color={theme.colors.semantic.warning} />
              </View>
              <Text style={styles.emptyTitle}>Chưa tìm thấy chuyên viên phù hợp</Text>
              <Text style={styles.emptySubtitle}>
                Hiện tại chưa có chuyên viên nào nhận {serviceTitle} cho loài{' '}
                <Text style={styles.highlightText}>{petSpecies === 'Cat' ? 'Mèo' : 'Chó'}</Text> ở mức cân nặng{' '}
                <Text style={styles.highlightText}>{petWeight}</Text>.
              </Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={fetchProviders}
                activeOpacity={0.8}
              >
                <RefreshCw size={16} color={theme.colors.primary.navy} />
                <Text style={styles.retryBtnText}>Thử tìm kiếm lại</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 8. Safety Guarantee Banner */}
        <BookingSafetyBanner />
      </ScrollView>

      {/* 9. Bottom Sticky Actions */}
      <BookingBottomActions
        onBack={() => router.back()}
        onNext={handleContinue}
        nextLabel="Tiếp tục xem chi tiết đơn"
        disabled={!selectedProviderId || providers.length === 0}
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
    fontSize: 20,
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
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: theme.spacing[5],
    marginTop: theme.spacing[3],
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  addressText: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.primary.navy,
    fontWeight: '600',
    flex: 1,
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
  loadingBox: {
    padding: theme.spacing[8],
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  emptyContainer: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[6],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    gap: theme.spacing[2],
    marginVertical: theme.spacing[2],
    ...theme.shadows.sm,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    ...theme.typography.label,
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  highlightText: {
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: theme.spacing[3],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.subdued,
  },
  retryBtnText: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
});
