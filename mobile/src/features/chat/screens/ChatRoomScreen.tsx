import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Phone,
  Send,
  Image as ImageIcon,
  CheckCheck,
  Check,
  Lock,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { chatApi, ChatMessageItem } from '@/infrastructure/api/chat.api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ChatRoom, ChatMessage } from '../types';

interface Props {
  role?: 'customer' | 'provider';
}

const quickChips = [
  '🐾 Bé cưng thế nào rồi ạ?',
  '📸 Gửi giúp mình thêm ảnh bé nhé',
  '📍 Mình đang trên đường tới',
  '⏰ Khoảng mấy giờ xong ạ?',
  '👍 Cảm ơn bạn rất nhiều!',
];

export function ChatRoomScreen({ role }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    roomId?: string;
    bookingId?: string;
    partnerName?: string;
    partnerAvatar?: string;
    partnerPhone?: string;
    serviceTitle?: string;
    petName?: string;
    isActive?: string;
  }>();

  const isProviderMode = role === 'provider' || user?.role === 'PROVIDER';

  // Room & Messages state
  const [roomId, setRoomId] = useState<string | null>(params.roomId || null);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [canChat, setCanChat] = useState<boolean>(params.isActive !== 'false');

  const flatListRef = useRef<FlatList>(null);

  // Load room data & initial messages
  const loadRoom = useCallback(async () => {
    let targetRoomId = roomId;

    // If we only have bookingId, find room by bookingId
    if (!targetRoomId && params.bookingId) {
      const bookingRoomRes = await chatApi.getRoomByBookingId(params.bookingId);
      if (bookingRoomRes.room) {
        targetRoomId = bookingRoomRes.room.id;
        setRoomId(targetRoomId);
        setRoom(bookingRoomRes.room as any);
        setCanChat(bookingRoomRes.canChat);
      } else {
        setIsLoading(false);
        setCanChat(false);
        return;
      }
    }

    if (!targetRoomId) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await chatApi.getRoomMessages(targetRoomId);
      if (res.room) {
        setRoom(res.room as any);
        setCanChat(res.room.is_active);
      }
      setMessages(res.messages || []);
    } catch (err) {
      console.warn('Failed to load room messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, params.bookingId]);

  useEffect(() => {
    loadRoom();

    // Polling every 3s for new messages and status updates
    const interval = setInterval(() => {
      if (roomId) {
        chatApi.getRoomMessages(roomId).then((res) => {
          if (res.messages) {
            setMessages((prev) => {
              // Preserve any pending optimistic messages that haven't been confirmed yet
              const pendingOptimistic = prev.filter((m) => m.id.startsWith('temp-'));
              if (pendingOptimistic.length === 0) {
                return res.messages;
              }
              const serverContents = new Set(res.messages.map((m) => m.content));
              const remainingOptimistic = pendingOptimistic.filter(
                (om) => !serverContents.has(om.content)
              );
              return [...res.messages, ...remainingOptimistic];
            });
          }
          if (res.room) {
            setRoom(res.room as any);
            setCanChat(Boolean(res.room.is_active));
          }
        }).catch(() => {});
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [loadRoom, roomId]);


  // Derived Info
  const partnerName =
    room?.partner?.fullName || params.partnerName || 'Người dùng PetCare';
  const partnerAvatar =
    room?.partner?.avatarUrl ||
    params.partnerAvatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const partnerPhone = room?.partner?.phoneNumber || params.partnerPhone;

  const petName = room?.booking?.pet_name || params.petName || 'Bé cưng';
  const serviceTitle =
    room?.booking?.service_title || params.serviceTitle || 'Dịch vụ thú cưng';
  const bookingDate = room?.booking?.requested_date;

  const handleCall = () => {
    if (partnerPhone) {
      Linking.openURL(`tel:${partnerPhone}`).catch(() => {
        Alert.alert('Số điện thoại', partnerPhone);
      });
    } else {
      Alert.alert('Thông báo', 'Đối tác chưa cập nhật số điện thoại.');
    }
  };

  const handleViewBookingDetails = () => {
    const bookingId = room?.booking_id || params.bookingId;
    if (!bookingId) return;

    if (isProviderMode) {
      router.push({
        pathname: '/(provider)/booking-review',
        params: { id: bookingId },
      });
    } else {
      router.push({
        pathname: '/(customer)/bookings/customer_review_service',
        params: { id: bookingId },
      });
    }
  };

  const handleSendTextMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || !roomId) return;

    if (!canChat) {
      Alert.alert(
        'Phòng chat đã khóa',
        'Phòng chat này đã được đóng do dịch vụ đã hoàn tất nghiệm thu.'
      );
      return;
    }

    setInputText('');
    setIsSending(true);

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      chat_room_id: roomId,
      sender_id: user?.id || 'me',
      message_type: 'TEXT',
      content,
      is_read: false,
      created_at: new Date().toISOString(),
      users: {
        id: user?.id || 'me',
        fullName: (user as any)?.full_name || (user as any)?.fullName || 'Bạn',
        avatarUrl: (user as any)?.avatar_url || (user as any)?.avatarUrl,
      },
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const serverMsg = await chatApi.sendMessage(roomId, content);
      if (serverMsg) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (serverMsg as any) : m))
        );
      }
    } catch (err: any) {
      Alert.alert(
        'Lỗi gửi tin',
        err?.response?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.'
      );
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handlePickAndSendImage = async () => {
    if (!roomId || !canChat) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const asset = result.assets[0];
    setIsSending(true);

    try {
      const serverMsg = await chatApi.sendMessage(roomId, undefined, {
        uri: asset.uri,
        name: asset.fileName || 'photo.jpg',
        type: asset.mimeType || 'image/jpeg',
      });
      if (serverMsg) {
        setMessages((prev) => [...prev, serverMsg as any]);
      }
    } catch (err: any) {
      Alert.alert(
        'Lỗi tải ảnh',
        err?.response?.data?.message || 'Không thể gửi hình ảnh. Vui lòng thử lại.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <Screen
      withPadding={false}
      backgroundColor="#F8F9FF"
      edges={['top', 'left', 'right']}
      style={styles.screen}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={22} color="#0B1C30" />
          </TouchableOpacity>

          <Image source={{ uri: partnerAvatar }} style={styles.headerAvatar} />

          <View style={styles.headerPartnerInfo}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerPartnerName} numberOfLines={1}>
                {partnerName}
              </Text>
              <ShieldCheck size={14} color="#00A472" style={{ marginLeft: 4 }} />
            </View>
            <View style={styles.headerStatusRow}>
              {canChat ? (
                <>
                  <View style={styles.onlineDot} />
                  <Text style={styles.headerStatusText}>Đang hoạt động</Text>
                </>
              ) : (
                <>
                  <Lock size={11} color="#74777F" style={{ marginRight: 3 }} />
                  <Text style={styles.headerClosedText}>Đã hoàn tất nghiệm thu</Text>
                </>
              )}
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          {partnerPhone ? (
            <TouchableOpacity
              style={styles.callBtn}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <Phone size={18} color="#0B2A4A" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* PINNED BOOKING CONTEXT SUB-BAR */}
      <View style={styles.pinnedContextWrap}>
        <View style={styles.pinnedContextCard}>
          <View style={styles.contextLeft}>
            <View style={styles.contextIconBox}>
              <Text style={{ fontSize: 16 }}>🐾</Text>
            </View>
            <View style={styles.contextMeta}>
              <View style={styles.contextTagRow}>
                <Text style={styles.contextTag}>
                  {canChat ? 'Dịch vụ đang thực hiện' : 'Dịch vụ đã hoàn tất'}
                </Text>
                <View
                  style={[
                    styles.contextDot,
                    { backgroundColor: canChat ? '#00A472' : '#74777F' },
                  ]}
                />
              </View>
              <Text style={styles.contextTitle} numberOfLines={1}>
                {serviceTitle} • {petName}
              </Text>
              {bookingDate && (
                <Text style={styles.contextDate} numberOfLines={1}>
                  {new Date(bookingDate).toLocaleDateString('vi-VN', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={handleViewBookingDetails}
            activeOpacity={0.85}
          >
            <Text style={styles.detailsBtnText}>Chi tiết</Text>
            <ChevronRight size={14} color="#0B2A4A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* CHAT MESSAGES STREAM */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {isLoading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#0B2A4A" />
            <Text style={styles.loadingText}>Đang tải phòng chat...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesListContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const isMe =
                item.sender_id?.toLowerCase() === user?.id?.toLowerCase();

              return (
                <View
                  style={[
                    styles.messageRow,
                    isMe ? styles.messageRowMe : styles.messageRowPartner,
                  ]}
                >
                  {!isMe && (
                    <Image source={{ uri: partnerAvatar }} style={styles.bubbleAvatar} />
                  )}

                  <View
                    style={[
                      styles.bubbleWrapper,
                      isMe ? styles.bubbleWrapperMe : styles.bubbleWrapperPartner,
                    ]}
                  >
                    {!isMe && (
                      <Text style={styles.bubbleSenderName}>{partnerName}</Text>
                    )}

                    {item.message_type === 'IMAGE' && item.media_url ? (
                      <Image
                        source={{ uri: item.media_url }}
                        style={styles.messageImage}
                        resizeMode="cover"
                      />
                    ) : null}

                    {item.content ? (
                      <Text
                        style={[
                          styles.messageText,
                          isMe ? styles.messageTextMe : styles.messageTextPartner,
                        ]}
                      >
                        {item.content}
                      </Text>
                    ) : null}

                    <View style={styles.bubbleFooter}>
                      <Text
                        style={[
                          styles.timestampText,
                          isMe ? styles.timestampTextMe : styles.timestampTextPartner,
                        ]}
                      >
                        {formatMessageTime(item.created_at)}
                      </Text>
                      {isMe && (
                        item.is_read ? (
                          <CheckCheck size={12} color="#F5B82E" style={{ marginLeft: 3 }} />
                        ) : (
                          <Check size={12} color="#7892B7" style={{ marginLeft: 3 }} />
                        )
                      )}
                    </View>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyMessagesBox}>
                <View style={styles.sparkleCircle}>
                  {canChat ? (
                    <Sparkles size={24} color="#0B2A4A" />
                  ) : (
                    <Lock size={24} color="#74777F" />
                  )}
                </View>
                <Text style={styles.emptyMessagesTitle}>
                  {canChat ? 'Phòng chat đã kết nối!' : 'Phòng chat đã kết thúc'}
                </Text>
                <Text style={styles.emptyMessagesSub}>
                  {canChat
                    ? isProviderMode
                      ? 'Bạn có thể trao đổi thông tin chăm sóc bé, dặn dò hoặc gửi ảnh cập nhật cho khách hàng tại đây.'
                      : 'Bạn có thể trao đổi trực tiếp với người chăm sóc về tình trạng bé cưng tại đây.'
                    : 'Dịch vụ đã hoàn tất nghiệm thu nên phòng chat đã được đóng.'}
                </Text>
              </View>
            }
          />
        )}

        {/* QUICK SUGGESTIONS CHIPS (Only when room is active) */}
        {canChat && (
          <View style={styles.quickChipsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickChipsContent}
            >
              {quickChips.map((chip, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickChipBtn}
                  onPress={() => handleSendTextMessage(chip)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickChipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* BOTTOM INPUT DOCK */}
        {canChat ? (
          <View style={styles.inputDock}>
            <TouchableOpacity
              style={styles.attachBtn}
              onPress={handlePickAndSendImage}
              activeOpacity={0.7}
              disabled={isSending}
            >
              <ImageIcon size={22} color="#0B2A4A" />
            </TouchableOpacity>

            <TextInput
              style={styles.dockTextInput}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#74777F"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                !inputText.trim() && styles.sendBtnDisabled,
              ]}
              onPress={() => handleSendTextMessage()}
              disabled={!inputText.trim() || isSending}
              activeOpacity={0.85}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.closedDockNotice}>
            <Lock size={16} color="#74777F" style={{ marginRight: 6 }} />
            <Text style={styles.closedDockNoticeText}>
              Phòng chat đã đóng vì dịch vụ đã được hoàn tất nghiệm thu.
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFF4FF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF4FF',
    marginRight: 10,
  },
  headerPartnerInfo: {
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerPartnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1C30',
    maxWidth: '85%',
  },
  headerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00A472',
    marginRight: 4,
  },
  headerStatusText: {
    fontSize: 11,
    color: '#005236',
    fontWeight: '600',
  },
  headerClosedText: {
    fontSize: 11,
    color: '#74777F',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinnedContextWrap: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FF',
  },
  pinnedContextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF4FF',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE9FF',
  },
  contextLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  contextIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FDBF35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  contextMeta: {
    flex: 1,
  },
  contextTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contextTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7B5800',
    textTransform: 'uppercase',
  },
  contextDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginLeft: 4,
  },
  contextTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
    marginTop: 1,
  },
  contextDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  messagesListContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '85%',
  },
  messageRowMe: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  messageRowPartner: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5EEFF',
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  bubbleWrapper: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleWrapperMe: {
    backgroundColor: '#0B2A4A',
    borderBottomRightRadius: 4,
  },
  bubbleWrapperPartner: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleSenderName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#74777F',
    marginBottom: 3,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#FFFFFF',
  },
  messageTextPartner: {
    color: '#0B1C30',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 6,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestampText: {
    fontSize: 10,
  },
  timestampTextMe: {
    color: '#7892B7',
  },
  timestampTextPartner: {
    color: '#74777F',
  },
  emptyMessagesBox: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  sparkleCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyMessagesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1C30',
    marginBottom: 6,
  },
  emptyMessagesSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  quickChipsWrapper: {
    paddingVertical: 6,
    backgroundColor: '#F8F9FF',
  },
  quickChipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickChipBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFF4FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B2A4A',
  },
  inputDock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFF4FF',
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockTextInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#EFF4FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0B1C30',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0B2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  closedDockNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F1F3F5',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  closedDockNoticeText: {
    fontSize: 12,
    color: '#74777F',
    fontWeight: '600',
    textAlign: 'center',
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
  },
});
