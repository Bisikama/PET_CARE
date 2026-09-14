import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator } from 'react-native';
import { Screen } from '../../../core/components/Screen';
import { Button } from '../../../core/components/Button';
import { Card } from '../../../core/components/Card';
import { EmptyState } from '../../../core/components/EmptyState';
import { ErrorState } from '../../../core/components/ErrorState';
import { petApi } from '../api/petApi';
import { Pet } from '../types/pet.types';
import { typography } from '../../../core/theme/typography';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';

export default function PetListScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPets = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await petApi.getPets();
      if (res.success) {
        setPets(res.data);
      } else {
        setError(res.message || 'Không thể tải danh sách thú cưng');
      }
    } catch (err: any) {
      setError(err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const renderItem = ({ item }: { item: Pet }) => (
    <Card style={styles.card}>
      <Text style={[typography.h3, { color: colors.text.primary }]}>{item.name}</Text>
      <Text style={[typography.bodyMd, { color: colors.text.secondary }]}>{item.species} {item.breed ? `- ${item.breed}` : ''}</Text>
    </Card>
  );

  return (
    <Screen style={styles.container} >
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.text.primary }]}>Thú cưng của tôi</Text>
      </View>
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary.default} />
        </View>
      ) : error ? (
        <ErrorState
          title="Lỗi tải dữ liệu"
          description={error}
          onRetry={fetchPets}
        />
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              title="Chưa có thú cưng"
              description="Hãy thêm thú cưng của bạn vào PetCare để bắt đầu sử dụng dịch vụ."
              actionLabel="Thêm thú cưng"
              onAction={() => {}} // Navigation to create pet
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
  },
  card: {
    padding: spacing[4],
  },
});
