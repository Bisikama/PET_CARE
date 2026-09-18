import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';
import { Heart, Share2 } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface ProviderHeroCoverProps {
  coverUrl: string;
  providerName: string;
  isAvailableToday?: boolean;
}

export function ProviderHeroCover({
  coverUrl,
  providerName,
  isAvailableToday = true,
}: ProviderHeroCoverProps) {
  const [favorited, setFavorited] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Khám phá hồ sơ chuyên viên ${providerName} trên PawCare!`,
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: coverUrl }} style={styles.coverImage} />

      {/* Dark gradient overlay */}
      <View style={styles.gradientOverlay} />

      {/* Top right actions */}
      <View style={styles.topActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.8}
          onPress={handleShare}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Share2 size={18} color={theme.colors.primary.navy} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.8}
          onPress={() => setFavorited(!favorited)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Heart
            size={20}
            color={
              favorited ? theme.colors.semantic.error : theme.colors.primary.navy
            }
            fill={favorited ? theme.colors.semantic.error : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom availability badge */}
      {isAvailableToday && (
        <View style={styles.availabilityPill}>
          <View style={styles.greenPulseDot} />
          <Text style={styles.availabilityText}>
            Available for bookings today
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 240,
    backgroundColor: theme.colors.surface.container,
  },
  coverImage: {
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
  availabilityPill: {
    position: 'absolute',
    bottom: theme.spacing[3],
    left: theme.spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    ...theme.shadows.sm,
  },
  greenPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.tertiary.onContainer,
  },
  availabilityText: {
    ...theme.typography.label,
    fontSize: 11,
    color: theme.colors.tertiary.onContainer,
    fontWeight: '700',
  },
});
