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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { EmptyState } from '@/core/components/EmptyState';
import { theme } from '@/core/theme';
import { useAuth } from '../../auth/context/AuthContext';
import { ExploreHeader } from '../components/ExploreHeader';
import { ExploreSearchBar } from '../components/ExploreSearchBar';
import { CategoryChips } from '../components/CategoryChips';
import { QuickFilterPills } from '../components/QuickFilterPills';
import { ExploreProviderCard } from '../components/ExploreProviderCard';
import { MapViewPill } from '../components/MapViewPill';
import { ExploreProviderItem } from '../types/explore.types';

const mockProviders: ExploreProviderItem[] = [
  {
    id: 'prov-01',
    name: 'Happy Paws Care',
    imageUrl:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    rating: 4.9,
    reviewCount: 320,
    distanceKm: 1.2,
    statusText: 'Open Now',
    statusColor: 'emerald',
    description:
      'Premium grooming, gentle bathing & pet sitting in safe studio with licensed vet technicians.',
    tags: ['Grooming', 'Bathing', 'Pet Sitting'],
    startingPrice: 200000,
    category: 'grooming',
    isFavorite: true,
  },
  {
    id: 'prov-02',
    name: 'FurEver Friends Spa',
    imageUrl:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    rating: 4.8,
    reviewCount: 195,
    distanceKm: 2.5,
    statusText: 'Next: 2:00 PM',
    statusColor: 'amber',
    description:
      'Veterinary supervised dog walking and specialized rehabilitation grooming sessions.',
    tags: ['Dog Walking', 'Training', 'Rehab Care'],
    startingPrice: 150000,
    category: 'walking',
    isFavorite: false,
  },
  {
    id: 'prov-03',
    name: 'Dr. Pet Holistic Clinic',
    imageUrl:
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    rating: 5.0,
    reviewCount: 410,
    distanceKm: 3.1,
    statusText: 'Emergency Available',
    statusColor: 'emerald',
    description:
      'Full medical checkups, dental cleanings and air-conditioned luxury pet hotel suites with 24/7 webcams.',
    tags: ['Veterinary', 'Pet Hotel', 'Dental'],
    startingPrice: 350000,
    category: 'veterinary',
    isFavorite: false,
  },
  {
    id: 'prov-04',
    name: 'Pawsome Hotel & Resort',
    imageUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    rating: 4.9,
    reviewCount: 240,
    distanceKm: 4.2,
    statusText: 'Open Now',
    statusColor: 'emerald',
    description:
      'Spacious indoor playparks, individual suites, and 24/7 care for dogs and cats.',
    tags: ['Pet Hotel', 'Daycare', 'Grooming'],
    startingPrice: 280000,
    category: 'hotel',
    isFavorite: false,
  },
  {
    id: 'prov-05',
    name: 'K9 Academy Pro Training',
    imageUrl:
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    rating: 4.9,
    reviewCount: 168,
    distanceKm: 3.8,
    statusText: 'Next Slot: Tomorrow',
    statusColor: 'navy',
    description:
      'Positive reinforcement obedience training, behavior modification, and puppy foundation courses.',
    tags: ['Training', 'Behavior', 'Puppy Care'],
    startingPrice: 400000,
    category: 'training',
    isFavorite: false,
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; query?: string }>();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState(params.query || '');
  const [selectedCategory, setSelectedCategory] = useState(params.category || 'all');
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [providers, setProviders] = useState<ExploreProviderItem[]>(mockProviders);
  const [refreshing, setRefreshing] = useState(false);
  const [isMapView, setIsMapView] = useState(false);

  // Synchronize category if query params change (e.g. from Home navigation)
  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category);
    }
  }, [params.category]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  const handleToggleFavorite = (providerId: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId ? { ...p, isFavorite: !p.isFavorite } : p
      )
    );
  };

  const handleToggleQuickFilter = (filterId: string) => {
    setActiveQuickFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleProviderPress = (item: ExploreProviderItem) => {
    router.push({
      pathname: '/(customer)/services/[id]',
      params: {
        id: item.id,
        title: item.category === 'grooming' ? 'Premium Dog Grooming' : `${item.name} Service`,
        providerName: item.name,
      },
    });
  };

  // Filtered providers
  const filteredProviders = useMemo(() => {
    return providers.filter((item) => {
      // 1. Category filter
      if (
        selectedCategory !== 'all' &&
        item.category.toLowerCase() !== selectedCategory.toLowerCase() &&
        !item.tags.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase()))
      ) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTag = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTag) {
          return false;
        }
      }

      // 3. Quick filters
      if (activeQuickFilters.includes('near_me') && item.distanceKm > 3.0) {
        return false;
      }
      if (activeQuickFilters.includes('top_rated') && item.rating < 4.9) {
        return false;
      }
      if (
        activeQuickFilters.includes('available_today') &&
        !item.statusText.toLowerCase().includes('open') &&
        !item.statusText.toLowerCase().includes('available')
      ) {
        return false;
      }

      return true;
    });
  }, [providers, selectedCategory, searchQuery, activeQuickFilters]);

  return (
    <Screen
      withPadding={false}
      backgroundColor={theme.colors.background.default}
      edges={['top', 'left', 'right']}
      style={styles.screen}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.default} />

      {/* 1. Header (Brand Logo, Notification & Avatar) */}
      <ExploreHeader
        hasUnreadNotifications={true}
        onNotificationPress={() => Alert.alert('Thông báo', 'Khám phá ưu đãi chăm sóc thú cưng mới nhất')}
        onProfilePress={() => router.push('/(customer)/change-password')}
      />

      <FlatList
        data={filteredProviders}
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
            {/* 2. Search Bar + Tune button */}
            <ExploreSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery('')}
              onFilterPress={() => Alert.alert('Bộ lọc nâng cao', 'Tính năng lọc theo khoảng giá & khu vực')}
            />

            {/* 3. Category Chips */}
            <CategoryChips
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* 4. Micro Quick Filters */}
            <QuickFilterPills
              activeFilters={activeQuickFilters}
              onToggleFilter={handleToggleQuickFilter}
            />

            {/* 5. Results Count & Sort Dropdown */}
            <View style={styles.resultsInfoRow}>
              <Text style={styles.resultsCountText}>
                Showing{' '}
                <Text style={styles.resultsBold}>
                  {filteredProviders.length} verified
                </Text>{' '}
                specialists
              </Text>

              <TouchableOpacity
                style={styles.sortButton}
                activeOpacity={0.7}
                onPress={() => Alert.alert('Sắp xếp', 'Sắp xếp theo: Khoảng cách, Đánh giá, Giá')}
              >
                <Text style={styles.sortText}>Distance</Text>
                <ChevronDown size={14} color={theme.colors.primary.navy} />
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <ExploreProviderCard
              provider={item}
              onPress={() => handleProviderPress(item)}
              onBook={() => handleProviderPress(item)}
              onToggleFavorite={handleToggleFavorite}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              title="Không tìm thấy dịch vụ phù hợp"
              description="Thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác nhé."
            />
          </View>
        }
      />

      {/* Floating Map View Pill */}
      <MapViewPill
        isMapView={isMapView}
        onToggle={() => {
          setIsMapView(!isMapView);
          Alert.alert(
            isMapView ? 'Chế độ Danh sách' : 'Chế độ Bản đồ',
            'Đang chuyển đổi góc nhìn dịch vụ'
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 90, // Space for floating map view pill and bottom tab bar
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
    color: theme.colors.text.secondary,
  },
  resultsBold: {
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  sortText: {
    ...theme.typography.label,
    color: theme.colors.primary.navy,
    fontWeight: '700',
  },
  cardContainer: {
    paddingHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[4],
  },
  emptyContainer: {
    paddingVertical: theme.spacing[10],
  },
});
