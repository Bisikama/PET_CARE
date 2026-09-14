import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator } from 'react-native';
import { Screen } from '../../../core/components/Screen';
import { Card } from '../../../core/components/Card';
import { EmptyState } from '../../../core/components/EmptyState';
import { ErrorState } from '../../../core/components/ErrorState';
import { addressApi } from '../api/addressApi';
import { Address } from '../types/address.types';
import { typography } from '../../../core/theme/typography';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { Badge } from '../../../core/components/Badge';

export default function AddressListScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAddresses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await addressApi.getAddresses();
      if (res.success) {
        setAddresses(res.data);
      } else {
        setError(res.message || 'Không thể tải danh sách địa chỉ');
      }
    } catch (err: any) {
      setError(err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const renderItem = ({ item }: { item: Address }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={[typography.h3, { color: colors.text.primary }]}>{item.label}</Text>
        {item.isDefault && <Badge label="Mặc định" backgroundColor={colors.semantic.successContainer} color={colors.semantic.success} />}
      </View>
      <Text style={[typography.bodyMd, { color: colors.text.secondary, marginTop: spacing[1] }]}>
        {item.receiverName} - {item.phone}
      </Text>
      <Text style={[typography.bodyMd, { color: colors.text.muted, marginTop: spacing[1] }]}>
        {item.addressLine}{item.ward ? `, ${item.ward}` : ''}{item.district ? `, ${item.district}` : ''}{item.city ? `, ${item.city}` : ''}
      </Text>
    </Card>
  );

  return (
    <Screen style={styles.container} >
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.text.primary }]}>Địa chỉ của tôi</Text>
      </View>
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary.default} />
        </View>
      ) : error ? (
        <ErrorState
          title="Lỗi tải dữ liệu"
          description={error}
          onRetry={fetchAddresses}
        />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              title="Chưa có địa chỉ"
              description="Hãy thêm địa chỉ của bạn để dễ dàng đặt dịch vụ thú cưng."
              actionLabel="Thêm địa chỉ"
              onAction={() => {}} // Navigation to create address
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
