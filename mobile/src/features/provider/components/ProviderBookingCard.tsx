import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Sparkles,
  Phone,
  ArrowRight,
  PlayCircle,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';
import { theme } from '@/core/theme';
import { formatCurrency } from '@/core/utils/currency';
import { ProviderBookingItem } from '@/infrastructure/api/bookings.api';

interface ProviderBookingCardProps {
  booking: ProviderBookingItem;
  onAccept?: (booking: ProviderBookingItem) => void;
  onReject?: (booking: ProviderBookingItem) => void;
  onAction?: (booking: ProviderBookingItem) => void;
  onReviewRequest?: (booking: ProviderBookingItem) => void;
  isActionLoading?: boolean;
}

export function ProviderBookingCard({
  booking,
  onAccept,
  onReject,
  onAction,
  onReviewRequest,
  isActionLoading,
}: ProviderBookingCardProps) {
  // Extract Pet Information
  const primaryPet = booking.booking_pets?.[0]?.pets || {
    name: booking.booking_pets?.[0]?.pet_name || 'Bé cưng',
    species: booking.booking_pets?.[0]?.species || 'Thú cưng',
    breed: booking.booking_pets?.[0]?.breed || 'Chưa rõ giống',
    weight: booking.booking_pets?.[0]?.weight || 4.5,
    avatar_url: booking.booking_pets?.[0]?.avatar_url,
  };

  const petAvatar =
    primaryPet.avatar_url ||
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80';

  // Extract Service Information
  const primaryService = booking.booking_pets?.[0]?.booking_services?.[0];
  const serviceName =
    primaryService?.service_name ||
    primaryService?.provider_services?.services?.name ||
    primaryService?.provider_services?.services?.title ||
    'Dịch vụ chăm sóc thú cưng';
  const duration =
    booking.service_duration_minutes ||
    primaryService?.duration_minutes ||
    60;

  // Extract Customer Information
  const customerName =
    booking.users?.fullName ||
    booking.users?.full_name ||
    booking.customer_addresses?.receiver_name ||
    'Khách hàng thân thiết';

  // Extract Location
  const districtCity =
    booking.customer_addresses?.district && booking.customer_addresses?.city
      ? `${booking.customer_addresses.district} · ${booking.customer_addresses.city}`
      : booking.customer_addresses?.formatted_address ||
        booking.customer_addresses?.address_line ||
        'Tại nhà khách hàng';

  // Format Time
  const startTime = booking.estimated_start_at
    ? new Date(booking.estimated_start_at).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '09:00';
  const endTime = booking.estimated_end_at
    ? new Date(booking.estimated_end_at).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '10:00';

  // Format Date
  const dateFormatted = booking.requested_date || booking.estimated_start_at
    ? new Date(booking.requested_date || booking.estimated_start_at!).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Hôm nay';

  // Total Price
  const numericPrice =
    typeof booking.total_price === 'string'
      ? parseFloat(booking.total_price)
      : booking.total_price || 0;

  // Render Status Badge
  const renderStatusBadge = () => {
    switch (booking.status) {
      case 'PENDING_PROVIDER_ACCEPTANCE':
        return (
          <View style={[styles.statusBadge, styles.statusNew]}>
            <View style={[styles.statusDot, { backgroundColor: '#FDBF35' }]} />
            <Text style={styles.statusNewText}>New Request</Text>
          </View>
        );
      case 'IN_PROGRESS':
        return (
          <View style={[styles.statusBadge, styles.statusInProgress]}>
            <View style={[styles.statusDot, { backgroundColor: '#4EDEA3' }]} />
            <Text style={styles.statusInProgressText}>In Progress</Text>
          </View>
        );
      case 'ACCEPTED':
        return (
          <View style={[styles.statusBadge, styles.statusAccepted]}>
            <View style={[styles.statusDot, { backgroundColor: '#0B2A4A' }]} />
            <Text style={styles.statusAcceptedText}>Confirmed</Text>
          </View>
        );
      case 'COMPLETED':
        return (
          <View style={[styles.statusBadge, styles.statusCompleted]}>
            <View style={[styles.statusDot, { backgroundColor: '#74777F' }]} />
            <Text style={styles.statusCompletedText}>Completed</Text>
          </View>
        );
      case 'CANCELLED':
      case 'REJECTED':
        return (
          <View style={[styles.statusBadge, styles.statusCancelled]}>
            <View style={[styles.statusDot, { backgroundColor: '#BA1A1A' }]} />
            <Text style={styles.statusCancelledText}>
              {booking.status === 'REJECTED' ? 'Rejected' : 'Cancelled'}
            </Text>
          </View>
        );
      default:
        return (
          <View style={[styles.statusBadge, styles.statusAccepted]}>
            <Text style={styles.statusAcceptedText}>{booking.status}</Text>
          </View>
        );
    }
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => onAction?.(booking)}
      activeOpacity={0.94}
    >
      {booking.status === 'IN_PROGRESS' && <View style={styles.inProgressRibbon} />}

      {/* Top Row: Status badge & Appointment date */}
      <View style={styles.topRow}>
        {renderStatusBadge()}
        <View style={styles.dateContainer}>
          <Calendar size={14} color="#74777F" />
          <Text style={styles.dateText}>{dateFormatted}</Text>
        </View>
      </View>

      {/* Main Pet Info Row */}
      <View style={styles.petRow}>
        <Image source={{ uri: petAvatar }} style={styles.petAvatar} />
        <View style={styles.petInfo}>
          <View style={styles.petNameRow}>
            <Text style={styles.petName} numberOfLines={1}>
              {primaryPet.name}
            </Text>
            <View style={styles.breedChip}>
              <View style={styles.breedDot} />
              <Text style={styles.breedText} numberOfLines={1}>
                {primaryPet.breed}
              </Text>
            </View>
          </View>
          <Text style={styles.petWeight}>
            {primaryPet.weight ? `${primaryPet.weight} kg` : primaryPet.species}
          </Text>
        </View>
      </View>

      {/* Details Micro-Card */}
      <View style={styles.detailsBlock}>
        {/* Service name & duration */}
        <View style={styles.detailRow}>
          <View style={styles.serviceIconContainer}>
            <Sparkles size={14} color="#0B2A4A" />
          </View>
          <Text style={styles.serviceTitle} numberOfLines={1}>
            {serviceName}
          </Text>
          <Text style={styles.serviceDuration}>· {duration} min</Text>
        </View>

        {/* Schedule & Location Grid */}
        <View style={styles.gridRow}>
          <View style={styles.gridCol}>
            <Clock size={16} color="#74777F" />
            <Text style={styles.gridText} numberOfLines={1}>
              {startTime} – {endTime}
            </Text>
          </View>
          <View style={styles.gridCol}>
            <MapPin size={16} color="#74777F" />
            <Text style={styles.gridText} numberOfLines={1}>
              {districtCity}
            </Text>
          </View>
        </View>

        {/* Customer Name */}
        <View style={styles.customerRow}>
          <User size={16} color="#74777F" />
          <Text style={styles.customerText} numberOfLines={1}>
            Khách hàng:{' '}
            <Text style={styles.customerNameBold}>{customerName}</Text>
          </Text>
        </View>
      </View>

      {/* Price & CTA Footer */}
      <View style={styles.footerRow}>
        <View>
          <Text style={styles.totalLabel}>Booking Total</Text>
          <Text style={styles.totalPrice}>{formatCurrency(numericPrice)}</Text>
        </View>

        {/* Dynamic Action Buttons */}
        {booking.status === 'PENDING_PROVIDER_ACCEPTANCE' ? (
          <TouchableOpacity
            style={styles.reviewRequestButton}
            onPress={() => onReviewRequest ? onReviewRequest(booking) : onAction?.(booking)}
            activeOpacity={0.85}
          >
            <Text style={styles.reviewRequestButtonText}>Review Request</Text>
            <ArrowRight size={18} color="#261900" />
          </TouchableOpacity>
        ) : booking.status === 'IN_PROGRESS' ? (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => onAction?.(booking)}
            activeOpacity={0.85}
          >
            <PlayCircle size={18} color="#261900" />
            <Text style={styles.continueButtonText}>Làm dịch vụ</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => onAction?.(booking)}
            activeOpacity={0.8}
          >
            <Text style={styles.viewButtonText}>Chi tiết</Text>
            <ChevronRight size={18} color="#0B2A4A" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  inProgressRibbon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#00A472',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusNew: {
    backgroundColor: '#FFDEA5',
  },
  statusNewText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5D4200',
    letterSpacing: 0.2,
  },
  statusInProgress: {
    backgroundColor: '#0B2A4A',
  },
  statusInProgressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  statusAccepted: {
    backgroundColor: '#DCE9FF',
  },
  statusAcceptedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B2A4A',
    letterSpacing: 0.2,
  },
  statusCompleted: {
    backgroundColor: '#EFF4FF',
  },
  statusCompletedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#43474E',
  },
  statusCancelled: {
    backgroundColor: '#FFDAD6',
  },
  statusCancelledText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BA1A1A',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#74777F',
    fontWeight: '500',
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  petAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EFF4FF',
    marginRight: 12,
  },
  petInfo: {
    flex: 1,
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2A4A',
    maxWidth: 140,
  },
  breedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  breedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FDBF35',
    marginRight: 4,
  },
  breedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0B2A4A',
    maxWidth: 100,
  },
  petWeight: {
    fontSize: 13,
    color: '#74777F',
    marginTop: 2,
    fontWeight: '500',
  },
  detailsBlock: {
    backgroundColor: '#EFF4FF',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#DCE9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B2A4A',
    flex: 1,
  },
  serviceDuration: {
    fontSize: 12,
    color: '#74777F',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  gridCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  gridText: {
    fontSize: 12,
    color: '#0B2A4A',
    fontWeight: '500',
    flex: 1,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  customerText: {
    fontSize: 12,
    color: '#74777F',
    flex: 1,
  },
  customerNameBold: {
    color: '#0B2A4A',
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#74777F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B2A4A',
    marginTop: 1,
  },
  actionButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  declineButton: {
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFDAD6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  declineButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#BA1A1A',
  },
  reviewRequestButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FDBF35',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#FDBF35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewRequestButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#261900',
  },
  acceptButton: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FDBF35',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#FDBF35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  acceptButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#261900',
  },
  continueButton: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FDBF35',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#FDBF35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  continueButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#261900',
  },
  viewButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#EFF4FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B2A4A',
  },
});
