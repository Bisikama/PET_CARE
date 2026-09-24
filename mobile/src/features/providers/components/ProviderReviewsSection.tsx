import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Star, MessageSquare, ThumbsUp, Smile, Clock, Camera } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { ProviderReview } from '../types/provider.types';

interface ProviderReviewsSectionProps {
  rating?: number;
  reviewCount?: number;
  featuredReview?: ProviderReview;
}

const defaultReview: ProviderReview = {
  id: 'rev-01',
  authorName: 'Sarah J.',
  petOwnerInfo: 'Owner of Copper (Golden Retriever)',
  authorAvatarUrl:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  rating: 5,
  comment:
    '"Elena is extraordinary! Copper literally waits by the door when she\'s on her way. She handles his high energy with so much calm confidence and the photo updates are pure joy."',
  timeAgo: '3 days ago',
  isVerifiedWalk: true,
};

export function ProviderReviewsSection({
  rating = 4.98,
  reviewCount = 142,
  featuredReview = defaultReview,
}: ProviderReviewsSectionProps) {
  const tags = [
    { label: 'Reliable (98)', Icon: ThumbsUp },
    { label: 'Caring (112)', Icon: Smile },
    { label: 'Always on time (84)', Icon: Clock },
    { label: 'Sends great photos (79)', Icon: Camera },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.iconCircle}>
              <MessageSquare size={15} color={theme.colors.secondary.onContainer} />
            </View>
            <Text style={styles.title}>Client Reviews</Text>
          </View>

          <View style={styles.ratingBadge}>
            <Star
              size={15}
              color={theme.colors.secondary.container}
              fill={theme.colors.secondary.container}
            />
            <Text style={styles.ratingText}>{rating.toFixed(2)}</Text>
          </View>
        </View>

        {/* Review Tag Pills */}
        <View style={styles.tagsRow}>
          {tags.map((t, idx) => {
            const Icon = t.Icon;
            return (
              <View key={idx} style={styles.tagPill}>
                <Icon size={12} color={theme.colors.tertiary.onContainer} />
                <Text style={styles.tagText}>{t.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Featured Review Box */}
        <View style={styles.reviewBox}>
          <View style={styles.reviewHeader}>
            <View style={styles.authorRow}>
              <Image
                source={{ uri: featuredReview.authorAvatarUrl }}
                style={styles.authorAvatar}
              />
              <View>
                <Text style={styles.authorName}>{featuredReview.authorName}</Text>
                <Text style={styles.authorPet}>{featuredReview.petOwnerInfo}</Text>
              </View>
            </View>

            {/* Stars */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={13}
                  color={theme.colors.secondary.container}
                  fill={theme.colors.secondary.container}
                />
              ))}
            </View>
          </View>

          <Text style={styles.reviewComment}>{featuredReview.comment}</Text>

          <Text style={styles.reviewMeta}>
            {featuredReview.timeAgo} • {featuredReview.isVerifiedWalk ? 'Verified Walk' : 'Verified Review'}
          </Text>
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
  title: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...theme.typography.label,
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surface.subdued,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  tagText: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  reviewBox: {
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[3] + 2,
    gap: theme.spacing[2],
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface.container,
  },
  authorName: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  authorPet: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    ...theme.typography.bodyMd,
    fontSize: 13,
    fontStyle: 'italic',
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  reviewMeta: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.muted,
  },
});
