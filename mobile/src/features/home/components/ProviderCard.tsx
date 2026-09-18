import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Star, Heart, CheckCircle2 } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { RecommendedProvider } from '@/infrastructure/api/services.api';

interface ProviderCardProps {
  provider: any; // Accept RecommendedProvider | DiscoveredProviderOutput
  onPress?: (providerId: string) => void;
  onToggleFavorite?: (providerId: string) => void;
}

export function ProviderCard({
  provider,
  onPress,
  onToggleFavorite,
}: ProviderCardProps) {
  // In a real app, distance and price might be fetched differently or omitted in recommendations.
  const [isFavorite, setIsFavorite] = React.useState(false);

  const rating = provider.rating !== undefined ? provider.rating : (provider.ratingAvg || 0);
  const reviewsCount = provider.totalReviews !== undefined ? provider.totalReviews : (provider.totalCompletedBookings || 0);
  const address = provider.baseAddress;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onPress?.(provider.id)}
    >
      <View style={styles.topRow}>
        {/* Provider Thumbnail + Favorite button */}
        <View style={styles.imageContainer}>
          <Image source={provider.avatarUrl ? { uri: provider.avatarUrl } : require('../../../../assets/images/logo.png')} style={styles.image} />
          <TouchableOpacity
            style={styles.favoriteButton}
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
              onToggleFavorite?.(provider.id);
            }}
            accessibilityLabel="Favorite"
          >
            <Heart
              size={16}
              color={isFavorite ? theme.colors.semantic.error : theme.colors.border.outlineVariant}
              fill={isFavorite ? theme.colors.semantic.error : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {/* Provider Information */}
        <View style={styles.infoContainer}>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {provider.fullName}
              </Text>
              <CheckCircle2 size={15} color={theme.colors.tertiary.default} />
            </View>

            <View style={styles.ratingRow}>
              <View style={styles.ratingPill}>
                <Star size={13} color={theme.colors.secondary.default} fill={theme.colors.secondary.container} />
                <Text style={styles.ratingText}>{Number(rating).toFixed(1)}</Text>
              </View>
              <Text style={styles.reviewCountText}>({reviewsCount})</Text>
              {address && (
                <>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={styles.distanceText} numberOfLines={1}>{address}</Text>
                </>
              )}
            </View>
            
            {provider.price !== undefined && (
              <View style={styles.priceRow}>
                <Text style={styles.fromLabel}>Từ</Text>
                <Text style={styles.priceValue}>{new Intl.NumberFormat('vi-VN').format(provider.price)} đ</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: theme.spacing[3],
    ...theme.shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  imageContainer: {
    width: 92,
    height: 92,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.surface.containerHigh,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.primary.navy,
    fontWeight: '700',
    flexShrink: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(245, 184, 46, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ratingText: {
    ...theme.typography.label,
    color: theme.colors.secondary.onContainer,
    fontWeight: '700',
    fontSize: 11,
  },
  reviewCountText: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
    fontSize: 12,
  },
  dotSeparator: {
    color: theme.colors.border.outlineVariant,
  },
  distanceText: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  fromLabel: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
    fontSize: 11,
  },
  priceValue: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.primary.navy,
    fontWeight: '700',
  },
  bookButton: {
    backgroundColor: theme.colors.surface.containerHigh,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
  },
  bookButtonText: {
    ...theme.typography.label,
    color: theme.colors.primary.navy,
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: theme.spacing[2],
    paddingTop: theme.spacing[2],
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border.subdued,
  },
  tagPill: {
    backgroundColor: theme.colors.surface.subdued,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  tagText: {
    ...theme.typography.label,
    color: theme.colors.text.secondary,
    fontSize: 10,
    fontWeight: '500',
  },
});
