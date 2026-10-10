import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { CheckCheck, Check, ShieldCheck, Lock, Sparkles } from 'lucide-react-native';
import { ChatRoom } from '../types';
import { theme } from '@/core/theme';

interface Props {
  room: ChatRoom;
  currentUserId?: string;
  onPress: (room: ChatRoom) => void;
}

export const ChatConversationCard: React.FC<Props> = ({ room, currentUserId, onPress }) => {
  const partner = room.partner;
  const partnerName = partner?.fullName || 'Người dùng PetCare';
  const partnerAvatar =
    partner?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  const booking = room.booking;
  const petName = booking?.pet_name || 'Bé cưng';
  const serviceTitle = booking?.service_title || 'Dịch vụ chăm sóc thú cưng';

  const lastMsg = room.last_message;
  const isMe = lastMsg?.sender_id === currentUserId;

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      if (isToday) {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  const getSnippet = () => {
    if (!lastMsg) {
      return room.is_active
        ? 'Phòng chat đã mở. Hãy bắt đầu nhắn tin...'
        : 'Phòng chat đã đóng sau khi hoàn tất nghiệm thu.';
    }
    if (lastMsg.message_type === 'IMAGE') return isMe ? 'Bạn: [Hình ảnh]' : '[Hình ảnh]';
    if (lastMsg.message_type === 'VIDEO') return isMe ? 'Bạn: [Video]' : '[Video]';
    const text = lastMsg.content || '';
    return isMe ? `Bạn: ${text}` : text;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(room)}
      activeOpacity={0.88}
    >
      <View style={styles.contentRow}>
        {/* Avatar with Online/Active dot */}
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: partnerAvatar }} style={styles.avatar} />
          {room.is_active ? (
            <View style={styles.onlineBadge} />
          ) : (
            <View style={styles.closedBadge}>
              <Lock size={8} color="#FFFFFF" strokeWidth={3} />
            </View>
          )}
        </View>

        {/* Identity & Metadata */}
        <View style={styles.infoWrapper}>
          <View style={styles.headerRow}>
            <View style={styles.nameRow}>
              <Text style={styles.partnerName} numberOfLines={1}>
                {partnerName}
              </Text>
              <ShieldCheck size={14} color="#00A472" style={styles.verifiedIcon} />
            </View>
            <Text style={styles.timeText}>{formatTime(lastMsg?.created_at || room.created_at)}</Text>
          </View>

          {/* Service & Pet Chip */}
          <View style={styles.chipRow}>
            <View style={styles.serviceChip}>
              <Text style={styles.pawIcon}>🐾</Text>
              <Text style={styles.serviceText} numberOfLines={1}>
                {serviceTitle} • {petName}
              </Text>
            </View>

            {room.is_active ? (
              <View style={styles.activeTag}>
                <View style={styles.activeDot} />
                <Text style={styles.activeTagText}>Đang hoạt động</Text>
              </View>
            ) : (
              <View style={styles.closedTag}>
                <Text style={styles.closedTagText}>Đã nghiệm thu</Text>
              </View>
            )}
          </View>

          {/* Last Message Preview */}
          <View style={styles.messageRow}>
            <Text
              style={[
                styles.snippetText,
                !lastMsg?.is_read && !isMe && lastMsg ? styles.unreadSnippetText : undefined,
              ]}
              numberOfLines={1}
            >
              {getSnippet()}
            </Text>

            {isMe && lastMsg ? (
              lastMsg.is_read ? (
                <CheckCheck size={14} color="#0B2A4A" style={styles.receiptIcon} />
              ) : (
                <Check size={14} color="#74777F" style={styles.receiptIcon} />
              )
            ) : !lastMsg?.is_read && lastMsg ? (
              <View style={styles.unreadPill}>
                <Text style={styles.unreadPillText}>Mới</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EFF4FF',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5EEFF',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#00A472',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  closedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#74777F',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoWrapper: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1C30',
    maxWidth: '85%',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#74777F',
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF4FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: '65%',
  },
  pawIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  serviceText: {
    fontSize: 11,
    color: '#0B2A4A',
    fontWeight: '600',
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F8F0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00A472',
    marginRight: 4,
  },
  activeTagText: {
    fontSize: 10,
    color: '#005236',
    fontWeight: '700',
  },
  closedTag: {
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  closedTagText: {
    fontSize: 10,
    color: '#74777F',
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  snippetText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
    marginRight: 8,
  },
  unreadSnippetText: {
    color: '#0B1C30',
    fontWeight: '700',
  },
  receiptIcon: {
    marginLeft: 4,
  },
  unreadPill: {
    backgroundColor: '#F5B82E',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadPillText: {
    fontSize: 10,
    color: '#00152D',
    fontWeight: '800',
  },
});
