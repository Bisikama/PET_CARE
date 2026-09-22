import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShieldCheck, Sparkles } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface PromiseBannerProps {
  onPress?: () => void;
}

export function PromiseBanner({ onPress }: PromiseBannerProps) {
  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        style={styles.bannerContainer}
        activeOpacity={0.9}
        onPress={onPress}
      >
        {/* Subtle decorative golden glow */}
        <View style={styles.glowCircle} />

        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <ShieldCheck size={14} color={theme.colors.secondary.container} />
            <Text style={styles.badgeText}>PetCare PROMISE</Text>
          </View>
          
          <Text style={styles.headline}>
            Loving, certified care at your doorstep
          </Text>
          
          <Text style={styles.subheadline}>
            Over 250+ certified sitters & clinics nearby
          </Text>
        </View>

        <View style={styles.graphicContainer}>
          <Sparkles size={60} color={theme.colors.secondary.container} opacity={0.25} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[4],
  },
  bannerContainer: {
    backgroundColor: theme.colors.primary.navy,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[5],
    position: 'relative',
    overflow: 'hidden',
    minHeight: 135,
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  glowCircle: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(245, 184, 46, 0.12)',
  },
  content: {
    maxWidth: '75%',
    zIndex: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  badgeText: {
    ...theme.typography.label,
    color: theme.colors.secondary.container,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  headline: {
    ...theme.typography.h4,
    color: theme.colors.text.inverse,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  subheadline: {
    ...theme.typography.bodySm,
    color: theme.colors.primary.onContainer,
  },
  graphicContainer: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    zIndex: 1,
  },
});
