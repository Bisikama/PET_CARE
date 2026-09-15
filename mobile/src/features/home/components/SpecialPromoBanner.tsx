import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { SpecialPromo } from '../types/home.types';

interface SpecialPromoBannerProps {
  promo?: SpecialPromo;
  onExplore?: () => void;
}

const defaultPromo: SpecialPromo = {
  id: 'promo-01',
  tag: 'Special Promo',
  title: '20% off your first grooming session',
  code: 'PAWFRESH20',
  imageUrl:
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80',
};

export function SpecialPromoBanner({
  promo = defaultPromo,
  onExplore,
}: SpecialPromoBannerProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.banner}
        activeOpacity={0.9}
        onPress={onExplore}
      >
        <View style={styles.leftContent}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{promo.tag}</Text>
          </View>

          <Text style={styles.title}>{promo.title}</Text>

          <Text style={styles.codeText}>
            Use code: <Text style={styles.codeBold}>{promo.code}</Text>
          </Text>

          <TouchableOpacity
            style={styles.exploreBtn}
            activeOpacity={0.8}
            onPress={onExplore}
          >
            <Text style={styles.exploreBtnText}>Explore Offer</Text>
            <ArrowRight size={15} color={theme.colors.text.inverse} />
          </TouchableOpacity>
        </View>

        <View style={styles.imageWrapper}>
          <Image source={{ uri: promo.imageUrl }} style={styles.image} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[5],
  },
  banner: {
    backgroundColor: theme.colors.secondary.container,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    ...theme.shadows.md,
  },
  leftContent: {
    flex: 1,
    paddingRight: theme.spacing[3],
  },
  tagBadge: {
    backgroundColor: 'rgba(0, 21, 45, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  tagText: {
    ...theme.typography.label,
    color: theme.colors.primary.navy,
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.primary.navy,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 4,
  },
  codeText: {
    ...theme.typography.bodySm,
    color: theme.colors.secondary.onContainer,
    marginBottom: theme.spacing[3],
  },
  codeBold: {
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary.navy,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    alignSelf: 'flex-start',
  },
  exploreBtnText: {
    ...theme.typography.label,
    color: theme.colors.text.inverse,
    fontWeight: '700',
  },
  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
