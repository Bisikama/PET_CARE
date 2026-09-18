import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  PawPrint,
  MapPin,
  Droplets,
  Camera,
  Sparkles,
  HeartHandshake,
} from 'lucide-react-native';
import { theme } from '@/core/theme';
import { ProviderWeightTierPrice } from '../types/provider.types';

interface ProviderServicePricingMatrixProps {
  packageName?: string;
  packageDescription?: string;
  basePrice?: number;
  tiers?: ProviderWeightTierPrice[];
}

export const defaultTiers: ProviderWeightTierPrice[] = [
  {
    id: 't-1',
    title: 'Dog (0–5 kg)',
    subtext: 'Toy breeds (Chihuahua, Pomeranian)',
    price: 200000,
  },
  {
    id: 't-2',
    title: 'Dog (5–10 kg)',
    subtext: 'Small (Beagle, French Bulldog, Pug)',
    price: 250000,
    isPopular: true,
  },
  {
    id: 't-3',
    title: 'Dog (10–20 kg)',
    subtext: 'Medium (Border Collie, Cocker Spaniel)',
    price: 280000,
  },
  {
    id: 't-4',
    title: 'Dog (20+ kg)',
    subtext: 'Large (Golden Retriever, German Shepherd)',
    price: 320000,
  },
  {
    id: 't-5',
    title: 'Cat Standard Care',
    subtext: 'Feeding, litter cleaning, gentle playtime',
    price: 180000,
    isCat: true,
  },
];

export function ProviderServicePricingMatrix({
  packageName = '60-Min Active Care & Walk',
  packageDescription = 'Comprehensive physical exercise with mindful pacing, socialization, and complete post-walk freshening.',
  basePrice = 250000,
  tiers = defaultTiers,
}: ProviderServicePricingMatrixProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.iconCircle}>
              <PawPrint size={15} color={theme.colors.secondary.onContainer} />
            </View>
            <Text style={styles.sectionTitle}>Service Package</Text>
          </View>

          <Text style={styles.basePriceText}>
            {basePrice.toLocaleString('vi-VN')}₫{' '}
            <Text style={styles.basePriceSub}>base</Text>
          </Text>
        </View>

        {/* Highlighted Package Box */}
        <View style={styles.packageBox}>
          <View style={styles.packageTitleRow}>
            <Text style={styles.packageName}>{packageName}</Text>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>POPULAR</Text>
            </View>
          </View>

          <Text style={styles.packageDesc}>{packageDescription}</Text>

          {/* 4 Feature Items */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <MapPin size={13} color={theme.colors.tertiary.onContainer} />
              <Text style={styles.featureText}>Live GPS Route Tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Droplets size={13} color={theme.colors.tertiary.onContainer} />
              <Text style={styles.featureText}>Fresh Water Refill</Text>
            </View>
            <View style={styles.featureItem}>
              <Camera size={13} color={theme.colors.tertiary.onContainer} />
              <Text style={styles.featureText}>10+ HD Photo Updates</Text>
            </View>
            <View style={styles.featureItem}>
              <Sparkles size={13} color={theme.colors.tertiary.onContainer} />
              <Text style={styles.featureText}>Gentle Paw Cleaning</Text>
            </View>
          </View>
        </View>

        {/* Pricing Matrix Header */}
        <View style={styles.matrixHeaderRow}>
          <Text style={styles.matrixTitle}>Species & Weight Pricing Matrix</Text>
          <Text style={styles.matrixSub}>Per 60-min session</Text>
        </View>

        {/* Pricing Matrix List */}
        <View style={styles.tiersList}>
          {tiers.map((tier) => (
            <View
              key={tier.id}
              style={[
                styles.tierCard,
                tier.isPopular && styles.tierCardPopular,
              ]}
            >
              <View style={styles.tierLeft}>
                <View
                  style={[
                    styles.tierIconCircle,
                    tier.isPopular && styles.tierIconCirclePopular,
                  ]}
                >
                  {tier.isCat ? (
                    <HeartHandshake size={15} color={theme.colors.secondary.onContainer} />
                  ) : (
                    <PawPrint size={15} color={theme.colors.primary.navy} />
                  )}
                </View>

                <View style={styles.tierTextCol}>
                  <View style={styles.tierTitleRow}>
                    <Text
                      style={[
                        styles.tierTitle,
                        tier.isPopular && styles.tierTitlePopular,
                      ]}
                    >
                      {tier.title}
                    </Text>
                    {tier.isPopular && (
                      <View style={styles.standardBadge}>
                        <Text style={styles.standardText}>Standard</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.tierSubtext}>{tier.subtext}</Text>
                </View>
              </View>

              <Text
                style={[
                  styles.tierPrice,
                  tier.isPopular && styles.tierPricePopular,
                ]}
              >
                {tier.price.toLocaleString('vi-VN')}₫
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
  },
  card: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  basePriceText: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  basePriceSub: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '400',
  },
  packageBox: {
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[3] + 2,
    gap: theme.spacing[2],
  },
  packageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  packageName: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  popularBadge: {
    backgroundColor: theme.colors.tertiary.onContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  popularText: {
    ...theme.typography.label,
    fontSize: 9.5,
    fontWeight: '800',
    color: theme.colors.surface.lowest,
    letterSpacing: 0.5,
  },
  packageDesc: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
  },
  featureItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featureText: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing[1],
  },
  matrixTitle: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  matrixSub: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.muted,
  },
  tiersList: {
    gap: theme.spacing[2],
  },
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[3],
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.subdued,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tierCardPopular: {
    backgroundColor: theme.colors.surface.container,
    borderColor: theme.colors.secondary.container,
  },
  tierLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    flex: 1,
    paddingRight: theme.spacing[2],
  },
  tierIconCircle: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.lowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierIconCirclePopular: {
    backgroundColor: theme.colors.surface.lowest,
  },
  tierTextCol: {
    flex: 1,
  },
  tierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierTitle: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  tierTitlePopular: {
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  standardBadge: {
    backgroundColor: theme.colors.primary.navy,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radius.full,
  },
  standardText: {
    ...theme.typography.label,
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.text.inverse,
  },
  tierSubtext: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
  tierPrice: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  tierPricePopular: {
    color: theme.colors.primary.navy,
    fontWeight: '800',
  },
});
