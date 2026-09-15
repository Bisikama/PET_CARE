import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import {
  CalendarDays,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Navigation,
  CheckCircle2,
} from 'lucide-react-native';
import { theme } from '@/core/theme';
import { UpcomingAppointment } from '../types/home.types';

interface UpcomingAppointmentCardProps {
  appointment?: UpcomingAppointment;
  onViewBooking?: (id: string) => void;
  onDirections?: (id: string) => void;
  onSeeAll?: () => void;
}

const defaultAppointment: UpcomingAppointment = {
  id: 'bk-01',
  providerName: 'Happy Paws Care',
  providerImage:
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=200&q=80',
  isVerified: true,
  serviceTitle: 'Premium Grooming',
  petName: 'Milo',
  petBreed: 'Golden',
  date: '20 Sep',
  time: '10:30 AM',
  locationType: 'Salon Visit',
  status: 'confirmed',
};

export function UpcomingAppointmentCard({
  appointment = defaultAppointment,
  onViewBooking,
  onDirections,
  onSeeAll,
}: UpcomingAppointmentCardProps) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <CalendarDays size={20} color={theme.colors.primary.navy} />
          <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={onSeeAll}>
          <Text style={styles.badgeActiveText}>1 Active</Text>
        </TouchableOpacity>
      </View>

      {/* Main Card */}
      <View style={styles.card}>
        {/* Top Info */}
        <View style={styles.topInfoRow}>
          <View style={styles.providerInfo}>
            <Image
              source={{ uri: appointment.providerImage }}
              style={styles.providerAvatar}
            />
            <View style={styles.providerTextContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.providerName} numberOfLines={1}>
                  {appointment.providerName}
                </Text>
                {appointment.isVerified && (
                  <CheckCircle2
                    size={15}
                    color={theme.colors.tertiary.default}
                  />
                )}
              </View>
              <Text style={styles.serviceSubtitle} numberOfLines={1}>
                {appointment.serviceTitle} •{' '}
                <Text style={styles.petNameHighlight}>
                  {appointment.petName}{' '}
                  {appointment.petBreed ? `(${appointment.petBreed})` : ''}
                </Text>
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <View style={styles.statusPulseDot} />
            <Text style={styles.statusText}>Confirmed</Text>
          </View>
        </View>

        {/* Details Pill Box */}
        <View style={styles.detailsBox}>
          <View style={styles.detailItem}>
            <Calendar size={16} color={theme.colors.text.secondary} />
            <Text style={styles.detailTextBold}>{appointment.date}</Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <Clock size={16} color={theme.colors.text.secondary} />
            <Text style={styles.detailTextBold}>{appointment.time}</Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <MapPin size={16} color={theme.colors.text.secondary} />
            <Text style={styles.detailTextRegular}>
              {appointment.locationType}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.viewButton}
            activeOpacity={0.85}
            onPress={() => onViewBooking?.(appointment.id)}
          >
            <Text style={styles.viewButtonText}>View Booking</Text>
            <ChevronRight size={18} color={theme.colors.text.inverse} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.directionButton}
            activeOpacity={0.8}
            onPress={() => onDirections?.(appointment.id)}
            accessibilityLabel="Directions"
          >
            <Navigation size={18} color={theme.colors.primary.navy} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[5],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[2],
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  badgeActiveText: {
    ...theme.typography.bodySm,
    color: theme.colors.secondary.container,
    fontWeight: '700',
  },
  card: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    ...theme.shadows.sm,
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    flex: 1,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.containerHigh,
  },
  providerTextContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerName: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.primary.navy,
    fontWeight: '700',
  },
  serviceSubtitle: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  petNameHighlight: {
    fontWeight: '600',
    color: theme.colors.primary.navy,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  statusPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.tertiary.default,
  },
  statusText: {
    ...theme.typography.label,
    color: theme.colors.tertiary.onContainer,
    fontWeight: '700',
  },
  detailsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailTextBold: {
    ...theme.typography.bodySm,
    color: theme.colors.primary.navy,
    fontWeight: '700',
  },
  detailTextRegular: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
  },
  detailDivider: {
    width: 1,
    height: 14,
    backgroundColor: theme.colors.border.outlineVariant,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  viewButton: {
    flex: 1,
    height: 44,
    backgroundColor: theme.colors.primary.navy,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  viewButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
    fontWeight: '700',
  },
  directionButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
