import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Star, MapPin, CheckCircle2 } from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { serviceDiscoveryApi, RecommendedProvider } from '@/infrastructure/api/services.api';
import { ErrorState } from '@/core/components/ErrorState';

interface ProviderDetailsScreenProps {
  providerId: string;
}

export default function ProviderDetailsScreen({ providerId }: ProviderDetailsScreenProps) {
  const router = useRouter();

  const [provider, setProvider] = useState<RecommendedProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProvider = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await serviceDiscoveryApi.getProviderDetails(providerId);
      setProvider(data);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải thông tin đối tác');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvider();
  }, [providerId]);
  if (loading) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary.navy} />
      </View>
    );
  }

  if (error || !provider) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.headerOverlay}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
        <ErrorState title="Lỗi tải dữ liệu" description={error || 'Không tìm thấy thông tin'} onRetry={fetchProvider} />
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen} withPadding={false} edges={['bottom']}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover Image & Header */}
        <View style={styles.coverContainer}>
          <Image 
            source={(provider as any).coverUrl ? { uri: (provider as any).coverUrl } : require('../../../../assets/images/banner.png')} 
            style={styles.coverImage} 
            resizeMode="cover"
          />
          <View style={styles.headerOverlay}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ChevronLeft size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={provider.avatarUrl ? { uri: provider.avatarUrl } : require('../../../../assets/images/logo.png')} 
              style={styles.avatar} 
            />
          </View>
          
          <View style={styles.nameRow}>
            <Text style={styles.name}>{provider.fullName}</Text>
            {true && (
              <CheckCircle2 size={18} color={theme.colors.tertiary.default} />
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.ratingPill}>
              <Star size={14} color={theme.colors.secondary.default} fill={theme.colors.secondary.container} />
              <Text style={styles.ratingText}>{provider.rating}</Text>
            </View>
            <Text style={styles.statsText}>({provider.totalReviews} reviews)</Text>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={16} color={theme.colors.text.secondary} />
            <Text style={styles.locationText}>{provider.baseAddress || 'Hồ Chí Minh'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.aboutText}>{provider.bio || 'Chưa có thông tin giới thiệu'}</Text>
        </View>

        {/* Gallery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thư viện ảnh</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
            {/* Nếu backend hỗ trợ mảng gallery thì map từ provider.gallery, hiện tại đang tạm để ảnh tĩnh logo/banner của Petcare */}
            <Image source={require('../../../../assets/images/banner.png')} style={styles.galleryImage} />
            <Image source={require('../../../../assets/images/logo.png')} style={styles.galleryImage} />
          </ScrollView>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá ({provider.totalReviews})</Text>
          {/* Reviews will be fetched from another API, showing placeholder for now */}
          {provider.totalReviews > 0 ? (
            <Text style={styles.aboutText}>Đang tải đánh giá...</Text>
          ) : (
            <Text style={styles.aboutText}>Chưa có đánh giá nào</Text>
          )}
        </View>
      </ScrollView>

      {/* Footer Booking Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(customer)/booking')}
        >
          <Text style={styles.actionButtonText}>ĐẶT LỊCH NGAY</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Make room for footer
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 40, // rough estimate for safe area
    paddingHorizontal: theme.spacing[4],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  profileSection: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: 60, // space for avatar
    paddingBottom: theme.spacing[4],
    position: 'relative',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    padding: 4,
    position: 'absolute',
    top: -50,
    ...theme.shadows.md,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 46,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  name: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 184, 46, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  ratingText: {
    ...theme.typography.label,
    color: theme.colors.secondary.onContainer,
    fontWeight: '700',
  },
  statsText: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
  },
  divider: {
    height: 8,
    backgroundColor: theme.colors.surface.subdued,
    width: '100%',
  },
  section: {
    padding: theme.spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subdued,
  },
  sectionTitle: {
    ...theme.typography.h5,
    color: theme.colors.text.primary,
    fontWeight: '700',
    marginBottom: theme.spacing[4],
  },
  aboutText: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  galleryScroll: {
    flexDirection: 'row',
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: theme.radius.lg,
    marginRight: theme.spacing[3],
  },
  reviewCard: {
    backgroundColor: theme.colors.surface.lowest,
    padding: theme.spacing[4],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: theme.spacing[3],
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRatingText: {
    ...theme.typography.label,
    color: theme.colors.text.secondary,
  },
  reviewComment: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    ...theme.typography.bodySm,
    color: theme.colors.border.outlineVariant,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface.lowest,
    padding: theme.spacing[5],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subdued,
    ...theme.shadows.md,
  },
  actionButton: {
    backgroundColor: theme.colors.primary.navy,
    paddingVertical: theme.spacing[4],
    borderRadius: theme.radius.full,
    alignItems: 'center',
  },
  actionButtonText: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.text.inverse,
    fontWeight: '700',
  },
});
