import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';
import { Heart, Share2, Clock, Star } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface ServiceHeroBannerProps {
  imageUrl: string;
  durationText: string;
  rating: number;
  reviewCount: number;
  isFavorite?: boolean;
  serviceTitle: string;
}

export function ServiceHeroBanner({
  imageUrl,
  durationText,
  rating,
  reviewCount,
  isFavorite = false,
  serviceTitle,
}: ServiceHeroBannerProps) {
  const [favorited, setFavorited] = useState(isFavorite);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Khám phá dịch vụ ${serviceTitle} trên PetCare!`,
      });
    } catch (error) {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.heroImage} />

      {/* Dark subtle gradient overlay */}
      <View style={styles.gradientOverlay} />

      {/* Top action buttons */}
      <View style={styles.topActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.8}
          onPress={() => setFavorited(!favorited)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Heart
            size={20}
            color={favorited ? theme.colors.semantic.error : theme.colors.primary.navy}
            fill={favorited ? theme.colors.semantic.error : 'transparent'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.8}
          onPress={handleShare}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Share2 size={18} color={theme.colors.primary.navy} />
        </TouchableOpacity>
      </View>

      {/* Bottom overlay pills */}
      <View style={styles.bottomPillsRow}>
        {/* Duration badge */}
        <View style={styles.durationPill}>
          <Clock size={14} color={theme.colors.secondary.dim} />
          <Text style={styles.durationText}>{durationText}</Text>
        </View>

        {/* Rating pill */}
        <View style={styles.ratingPill}>
          <Star
            size={14}
            color={theme.colors.secondary.container}
            fill={theme.colors.secondary.container}
          />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          <Text style={styles.reviewCountText}>({reviewCount})</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 270,
    backgroundColor: theme.colors.surface.container,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 21, 45, 0.25)',
  },
  topActions: {
    position: 'absolute',
    top: theme.spacing[4],
    right: theme.spacing[5],
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  bottomPillsRow: {
    position: 'absolute',
    bottom: theme.spacing[4],
    left: theme.spacing[5],
    right: theme.spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(11, 42, 74, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
  },
  durationText: {
    ...theme.typography.label,
    fontSize: 12,
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    ...theme.shadows.sm,
  },
  ratingText: {
    ...theme.typography.label,
    fontSize: 13,
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  reviewCountText: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
});
