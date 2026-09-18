import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sliders, Edit3, PawPrint, Sparkles, Calendar, MapPin } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface BookingCriteriaSummaryCardProps {
  petName?: string;
  petBreed?: string;
  petWeight?: number;
  serviceTitle?: string;
  durationText?: string;
  dateSlotText?: string;
  locationText?: string;
  onEdit?: () => void;
}

export function BookingCriteriaSummaryCard({
  petName = 'Milo',
  petBreed = 'Golden Retriever',
  petWeight = 28,
  serviceTitle = 'Premium Dog Grooming',
  durationText = '60–90 min',
  dateSlotText = 'Sat, 20 Sep 2026 · 10:30 AM',
  locationText = 'District 2 / Thao Dien (Salon or Home)',
  onEdit,
}: BookingCriteriaSummaryCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Sliders size={16} color={theme.colors.primary.navy} />
            <Text style={styles.headerTitle}>CURRENT BOOKING CRITERIA</Text>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.7}
            onPress={onEdit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Edit3 size={13} color={theme.colors.primary.navy} />
            <Text style={styles.editBtnText}>Edit criteria</Text>
          </TouchableOpacity>
        </View>

        {/* 4 Criteria Items */}
        <View style={styles.criteriaList}>
          {/* Pet */}
          <View style={styles.criteriaRow}>
            <View style={styles.labelGroup}>
              <PawPrint size={15} color={theme.colors.primary.navy} />
              <Text style={styles.labelText}>Pet:</Text>
            </View>
            <Text style={styles.valueText} numberOfLines={1}>
              {petName} · {petBreed} ({petWeight} kg)
            </Text>
          </View>

          {/* Service */}
          <View style={styles.criteriaRow}>
            <View style={styles.labelGroup}>
              <Sparkles size={15} color={theme.colors.primary.navy} />
              <Text style={styles.labelText}>Service:</Text>
            </View>
            <Text style={styles.valueText} numberOfLines={1}>
              {serviceTitle} ({durationText})
            </Text>
          </View>

          {/* Date & Time */}
          <View style={styles.criteriaRow}>
            <View style={styles.labelGroup}>
              <Calendar size={15} color={theme.colors.primary.navy} />
              <Text style={styles.labelText}>Date & Time:</Text>
            </View>
            <Text style={styles.valueText} numberOfLines={1}>
              {dateSlotText}
            </Text>
          </View>

          {/* Location */}
          <View style={styles.criteriaRow}>
            <View style={styles.labelGroup}>
              <MapPin size={15} color={theme.colors.primary.navy} />
              <Text style={styles.labelText}>Location:</Text>
            </View>
            <Text style={styles.valueText} numberOfLines={1}>
              {locationText}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
  },
  card: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    gap: theme.spacing[3],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subdued,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    ...theme.typography.label,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.muted,
    letterSpacing: 0.5,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editBtnText: {
    ...theme.typography.label,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  criteriaList: {
    gap: theme.spacing[2],
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[2],
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  valueText: {
    ...theme.typography.label,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary.navy,
    flex: 1,
    textAlign: 'right',
  },
});
