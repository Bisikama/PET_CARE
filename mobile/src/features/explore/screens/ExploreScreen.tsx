import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronDown,
  Star,
  Clock,
  CheckCircle2,
  Heart,
  ArrowRight,
  ShieldCheck,
  Tag,
  Sparkles,
  Calendar,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { EmptyState } from '@/core/components/EmptyState';
import { theme } from '@/core/theme';
import { formatCurrency } from '@/core/utils/currency';
import { useAuth } from '../../auth/context/AuthContext';
import { ExploreHeader } from '../components/ExploreHeader';
import { ExploreSearchBar } from '../components/ExploreSearchBar';
import { CategoryChips } from '../components/CategoryChips';
import { QuickFilterPills } from '../components/QuickFilterPills';
import { servicesApi, ServiceCategory } from '@/infrastructure/api/services.api';

// Fallback services if offline
const fallbackServices: ServiceCategory[] = [
  {
    id: 'a23b1234-abcd-4234-8f01-000000000004',
    name: 'Dịch vụ Tắm rửa & Cắt tỉa lông thú cưng',
    description: 'Tắm rửa vệ sinh tai, móng và cắt tỉa lông tạo kiểu chuyên nghiệp.',
    category: 'GROOMING',
    basePrice: 250000,
    durationMinutes: 90,
    isActive: true,
  },
  {
    id: 'a23b1234-abcd-4234-8f01-000000000001',
    name: 'Dịch vụ Chăm sóc chó tại nhà',
    description: 'Chăm sóc, cho ăn, chơi với cún tại nhà khách hàng an tâm.',
    category: 'SITTING',
    basePrice: 150000,
    durationMinutes: 60,
    isActive: true,
  },
  {
    id: 'a23b1234-abcd-4234-8f01-000000000002',
    name: 'Dịch vụ Dắt chó đi dạo',
    description: 'Dắt chó đi dạo giải tỏa căng thẳng và vận động thể chất.',
    category: 'WALKING',
    basePrice: 100000,
    durationMinutes: 45,
    isActive: true,
  },
  {
    id: 'a23b1234-abcd-4234-8f01-000000000003',
    name: 'Dịch vụ Chăm sóc mèo tại nhà',
    description: 'Chăm sóc, cho ăn, dọn cát và chơi với mèo tại nhà.',
    category: 'SITTING',
    basePrice: 120000,
    durationMinutes: 60,
    isActive: true,
  },
  {
    id: 'c1382d0e-b6e5-4ed6-963f-0f240faff11a',
    name: 'Thăm khám thú y (Vet Checkup)',
    description: 'Bác sĩ thú y kiểm tra sức khỏe tổng quát, mắt mũi tai và tư vấn dinh dưỡng.',
    category: 'VET',
    basePrice: 300000,
    durationMinutes: 60,
    isActive: true,
  },
];

const getServiceImage = (service: ServiceCategory): string => {
  const cat = (service.category || '').toLowerCase();
  const name = (service.name || '').toLowerCase();

  if (cat.includes('groom') || name.includes('tắm') || name.includes('cắt tỉa') || name.includes('spa')) {
    return 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80';
  }
  if (cat.includes('walk') || name.includes('dạo')) {
    return 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80';
  }
  if (cat.includes('sit') || name.includes('mèo') || name.includes('chăm sóc')) {
    if (name.includes('mèo')) {
      return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80';
    }
    return 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80';
  }
  if (cat.includes('vet') || name.includes('thú y') || name.includes('khám')) {
    return 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80';
  }
  if (cat.includes('hotel') || name.includes('khách sạn')) {
    return 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80';
  }
  return 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80';
};

const getCategoryBadgeLabel = (category?: string | null): { label: string; bg: string; text: string } => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('groom')) return { label: 'Grooming & Spa', bg: '#EFF6FF', text: '#1D4ED8' };
  if (cat.includes('sit')) return { label: 'Pet Sitting', bg: '#FDF2F8', text: '#BE185D' };
  if (cat.includes('walk')) return { label: 'Dog Walking', bg: '#ECFDF5', text: '#047857' };
  if (cat.includes('vet')) return { label: 'Thú Y / Vet', bg: '#FEF3C7', text: '#B45309' };
  if (cat.includes('hotel')) return { label: 'Khách Sạn', bg: '#F5F3FF', text: '#6D28D9' };
  return { label: category || 'Chăm sóc', bg: '#F1F5F9', text: '#475569' };
};

