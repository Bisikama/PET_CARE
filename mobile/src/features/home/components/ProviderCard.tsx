import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Star, Heart, CheckCircle2 } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { HomeProvider } from '../types/home.types';

interface ProviderCardProps {
  provider: HomeProvider;
  onPress?: (providerId: string) => void;
  onBook?: (providerId: string) => void;
  onToggleFavorite?: (providerId: string) => void;
}

export function ProviderCard({
  provider,
  onPress,
  onBook,
  onToggleFavorite,
}: ProviderCardProps) {
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(provider.startingPrice);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onPress?.(provider.id)}
    >
      <View style={styles.topRow}>
        {/* Provider Thumbnail + Favorite button */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: provider.image }} style={styles.image} />
          <TouchableOpacity
            style={styles.favoriteButton}
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(provider.id);
            }}
            accessibilityLabel="Favorite"
          >
            <Heart
              size={16}
              color={provider.isFavorite ? theme.colors.semantic.error : theme.colors.border.outline}
              fill={provider.isFavorite ? theme.colors.semantic.error : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {/* Provider Information */}
        <View style={styles.infoContainer}>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {provider.name}
              </Text>
              {provider.isVerified && (
                <CheckCircle2 size={15} color={theme.colors.tertiary.default} />
              )}
            </View>

            <View style={styles.ratingRow}>
              <View style={styles.ratingPill}>
                <Star size={13} color={theme.colors.secondary.default} fill={theme.colors.secondary.container} />
                <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.reviewCountText}>({provider.reviewCount})</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.distanceText}>{provider.distanceKm} km</Text>
            </View>
          </View>

          {/* Pricing & Booking CTA */}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.fromLabel}>From </Text>
              <Text style={styles.priceValue}>{formattedPrice}₫</Text>
            </View>
            <TouchableOpacity
              style={styles.bookButton}
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                onBook?.(provider.id);
              }}
            >
              <Text style={styles.bookButtonText}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Mini Tags */}
      {provider.tags && provider.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {provider.tags.map((tag, idx) => (
            <View key={idx} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
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
