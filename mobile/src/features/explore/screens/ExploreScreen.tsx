import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../../core/components/Screen';
import { EmptyState } from '../../../core/components/EmptyState';
import { ErrorState } from '../../../core/components/ErrorState';
import { Input } from '../../../core/components/Input';
import { servicesApi, ServiceCategory } from '../../../infrastructure/api/services.api';
import { theme } from '../../../core/theme';
import { Search, Clock, ChevronRight, Sparkles } from 'lucide-react-native';
import { formatCurrency } from '../../../core/utils/currency';

export default function ExploreScreen() {
  const router = useRouter();
  const [allServices, setAllServices] = useState<ServiceCategory[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await servicesApi.getAllServices();
      setAllServices(res);
      setFilteredServices(res);
    } catch (err: any) {
      setError(err?.message || 'Đã có lỗi xảy ra khi tải dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredServices(allServices);
    } else {
      const lower = text.toLowerCase();
      setFilteredServices(allServices.filter(s => {
        const matchName = s.name.toLowerCase().includes(lower);
        const matchDesc = s.description ? s.description.toLowerCase().includes(lower) : false;
        const matchCategory = s.category ? s.category.toLowerCase().includes(lower) : false;
        return matchName || matchDesc || matchCategory;
      }));
    }
  }, [allServices]);

  const renderItem = ({ item }: { item: ServiceCategory }) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      style={styles.card}
      onPress={() => router.push(`/(customer)/service/${item.id}/details`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Sparkles size={24} color={theme.colors.primary.default} />
        </View>
        <TouchableOpacity style={styles.arrowButton}>
          <ChevronRight size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={[theme.typography.h4, styles.cardTitle]} numberOfLines={1}>{item.name}</Text>
        <Text style={[theme.typography.bodySm, styles.cardDesc]} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.durationBadge}>
          <Clock size={14} color={theme.colors.primary.default} />
          <Text style={styles.durationText}>{item.durationMinutes} phút</Text>
        </View>
        <Text style={[theme.typography.bodyMd, styles.priceText]}>
          Từ {formatCurrency(item.basePrice)} đ
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen style={styles.container} backgroundColor={theme.colors.background.default} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={[theme.typography.h1, { color: theme.colors.text.primary }]}>Khám phá</Text>
        <Text style={[theme.typography.bodyMd, { color: theme.colors.text.secondary, marginTop: 4 }]}>
          Tìm kiếm dịch vụ chăm sóc thú cưng tốt nhất
        </Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={theme.colors.text.secondary} style={styles.searchIcon} />
          <Input
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Ví dụ: Tắm, Cắt tỉa..."
            containerStyle={styles.searchInputContainer}
          />
        </View>
      </View>
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary.default} />
        </View>
      ) : error ? (
        <ErrorState
          title="Lỗi tải dữ liệu"
          description={error}
          onRetry={fetchServices}
        />
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="Không tìm thấy dịch vụ"
              description="Hãy thử tìm kiếm với các từ khóa khác."
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
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[6],
    backgroundColor: theme.colors.background.default,
  },
  searchSection: {
    paddingHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[2],
  },
  searchBar: {
    position: 'relative',
    justifyContent: 'center',
    shadowColor: theme.colors.primary.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    borderWidth: 0,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing[5],
    paddingBottom: theme.spacing[10],
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing[4],
  },
  card: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: theme.radius.lg,
    padding: theme.spacing[4],
    shadowColor: theme.colors.primary.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(11, 42, 74, 0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[3],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.mid,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButton: {
    padding: 2,
  },
  cardContent: {
    marginBottom: theme.spacing[4],
  },
  cardTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  cardDesc: {
    color: theme.colors.text.secondary,
  },
  cardFooter: {
    marginTop: 'auto',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.low,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing[2],
  },
  durationText: {
    ...theme.typography.label,
    color: theme.colors.primary.default,
    marginLeft: 4,
  },
  priceText: {
    color: theme.colors.primary.active,
    fontWeight: '700',
  },
});
