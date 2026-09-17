import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../../core/components/Screen';
import { EmptyState } from '../../../core/components/EmptyState';
import { ErrorState } from '../../../core/components/ErrorState';
import { serviceDiscoveryApi, RecommendedProvider } from '../../../infrastructure/api/services.api';
import { ProviderCard } from '../../home/components/ProviderCard';
import { theme } from '../../../core/theme';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

export default function NearbyProvidersScreen() {
  const router = useRouter();
  const [providers, setProviders] = useState<RecommendedProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProviders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await serviceDiscoveryApi.getRecommendations();
      setProviders(res);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách đối tác.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <Screen style={styles.container} backgroundColor={theme.colors.background.default} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h2, { color: theme.colors.text.primary, marginLeft: theme.spacing[3] }]}>
          Đối tác gần bạn
        </Text>
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
          data={providers}
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
              title="Không có đối tác nào"
              description="Hiện chưa có đối tác nào gần khu vực của bạn."
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
