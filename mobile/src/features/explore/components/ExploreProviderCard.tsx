import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import {
  Star,
  MapPin,
  CheckCircle2,
  Heart,
  ArrowRight,
} from 'lucide-react-native';
import { theme } from '@/core/theme';
import { ExploreProviderItem } from '../types/explore.types';

interface ExploreProviderCardProps {
  provider: ExploreProviderItem;
  onPress?: () => void;
  onBook?: () => void;
  onToggleFavorite?: (id: string) => void;
}

export function ExploreProviderCard({
  provider,
  onPress,
  onBook,
  onToggleFavorite,
}: ExploreProviderCardProps) {
  const isFavorite = !!provider.isFavorite;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* Top Header: Image + Details + Fav button */}
      <View style={styles.topRow}>
        {/* Provider Avatar Image with Verified Badge */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: provider.imageUrl }} style={styles.image} />
          {provider.isVerified && (
            <View style={styles.verifiedBadge}>
              <CheckCircle2
                size={16}
                color={theme.colors.tertiary.onContainer}
                fill={theme.colors.surface.lowest}
              />
            </View>
          )}
        </View>

        {/* Info Column */}
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.providerName} numberOfLines={1}>
              {provider.name}
            </Text>
            {/* Heart / Favorite Button */}
            <TouchableOpacity
              style={styles.favButton}
              activeOpacity={0.7}
              onPress={() => onToggleFavorite?.(provider.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Heart
                size={18}
                color={
                  isFavorite
                    ? theme.colors.semantic.error
                    : theme.colors.text.muted
                }
                fill={
                  isFavorite ? theme.colors.semantic.error : 'transparent'
                }
              />
            </TouchableOpacity>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Star
              size={14}
              color={theme.colors.secondary.container}
              fill={theme.colors.secondary.container}
            />
            <Text style={styles.ratingScore}>
              {provider.rating.toFixed(1)}
            </Text>
            <Text style={styles.reviewCount}>
              ({provider.reviewCount} reviews)
            </Text>
          </View>

          {/* Distance & Status */}
          <View style={styles.metaRow}>
            <MapPin size={13} color={theme.colors.text.muted} />
            <Text style={styles.metaText}>{provider.distanceKm} km away</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text
              style={[
                styles.statusText,
                provider.statusColor === 'emerald'
                  ? { color: theme.colors.tertiary.onContainer }
                  : provider.statusColor === 'amber'
                  ? { color: theme.colors.secondary.onContainer }
                  : { color: theme.colors.primary.navy },
              ]}
            >
              {provider.statusText}
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {provider.description}
      </Text>

      {/* Service Tags */}
      <View style={styles.tagsRow}>
        {provider.tags.map((tag, idx) => (
          <View key={idx} style={styles.tagPill}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Bottom Pricing & CTA */}
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.priceValue}>
            {provider.startingPrice.toLocaleString('vi-VN')}₫
          </Text>
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={onBook || onPress}
        >
          <Text style={styles.ctaButtonText}>View Details</Text>
          <ArrowRight size={16} color={theme.colors.secondary.onContainer} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  topRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  imageWrapper: {
    position: 'relative',
    width: 76,
    height: 76,
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.container,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.full,
    padding: 2,
    ...theme.shadows.sm,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  providerName: {
    flex: 1,
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  favButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.subdued,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingScore: {
    ...theme.typography.bodySm,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  reviewCount: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  metaText: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  metaDot: {
    color: theme.colors.text.light,
    fontSize: 10,
  },
  statusText: {
    ...theme.typography.bodySm,
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    backgroundColor: theme.colors.surface.subdued,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  tagText: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing[1],
  },
  priceLabel: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
  priceValue: {
    ...theme.typography.h4,
    color: theme.colors.primary.navy,
    fontWeight: '700',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.secondary.container,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: 10,
    borderRadius: theme.radius.lg,
    ...theme.shadows.sm,
  },
  ctaButtonText: {
    ...theme.typography.label,
    color: theme.colors.secondary.onContainer,
    fontWeight: '700',
  },
});
