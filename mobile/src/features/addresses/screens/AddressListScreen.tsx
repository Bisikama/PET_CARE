import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Screen } from '../../../core/components/Screen';
import { Card } from '../../../core/components/Card';
import { EmptyState } from '../../../core/components/EmptyState';
import { ErrorState } from '../../../core/components/ErrorState';
import { ScreenHeader } from '../../../core/components/ScreenHeader';
import { addressApi } from '../api/addressApi';
import { Address } from '../types/address.types';
import { typography } from '../../../core/theme/typography';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { Badge } from '../../../core/components/Badge';

export default function AddressListScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAddresses = async () => {
    setLoading(true);
    setError('');
    try {
      const res: any = await addressApi.getAddresses();
      if (Array.isArray(res)) {
        setAddresses(res);
      } else if (res?.success && Array.isArray(res?.data)) {
        setAddresses(res.data);
      } else if (Array.isArray(res?.data)) {
        setAddresses(res.data);
      } else {
        setError(res?.message || 'Không thể tải danh sách địa chỉ');
      }
    } catch (err: any) {
      setError(err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const renderItem = ({ item }: { item: Address }) => (
    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/(customer)/addresses/${item.id}/edit`)}>
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
    </TouchableOpacity>
  );

  return (
    <Screen style={styles.container} >
      <ScreenHeader title="Địa chỉ của tôi" />
      
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
              onAction={() => router.push('/(customer)/addresses/add')}
            />
          }
        />
      )}

      {!loading && !error && addresses.length > 0 && (
        <TouchableOpacity 
          style={styles.fab} 
          activeOpacity={0.8}
          onPress={() => router.push('/(customer)/addresses/add')}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: spacing[6],
    paddingTop: spacing[4],
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
  fab: {
    position: 'absolute',
    bottom: spacing[6],
    right: spacing[6],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.navy,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  }
});
