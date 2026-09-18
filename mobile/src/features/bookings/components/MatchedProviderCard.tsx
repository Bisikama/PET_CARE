import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  PawPrint,
  ArrowRight,
} from 'lucide-react-native';
import { theme } from '@/core/theme';
import { MatchedProviderItem } from '../types/booking.types';

interface MatchedProviderCardProps {
  provider: MatchedProviderItem;
  isSelected: boolean;
  petName?: string;
  onSelect: () => void;
  onViewDetails?: () => void;
}

export function MatchedProviderCard({
  provider,
  isSelected,
  petName = 'Milo',
  onSelect,
  onViewDetails,
}: MatchedProviderCardProps) {
  return (
    <View
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        provider.isBestChoice && styles.cardBestChoice,
      ]}
    >
      {/* Compatibility / Highlight Banner */}
      {provider.compatibilityScore && (
        <View style={styles.highlightBanner}>
          <View style={styles.compatLeft}>
            <ThumbsUp size={14} color={theme.colors.secondary.onContainer} />
            <Text style={styles.compatText}>
              {provider.compatibilityScore}% Compatibility Match
            </Text>
          </View>
          {provider.isBestChoice && (
            <View style={styles.bestChoicePill}>
              <Text style={styles.bestChoiceText}>BEST CHOICE</Text>
            </View>
          )}
        </View>
      )}

      {/* Identity Row */}
      <View style={styles.identityRow}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: provider.avatarUrl }} style={styles.avatar} />
        </View>

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.providerName} numberOfLines={1}>
              {provider.name}
            </Text>
            {provider.isVerified && (
              <CheckCircle2
                size={16}
                color={theme.colors.tertiary.onContainer}
                fill={theme.colors.surface.lowest}
              />
            )}
          </View>

          <Text style={styles.tagline} numberOfLines={1}>
            {provider.tagline}
          </Text>

          {/* Ratings & Jobs */}
          <View style={styles.ratingRow}>
            <Star
              size={13}
              color={theme.colors.secondary.container}
              fill={theme.colors.secondary.container}
            />
            <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({provider.reviewCount})</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.jobsCount}>
              {provider.completedJobs}+ completed jobs
            </Text>
          </View>
        </View>
      </View>

      {/* Why matches pet box */}
      <View style={styles.matchBox}>
        <View style={styles.matchTitleRow}>
          <PawPrint size={14} color={theme.colors.secondary.onContainer} />
          <Text style={styles.matchTitle}>
            Why this provider matches {petName}:
          </Text>
        </View>

        <View style={styles.reasonsList}>
          {provider.matchReasons.map((reason, idx) => (
            <View key={idx} style={styles.reasonRow}>
              <CheckCircle2
                size={13}
                color={theme.colors.tertiary.onContainer}
                style={styles.reasonIcon}
              />
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Pricing & Actions */}
      <View style={styles.bottomRow}>
        <View style={styles.priceCol}>
          <View style={styles.priceLine}>
            <Text style={styles.priceNumber}>
              {provider.price.toLocaleString('vi-VN')}₫
            </Text>
            <Text style={styles.priceUnit}>/ session</Text>
          </View>
          <Text style={styles.priceSubtext} numberOfLines={1}>
            {provider.priceSubtext}
          </Text>
        </View>

        <View style={styles.actionBtns}>
          <TouchableOpacity
            style={styles.detailsBtn}
            activeOpacity={0.75}
            onPress={onViewDetails}
          >
            <Text style={styles.detailsBtnText}>Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chooseBtn,
              isSelected && styles.chooseBtnActive,
            ]}
            activeOpacity={0.88}
            onPress={onSelect}
          >
            <Text style={styles.chooseBtnText}>
              {isSelected ? 'Selected' : 'Choose'}
            </Text>
            <ArrowRight
              size={15}
              color={theme.colors.secondary.onContainer}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: theme.colors.primary.navy,
    ...theme.shadows.md,
  },
  cardBestChoice: {
    borderWidth: 1.5,
    borderColor: theme.colors.secondary.container,
  },
  highlightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.secondary.container,
    marginHorizontal: -theme.spacing[4],
    marginTop: -theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: 6,
  },
  compatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compatText: {
    ...theme.typography.label,
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.secondary.onContainer,
  },
  bestChoicePill: {
    backgroundColor: theme.colors.primary.navy,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  bestChoiceText: {
    ...theme.typography.label,
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.text.inverse,
    letterSpacing: 0.5,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
  },
  avatarWrapper: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface.container,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  providerName: {
    ...theme.typography.h4,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary.navy,
    flex: 1,
  },
  tagline: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  ratingText: {
    ...theme.typography.label,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  reviewCount: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.muted,
  },
  dot: {
    color: theme.colors.text.light,
    fontSize: 10,
  },
  jobsCount: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  matchBox: {
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[3],
    gap: theme.spacing[1] + 2,
  },
  matchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchTitle: {
    ...theme.typography.label,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  reasonsList: {
    gap: 4,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  reasonIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  reasonText: {
    ...theme.typography.bodySm,
    fontSize: 11.5,
    color: theme.colors.text.primary,
    flex: 1,
    lineHeight: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing[2],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subdued,
  },
  priceCol: {
    flex: 1,
  },
  priceLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  priceNumber: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  priceUnit: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.muted,
  },
  priceSubtext: {
    ...theme.typography.bodySm,
    fontSize: 10.5,
    color: theme.colors.text.secondary,
  },
  actionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  detailsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.lowest,
    borderWidth: 1,
    borderColor: theme.colors.border.outlineVariant,
  },
  detailsBtnText: {
    ...theme.typography.label,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  chooseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.secondary.container,
    ...theme.shadows.sm,
  },
  chooseBtnActive: {
    backgroundColor: theme.colors.primary.navy,
  },
  chooseBtnText: {
    ...theme.typography.label,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.secondary.onContainer,
  },
});