const matchCategory = (serviceCategory?: string | null, serviceName?: string, filter?: string): boolean => {
  if (!filter || filter === 'all') return true;
  const s = `${serviceCategory || ''} ${serviceName || ''}`.toLowerCase();
  const f = filter.toLowerCase();

  if (f === 'grooming') return s.includes('groom') || s.includes('tắm') || s.includes('cắt tỉa') || s.includes('spa');
  if (f === 'sitting') return s.includes('sit') || s.includes('chăm sóc') || s.includes('trông giữ');
  if (f === 'walking') return s.includes('walk') || s.includes('dạo');
  if (f === 'veterinary' || f === 'vet') return s.includes('vet') || s.includes('thú y') || s.includes('khám');
  if (f === 'hotel') return s.includes('hotel') || s.includes('khách sạn');
  if (f === 'training') return s.includes('train') || s.includes('huấn luyện');
  return s.includes(f);
};

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; query?: string }>();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState(params.query || '');
  const [selectedCategory, setSelectedCategory] = useState(params.category || 'all');
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const fetchServices = useCallback(async () => {
    try {
      const data = await servicesApi.getAllServices();
      if (data && data.length > 0) {
        setServices(data);
      } else {
        setServices(fallbackServices);
      }
    } catch (e) {
      setServices(fallbackServices);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category);
    }
  }, [params.category]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchServices();
  }, [fetchServices]);

  const handleToggleFavorite = (serviceId: string) => {
    setFavorites((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  const handleToggleQuickFilter = (filterId: string) => {
    setActiveQuickFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleServiceDetail = (item: ServiceCategory) => {
    router.push(`/(customer)/service/${item.id}`);
  };

  const handleBookService = (item: ServiceCategory) => {
    router.push({
      pathname: '/(customer)/bookings/select-pet',
      params: {
        serviceId: item.id,
        serviceTitle: item.name,
        price: String(item.basePrice),
      },
    });
  };

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((item) => {
      // 1. Category filter
      if (!matchCategory(item.category, item.name, selectedCategory)) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesCat = (item.category || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) {
          return false;
        }
      }

      // 3. Quick filters
      if (activeQuickFilters.includes('under_200k') && item.basePrice > 200000) {
        return false;
      }
      if (activeQuickFilters.includes('short_duration') && item.durationMinutes > 60) {
        return false;
      }

      return true;
    });
  }, [services, selectedCategory, searchQuery, activeQuickFilters]);

  return (
    <Screen
      withPadding={false}
      backgroundColor={theme.colors.background.default}
      edges={['top', 'left', 'right']}
      style={styles.screen}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.default} />

      {/* Header */}
      <ExploreHeader
        hasUnreadNotifications={true}
        onNotificationPress={() => Alert.alert('Thông báo', 'Khám phá ưu đãi chăm sóc thú cưng mới nhất')}
        onProfilePress={() => router.push('/(customer)/(tabs)/profile')}
      />

      {loading ? (
        <View style={styles.centeredLoading}>
          <ActivityIndicator size="large" color={theme.colors.primary.navy} />
          <Text style={styles.loadingText}>Đang tải danh sách dịch vụ...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary.navy}
              colors={[theme.colors.primary.navy]}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerSection}>
              {/* Search Bar */}
              <ExploreSearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onClear={() => setSearchQuery('')}
                onFilterPress={() => Alert.alert('Bộ lọc nâng cao', 'Tính năng lọc theo bảng giá & thời lượng')}
              />

              {/* Category Chips */}
              <CategoryChips
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

              {/* Quick Filters */}
              <QuickFilterPills
                activeFilters={activeQuickFilters}
                onToggleFilter={handleToggleQuickFilter}
              />

              {/* Results Info */}
              <View style={styles.resultsInfoRow}>
                <Text style={styles.resultsCountText}>
                  Hiển thị <Text style={styles.resultsBold}>{filteredServices.length} dịch vụ</Text> sẵn sàng đặt lịch
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const badge = getCategoryBadgeLabel(item.category);
            const image = getServiceImage(item);
            const isFav = !!favorites[item.id];

            return (
              <View style={styles.cardContainer}>
                <TouchableOpacity
                  style={styles.serviceCard}
                  activeOpacity={0.9}
                  onPress={() => handleServiceDetail(item)}
                >
                  {/* Top: Image + Badges */}
                  <View style={styles.cardTopRow}>
                    <Image source={{ uri: image }} style={styles.serviceImage} />

                    <View style={styles.serviceMainCol}>
                      <View style={styles.badgeAndFavRow}>
                        <View style={[styles.categoryBadge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.categoryBadgeText, { color: badge.text }]}>
                            {badge.label}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.favBtn}
                          onPress={() => handleToggleFavorite(item.id)}
                          activeOpacity={0.7}
                        >
                          <Heart
                            size={16}
                            color={isFav ? theme.colors.semantic.error : theme.colors.text.muted}
                            fill={isFav ? theme.colors.semantic.error : 'transparent'}
                          />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.serviceName} numberOfLines={2}>
                        {item.name}
                      </Text>

                      <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                          <Clock size={13} color={theme.colors.text.muted} />
                          <Text style={styles.metaText}>{item.durationMinutes} phút</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Star size={13} color="#F59E0B" fill="#F59E0B" />
                          <Text style={styles.metaText}>4.9 (150+ đánh giá)</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Description */}
                  {item.description && (
                    <Text style={styles.serviceDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}

                  {/* Bottom: Price + Action Button */}
                  <View style={styles.cardBottomRow}>
                    <View style={styles.priceCol}>
                      <Text style={styles.priceLabel}>Giá gốc từ</Text>
                      <Text style={styles.priceValue}>
                        {formatCurrency(item.basePrice)} đ
                      </Text>
                    </View>

                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.bookNowBtn}
                        onPress={() => handleBookService(item)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.bookNowBtnText}>Đặt lịch ngay</Text>
                        <ArrowRight size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EmptyState
                title="Không tìm thấy dịch vụ phù hợp"
                description="Thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác nhé."
              />
            </View>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centeredLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
  },
  listContent: {
    paddingBottom: 40,
  },
  headerSection: {
    paddingBottom: theme.spacing[2],
  },
  resultsInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[1],
    paddingBottom: theme.spacing[2],
  },
  resultsCountText: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  resultsBold: {
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  cardContainer: {
    paddingHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[4],
  },
  serviceCard: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.subdued,
  },
  serviceMainCol: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  badgeAndFavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: theme.radius.full,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  favBtn: {
    padding: 4,
  },
  serviceName: {
    ...theme.typography.h4,
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primary.navy,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  serviceDescription: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 17,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subdued,
    marginTop: 2,
  },
  priceCol: {
    gap: 1,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.muted,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary.navy,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: theme.radius.lg,
    ...theme.shadows.sm,
  },
  bookNowBtnText: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
  emptyContainer: {
    paddingVertical: theme.spacing[10],
  },
});
