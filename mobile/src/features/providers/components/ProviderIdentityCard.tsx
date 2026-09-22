import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Star, CheckCircle2, MapPin, Check } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface ProviderIdentityCardProps {
  avatarUrl: string;
  name: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  location: string;
}

export function ProviderIdentityCard({
  avatarUrl,
  name,
  isVerified,
  rating,
  reviewCount,
  location,
}: ProviderIdentityCardProps) {
  return (
    <View style={styles.container}>
      {/* Top overlapping row */}
      <View style={styles.topRow}>
        {/* Large Avatar */}
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <View style={styles.verifiedInner}>
                <Check size={10} color={theme.colors.surface.lowest} strokeWidth={3} />
              </View>
            </View>
          )}
        </View>

        {/* Rating Pill */}
        <View style={styles.ratingBadge}>
          <Star
            size={14}
            color={theme.colors.secondary.container}
            fill={theme.colors.secondary.container}
          />
          <Text style={styles.ratingScore}>{rating.toFixed(2)}</Text>
          <Text style={styles.reviewCount}>({reviewCount} reviews)</Text>
        </View>
      </View>

      {/* Name & Location */}
      <View style={styles.nameSection}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText}>{name}</Text>
          {isVerified && (
            <CheckCircle2
              size={18}
              color={theme.colors.tertiary.onContainer}
              fill={theme.colors.surface.lowest}
            />
          )}
        </View>

        <View style={styles.locationRow}>
          <MapPin size={14} color={theme.colors.secondary.onContainer} />
          <Text style={styles.locationText}>{location}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: -44,
    marginBottom: theme.spacing[2],
  },
  avatarWrapper: {
    position: 'relative',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: theme.colors.surface.lowest,
    padding: 3,
    ...theme.shadows.lg,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface.lowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  verifiedInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.tertiary.onContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surface.lowest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  ratingScore: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  reviewCount: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
  nameSection: {
    gap: 3,
    marginTop: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    ...theme.typography.h2,
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    ...theme.typography.bodySm,
    fontSize: 12.5,
    color: theme.colors.text.secondary,
  },
});
