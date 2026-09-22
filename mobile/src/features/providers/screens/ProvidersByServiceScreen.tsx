import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '../../../core/components/Screen';
import { EmptyState } from '../../../core/components/EmptyState';
import { ErrorState } from '../../../core/components/ErrorState';
import { serviceDiscoveryApi, RecommendedProvider } from '../../../infrastructure/api/services.api';
import { ProviderCard } from '../../home/components/ProviderCard';
import { Input } from '../../../core/components/Input';
import { theme } from '../../../core/theme';
import { ChevronLeft, Search, SlidersHorizontal } from 'lucide-react-native';

type SortOption = 'recommend' | 'price_asc' | 'price_desc' | 'rating_desc';

export default function ProvidersByServiceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recommend');

  const fetchProviders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await serviceDiscoveryApi.discoverProviders({ serviceId: id });
      // The API might return array of objects that have a provider_profiles nested or RecommendedProvider directly.
      // Based on our types, it returns RecommendedProvider[].
      setProviders(res);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách đối tác cung cấp dịch vụ này.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProviders();
    }
  }, [id]);

  const filteredAndSortedProviders = React.useMemo(() => {
    let result = [...providers];
    
    // 1. Search Filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p => p.fullName?.toLowerCase().includes(lowerQuery));
    }
    
    // 2. Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating_desc':
        result.sort((a, b) => {
          const ratingA = a.rating !== undefined ? a.rating : (a.ratingAvg || 0);
          const ratingB = b.rating !== undefined ? b.rating : (b.ratingAvg || 0);
          return ratingB - ratingA;
        });
        break;
      case 'recommend':
      default:
        // Already sorted by recommend score from backend (discoverProviders)
        // If it's RecommendedProvider, it's also sorted by rating desc from backend
        // So we don't strictly need to do anything, or we can sort by score if it exists
        result.sort((a, b) => (b.score || 0) - (a.score || 0));
        break;
    }
    
    return result;
  }, [providers, searchQuery, sortBy]);

  return (
    <Screen style={styles.container} backgroundColor={theme.colors.background.default} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h2, { color: theme.colors.text.primary, marginLeft: theme.spacing[3] }]}>
          Chọn đối tác
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={theme.colors.text.secondary} style={styles.searchIcon} />
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm đối tác..."
            containerStyle={styles.searchInputContainer}
          />
        </View>
      </View>

      {/* Sort Options */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortContainer}>
          <TouchableOpacity 
            style={[styles.sortPill, sortBy === 'recommend' && styles.sortPillActive]}
            onPress={() => setSortBy('recommend')}
          >
            <SlidersHorizontal size={14} color={sortBy === 'recommend' ? '#fff' : theme.colors.text.secondary} />
            <Text style={[styles.sortText, sortBy === 'recommend' && styles.sortTextActive]}>Đề xuất</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortPill, sortBy === 'rating_desc' && styles.sortPillActive]}
            onPress={() => setSortBy('rating_desc')}
          >
            <Text style={[styles.sortText, sortBy === 'rating_desc' && styles.sortTextActive]}>Đánh giá cao</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortPill, sortBy === 'price_asc' && styles.sortPillActive]}
            onPress={() => setSortBy('price_asc')}
          >
            <Text style={[styles.sortText, sortBy === 'price_asc' && styles.sortTextActive]}>Giá thấp nhất</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary.default} />
        </View>
      ) : error ? (
        <ErrorState
          title="Lỗi tải dữ liệu"
          description={error}
          onRetry={fetchProviders}
        />
      ) : (
        <FlatList
          data={filteredAndSortedProviders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProviderCard
              provider={item}
              onPress={() => router.push(`/(customer)/provider/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              title="Không có đối tác"
              description="Hiện chưa có đối tác nào cung cấp dịch vụ này."
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[4],
    backgroundColor: theme.colors.background.default,
  },
  searchSection: {
    paddingHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  searchBar: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: theme.spacing[4],
    zIndex: 1,
  },
  searchInputContainer: {
    marginBottom: 0,
    paddingLeft: theme.spacing[10],
    backgroundColor: 'white',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  sortContainer: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[3],
    gap: theme.spacing[2],
    flexDirection: 'row',
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.lowest,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  sortPillActive: {
    backgroundColor: theme.colors.primary.navy,
    borderColor: theme.colors.primary.navy,
  },
  sortText: {
    ...theme.typography.label,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  sortTextActive: {
    color: theme.colors.text.inverse,
  },
  backBtn: {
    padding: theme.spacing[1],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[10],
    gap: theme.spacing[3],
  },
});
