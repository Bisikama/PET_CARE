import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Search,
  X,
  MessageSquare,
  ShieldCheck,
  Info,
  SlidersHorizontal,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { chatApi } from '@/infrastructure/api/chat.api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ChatRoom, ChatTabFilter } from '../types';
import { ChatConversationCard } from '../components/ChatConversationCard';

interface Props {
  role?: 'customer' | 'provider';
}

export function ChatHomeScreen({ role }: Props) {
  const router = useRouter();
  const { user } = useAuth();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ChatTabFilter>('ALL');

  // Determine user mode
  const isProviderMode = role === 'provider' || user?.role === 'PROVIDER';

  const fetchRooms = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await chatApi.getRooms();
      setRooms(data || []);
    } catch (err) {
      console.warn('Failed to load chat rooms:', err);
    } finally {
      if (showLoading) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms(true);
    // Auto-refresh chat list every 5s so when provider accepts or customer confirms, state is synced
    const interval = setInterval(() => {
      fetchRooms(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchRooms(false);
  }, [fetchRooms]);

  // Filter active and unique rooms by partner
  const uniqueRooms = useMemo(() => {
    const activeRooms = rooms.filter(
      (r) =>
        r.is_active &&
        r.booking?.status !== 'COMPLETED' &&
        r.booking?.status !== 'CANCELLED'
    );

    const partnerMap = new Map<string, ChatRoom>();
    for (const r of activeRooms) {
      const pid = r.partner?.id;
      if (!pid) continue;
      if (!partnerMap.has(pid)) {
        partnerMap.set(pid, r);
      }
    }
    return Array.from(partnerMap.values());
  }, [rooms]);

  // Filtered rooms with search
  const filteredRooms = useMemo(() => {
    let result = uniqueRooms;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((r) => {
        const partnerName = r.partner?.fullName?.toLowerCase() || '';
        const petName = r.booking?.pet_name?.toLowerCase() || '';
        const serviceTitle = r.booking?.service_title?.toLowerCase() || '';
        const lastMsg = r.last_message?.content?.toLowerCase() || '';
        return (
          partnerName.includes(q) ||
          petName.includes(q) ||
          serviceTitle.includes(q) ||
          lastMsg.includes(q)
        );
      });
    }

    return result;
  }, [uniqueRooms, searchQuery]);

  const activeCount = uniqueRooms.length;

  const handleOpenRoom = (room: ChatRoom) => {
    const routeBase = isProviderMode ? '/(provider)/chat/room' : '/(customer)/chat/room';
    router.push({
      pathname: routeBase as any,
      params: {
        roomId: room.id,
        bookingId: room.booking_id,
        partnerName: room.partner?.fullName,
        partnerAvatar: room.partner?.avatarUrl,
        partnerPhone: room.partner?.phoneNumber,
        serviceTitle: room.booking?.service_title,
        petName: room.booking?.pet_name,
        isActive: String(room.is_active),
      },
    });
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
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconCircle}>
            <MessageSquare size={20} color="#0B2A4A" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Hộp thư & Trao đổi</Text>
            <Text style={styles.headerSubtitle}>
              {activeCount > 0
                ? `${activeCount} cuộc trò chuyện đang hoạt động`
                : 'Kênh chat trực tiếp theo lịch hẹn'}
            </Text>
          </View>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color="#74777F" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo người nhắn, bé cưng, dịch vụ..."
            placeholderTextColor="#74777F"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={16} color="#74777F" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* POLICY NOTICE STRIP */}
      <View style={styles.policyNotice}>
        <Info size={14} color="#005236" style={{ marginTop: 1 }} />
        <Text style={styles.policyNoticeText}>
          Phòng chat mở ngay khi đối tác Chấp nhận đơn và tự động đóng sau khi hoàn tất Nghiệm thu.
        </Text>
      </View>


      {/* CONVERSATION LIST */}
      {isLoading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#0B2A4A" />
          <Text style={styles.loadingText}>Đang tải danh sách tin nhắn...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatConversationCard
              room={item}
              currentUserId={user?.id}
              onPress={handleOpenRoom}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#0B2A4A']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <MessageSquare size={36} color="#0B2A4A" />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'Không tìm thấy cuộc trò chuyện nào' : 'Chưa có phòng chat nào'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Vui lòng thử tìm kiếm với tên hoặc từ khóa khác.'
                  : isProviderMode
                  ? 'Khi bạn chấp nhận một đơn đặt lịch từ khách hàng, phòng chat riêng sẽ được mở tự động tại đây.'
                  : 'Khi đơn đặt lịch của bạn được chuyên viên chấp nhận, phòng chat trực tiếp sẽ tự động xuất hiện tại đây.'}
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0B2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B2A4A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF4FF',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0B1C30',
  },
  policyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E6F8F0',
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  policyNoticeText: {
    fontSize: 11,
    color: '#005236',
    flex: 1,
    lineHeight: 16,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E5EEFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#0B2A4A',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B2A4A',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00A472',
    marginRight: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 24,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B1C30',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
  },
});
