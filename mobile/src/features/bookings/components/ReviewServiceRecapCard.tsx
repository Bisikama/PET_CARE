import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  Star,
  PawPrint,
} from 'lucide-react-native';
import { theme } from '@/core/theme';

interface ReviewServiceRecapCardProps {
  serviceTitle: string;
  providerName: string;
  providerAvatar?: string;
  providerRating?: number;
  providerAddress?: string;
  petName: string;
  petBreed?: string;
  petAvatarUrl?: string;
  petWeight?: string;
  dateSlotText: string;
  durationText?: string;
  sizeLabel?: string;
  addonsList?: string[];
}

export function ReviewServiceRecapCard({
  serviceTitle,
  providerName,
  providerAvatar = 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=300&q=80',
  providerRating = 4.9,
  providerAddress = '42 Tran Ngoc Dien, Thao Dien, D2, HCMC',
  petName,
  petBreed = 'Golden Retriever',
  petAvatarUrl = 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=200&q=80',
  petWeight = '18 kg',
  dateSlotText,
  durationText = '60 - 90 phút',
  sizeLabel = 'Cỡ lớn (15 - 25 kg)',
  addonsList = ['Vệ sinh răng miệng thảo mộc', 'Xịt dưỡng lông bóng mượt'],
}: ReviewServiceRecapCardProps) {
  return (
    <View style={styles.card}>
      {/* 1. Service & Provider Header */}
      <View style={styles.serviceHeaderRow}>
        <View style={styles.serviceIconCircle}>
          <Sparkles size={20} color={theme.colors.secondary.onContainer} />
        </View>
        <View style={styles.serviceInfoCol}>
          <Text style={styles.serviceTitleText} numberOfLines={1}>
            {serviceTitle}
          </Text>
          <View style={styles.providerLine}>
            <Text style={styles.providerNameText}>{providerName}</Text>
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={12} color={theme.colors.secondary.onContainer} />
              <Text style={styles.verifiedText}>Đã xác minh</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Star size={11} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{providerRating}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* 2. Pet Info Section */}
      <View style={styles.sectionRow}>
        <Image source={{ uri: petAvatarUrl }} style={styles.petAvatar} />
        <View style={styles.petInfoCol}>
          <View style={styles.petTitleRow}>
            <Text style={styles.petNameText}>{petName}</Text>
            <View style={styles.petBadge}>
              <PawPrint size={11} color={theme.colors.primary.navy} />
              <Text style={styles.petBadgeText}>{petBreed}</Text>
            </View>
          </View>
          <Text style={styles.petMetaText}>
            Phân loại: <Text style={styles.petMetaBold}>{sizeLabel}</Text> · {petWeight}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* 3. Date, Time & Location Section */}
      <View style={styles.metaGrid}>
        {/* Schedule */}
        <View style={styles.metaItem}>
          <View style={styles.metaIconWrap}>
            <Calendar size={15} color={theme.colors.primary.navy} />
          </View>
          <View style={styles.metaTextWrap}>
            <Text style={styles.metaLabel}>Thời gian hẹn</Text>
            <Text style={styles.metaValue}>{dateSlotText}</Text>
          </View>
        </View>

        {/* Duration */}
        <View style={styles.metaItem}>
          <View style={styles.metaIconWrap}>
            <Clock size={15} color={theme.colors.primary.navy} />
          </View>
          <View style={styles.metaTextWrap}>
            <Text style={styles.metaLabel}>Thời lượng ước tính</Text>
            <Text style={styles.metaValue}>{durationText}</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.metaItem}>
          <View style={styles.metaIconWrap}>
            <MapPin size={15} color={theme.colors.primary.navy} />
          </View>
          <View style={styles.metaTextWrap}>
            <Text style={styles.metaLabel}>Địa điểm thực hiện</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              Tại Salon · {providerAddress}
            </Text>
          </View>
        </View>
      </View>

      {/* 4. Included Addons (if any) */}
      {addonsList && addonsList.length > 0 && (
        <View style={styles.addonsContainer}>
          <Text style={styles.addonsHeader}>DỊCH VỤ BỔ SUNG ĐÃ CHỌN:</Text>
          <View style={styles.addonsChipsRow}>
            {addonsList.map((addon, idx) => (
              <View key={idx} style={styles.addonChip}>
                <Sparkles size={11} color={theme.colors.secondary.onContainer} />
                <Text style={styles.addonChipText}>{addon}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
    gap: theme.spacing[3],
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  serviceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfoCol: {
    flex: 1,
    gap: 3,
  },
  serviceTitleText: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  providerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  providerNameText: {
    ...theme.typography.label,
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: theme.colors.secondary.container,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.secondary.onContainer,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.subdued,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  petAvatar: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.subdued,
  },
  petInfoCol: {
    flex: 1,
    gap: 2,
  },
  petTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petNameText: {
    ...theme.typography.label,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  petBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.colors.surface.container,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  petBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary.navy,
  },
  petMetaText: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  petMetaBold: {
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  metaGrid: {
    gap: theme.spacing[2],
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[3],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaIconWrap: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.lowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaTextWrap: {
    flex: 1,
  },
  metaLabel: {
    ...theme.typography.label,
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.text.muted,
  },
  metaValue: {
    ...theme.typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  addonsContainer: {
    gap: 6,
    paddingTop: 2,
  },
  addonsHeader: {
    ...theme.typography.label,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.muted,
    letterSpacing: 0.5,
  },
  addonsChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  addonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surface.container,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.md,
  },
  addonChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.secondary.onContainer,
  },
});
