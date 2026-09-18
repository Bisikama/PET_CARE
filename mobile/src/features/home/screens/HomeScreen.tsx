import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Alert,
  Text,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { useAuth } from '../../auth/context/AuthContext';
import { GreetingHeader } from '../components/GreetingHeader';
import { HomeSearchBar } from '../components/HomeSearchBar';
import { PromiseBanner } from '../components/PromiseBanner';
import { UpcomingAppointmentCard } from '../components/UpcomingAppointmentCard';
import { CategoryGrid } from '../components/CategoryGrid';
import { SpecialPromoBanner } from '../components/SpecialPromoBanner';
import { HomeProvider } from '../types/home.types';
import { servicesApi, ServiceCategory } from '@/infrastructure/api/services.api';
import { bookingsApi } from '@/infrastructure/api/bookings.api';
import { UpcomingAppointment } from '../types/home.types';



export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [activeBooking, setActiveBooking] = useState<UpcomingAppointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [fetchedServices, fetchedActiveBooking] = await Promise.all([
        servicesApi.getAllServices(),
        bookingsApi.getActiveBooking()
      ]);
      setServices(fetchedServices);
      
      if (fetchedActiveBooking) {
        const startDate = new Date(fetchedActiveBooking.estimated_start_at);
        const providerUser = fetchedActiveBooking.provider_profiles?.users;
        const petInfo = fetchedActiveBooking.booking_pets?.[0]?.pets;
        const serviceInfo = fetchedActiveBooking.booking_pets?.[0]?.booking_services?.[0]?.provider_services?.services;

        setActiveBooking({
          id: fetchedActiveBooking.id,
          providerName: providerUser?.fullName || 'Provider',
          providerImage: providerUser?.avatarUrl || '',
          isVerified: fetchedActiveBooking.provider_profiles?.is_verified || false,
          serviceTitle: serviceInfo?.title || 'Dịch vụ',
          petName: petInfo?.name || 'Thú cưng',
          petBreed: petInfo?.breed || '',
          date: startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' }),
          time: startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          locationType: fetchedActiveBooking.location_type === 'AT_SALON' ? 'Tại Salon' : 'Tại nhà',
          status: fetchedActiveBooking.status as any,
        });
      } else {
        setActiveBooking(null);
      }
    } catch (error) {
      console.error('Failed to fetch home data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu trang chủ');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const handleToggleFavorite = (providerId: string) => {
    // Tạm thời chưa có API
  };

  const handleSelectCategory = (categoryId: string) => {
    router.push({
      pathname: '/(customer)/(tabs)/explore',
      params: { category: categoryId },
    });
  };

  const handleSearchPress = () => {
    router.push('/(customer)/(tabs)/explore');
  };

  const handleViewBooking = (bookingId: string) => {
    Alert.alert('Chi tiết lịch hẹn', `Mã lịch hẹn: ${bookingId}`);
  };

  const handleDirections = (bookingId: string) => {
    Alert.alert('Chỉ đường', 'Đang mở điều hướng tới cơ sở chăm sóc');
  };

  const handleBook = (providerId: string) => {
    router.push({
      pathname: '/(customer)/services/[id]',
      params: {
        id: providerId,
        title: 'Premium Dog Grooming',
        providerName: 'Happy Paws Care',
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary.navy}
            colors={[theme.colors.primary.navy]}
          />
        }
      >
        {/* 1. Top Greeting Header */}
        <GreetingHeader
          userName={user?.full_name || 'Sarah Nguyen'}
          hasUnreadNotifications={true}
          onNotificationPress={() => Alert.alert('Thông báo', 'Bạn không có thông báo mới')}
          onProfilePress={() => router.push('/(customer)/change-password')}
        />

        {/* 2. Search & Quick Filters */}
        <HomeSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearchPress={handleSearchPress}
          onFilterPress={handleSearchPress}
        />

        {/* 3. PetCare Promise Hero Banner */}
        <PromiseBanner onPress={handleSearchPress} />

        {/* 4. Active Upcoming Appointment */}
        {activeBooking && (
          <UpcomingAppointmentCard
            appointment={activeBooking}
            onViewBooking={handleViewBooking}
            onDirections={handleDirections}
            onSeeAll={() => Alert.alert('Lịch hẹn', 'Xem tất cả lịch hẹn')}
          />
        )}

        {/* 5. 8-Grid Service Categories */}
        <CategoryGrid
          services={services}
          onSelectCategory={handleSelectCategory}
          onSeeAll={() => router.push('/(customer)/(tabs)/explore')}
        />

        {/* 6. Special Promo Banner */}
        <SpecialPromoBanner
          onExplore={() => router.push('/(customer)/(tabs)/explore')}
        />

        {/* 7. Nearby Providers Banner / Link */}
        <View style={{ paddingHorizontal: theme.spacing[4], marginTop: theme.spacing[4] }}>
          <View style={{
            backgroundColor: theme.colors.surface.mid,
            borderRadius: theme.radius.lg,
            padding: theme.spacing[4],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <View style={{ flex: 1 }}>
              <Text style={[theme.typography.h4, { color: theme.colors.text.primary }]}>Đối tác gần bạn</Text>
              <Text style={[theme.typography.bodyMd, { color: theme.colors.text.secondary, marginTop: 4 }]}>
                Khám phá các spa và chuyên viên được đánh giá cao ở gần bạn.
              </Text>
            </View>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={{
                backgroundColor: theme.colors.primary.default,
                paddingHorizontal: theme.spacing[4],
                paddingVertical: theme.spacing[2],
                borderRadius: theme.radius.full,
                marginLeft: theme.spacing[3]
              }}
              onPress={() => router.push('/(customer)/providers/nearby')}
            >
              <Text style={[theme.typography.bodyMd, { color: 'white', fontWeight: '600' }]}>Xem ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: theme.spacing[6],
  },
});
