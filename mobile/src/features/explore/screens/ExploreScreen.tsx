import React, { useState } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator } from 'react-native';
import { Screen } from '../../../core/components/Screen';
import { Card } from '../../../core/components/Card';
import { EmptyState } from '../../../core/components/EmptyState';
import { ErrorState } from '../../../core/components/ErrorState';
import { Input } from '../../../core/components/Input';
import { Button } from '../../../core/components/Button';
import { exploreApi } from '../api/exploreApi';
import { ProviderSearchResult } from '../types/explore.types';
import { typography } from '../../../core/theme/typography';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';

export default function ExploreScreen() {
  const [providers, setProviders] = useState<ProviderSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serviceType, setServiceType] = useState('DOG_WALKING');

  const searchProviders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await exploreApi.searchProviders({
        service_type: serviceType,
        latitude: 10.762622, // dummy HCM lat
        longitude: 106.660172, // dummy HCM lng
        date: new Date().toISOString(),
      });
      if (res.success) {
        setProviders(res.data);
      } else {
        setError(res.message || 'Không tìm thấy kết quả');
      }
    } catch (err: any) {
      setError(err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ProviderSearchResult }) => (
    <Card style={styles.card}>
      <Text style={[typography.h3, { color: colors.text.primary }]}>{item.full_name}</Text>
      <Text style={[typography.bodyMd, { color: colors.text.secondary, marginTop: spacing[1] }]}>
        ⭐ {item.rating.toFixed(1)} ({item.review_count} đánh giá)
      </Text>
      <Text style={[typography.bodyMd, { color: colors.primary.active, marginTop: spacing[1] }]}>
        {item.price_per_hour.toLocaleString('vi-VN')} đ/giờ
      </Text>
    </Card>
  );

  return (
    <Screen style={styles.container} >
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.text.primary }]}>Tìm kiếm dịch vụ</Text>
      </View>

      <View style={styles.searchSection}>
        <Input
          label="Loại dịch vụ"
          value={serviceType}
          onChangeText={setServiceType}
          placeholder="VD: DOG_WALKING"
        />
        <Button label="Tìm kiếm" onPress={searchProviders} style={{ marginTop: spacing[2] }} />
      </View>
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary.default} />
        </View>
      ) : error ? (
        <ErrorState
          title="Lỗi tìm kiếm"
          description={error}
          onRetry={searchProviders}
        />
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item.provider_id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              title="Không có kết quả"
              description="Hãy thử tìm kiếm với các tiêu chí khác."
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[6],
  },
  header: {
    marginTop: spacing[8],
    marginBottom: spacing[4],
  },
  searchSection: {
    marginBottom: spacing[6],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flexGrow: 1,
    gap: spacing[4],
    paddingBottom: spacing[10],
  },
  card: {
    padding: spacing[4],
  },
});
