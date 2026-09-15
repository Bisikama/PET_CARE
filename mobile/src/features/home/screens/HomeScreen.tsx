import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Alert,
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
import { TopRatedProviders } from '../components/TopRatedProviders';
import { HomeProvider } from '../types/home.types';

const initialProviders: HomeProvider[] = [
  {
    id: 'prov-01',
    name: 'Happy Paws Care',
    image:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    rating: 4.9,
    reviewCount: 320,
    distanceKm: 1.2,
    startingPrice: 200000,
    tags: ['Full Grooming', 'Dental Care', 'Spa Bath'],
    isFavorite: true,
  },
  {
    id: 'prov-02',
    name: 'Furry Haven Studio',
    image:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    rating: 4.8,
    reviewCount: 185,
    distanceKm: 2.4,
    startingPrice: 180000,
    tags: ['Cat Boarding', 'Organic Bath'],
    isFavorite: false,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [providers, setProviders] = useState<HomeProvider[]>(initialProviders);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  const handleToggleFavorite = (providerId: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId ? { ...p, isFavorite: !p.isFavorite } : p
      )
    );
  };

  const handleSelectCategory = (categoryId: string) => {
    router.push(`/(customer)/explore?category=${categoryId}`);
  };

  const handleSearchPress = () => {
    router.push('/(customer)/explore');
  };

  const handleViewBooking = (bookingId: string) => {
    Alert.alert('Chi tiết lịch hẹn', `Mã lịch hẹn: ${bookingId}`);
  };

  const handleDirections = (bookingId: string) => {
    Alert.alert('Chỉ đường', 'Đang mở điều hướng tới cơ sở chăm sóc');
  };

  const handleBook = (providerId: string) => {
    Alert.alert('Đặt lịch dịch vụ', `Bắt đầu đặt lịch với cơ sở ${providerId}`);
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
        <UpcomingAppointmentCard
          onViewBooking={handleViewBooking}
          onDirections={handleDirections}
          onSeeAll={() => Alert.alert('Lịch hẹn', 'Xem tất cả lịch hẹn')}
        />

        {/* 5. 8-Grid Service Categories */}
        <CategoryGrid
          onSelectCategory={handleSelectCategory}
          onSeeAll={() => router.push('/(customer)/explore')}
        />

        {/* 6. Special Promo Banner */}
        <SpecialPromoBanner
          onExplore={() => router.push('/(customer)/explore')}
        />

        {/* 7. Top Rated Providers */}
        <TopRatedProviders
          providers={providers}
          onExplore={() => router.push('/(customer)/(tabs)/explore')}
          onProviderPress={(id) => handleBook(id)}
          onBook={handleBook}
          onToggleFavorite={handleToggleFavorite}
        />
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
