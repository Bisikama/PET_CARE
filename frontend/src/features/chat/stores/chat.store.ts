import { create } from 'zustand';
import { chatService } from '../services/chat.service';
import { ChatMessage, ChatRoom, SendMediaMessageDto } from '../types/chat.types';

interface ChatState {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  messagesByRoomId: Record<string, ChatMessage[]>;
  isLoading: boolean;
  isSending: boolean;
  isOpen: boolean;
  error: string | null;

  openModal: (roomId?: string) => void;
  closeModal: () => void;
  setActiveRoomId: (roomId: string) => void;
  fetchRooms: (force?: boolean) => Promise<void>;
  fetchMessages: (roomId: string, force?: boolean) => Promise<void>;
  sendMediaMessage: (roomId: string, dto: SendMediaMessageDto) => Promise<boolean>;
  sendMessage: (roomId: string, content: string, file?: File) => Promise<boolean>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  activeRoomId: null,
  messagesByRoomId: {},
  isLoading: false,
  isSending: false,
  isOpen: false,
  error: null,

  openModal: (roomId) => set({ isOpen: true, activeRoomId: roomId || null, error: null }),
  closeModal: () => set({ isOpen: false, error: null }),
  setActiveRoomId: (roomId) => set({ activeRoomId: roomId }),

  fetchRooms: async (force = false) => {
    if (!force && get().rooms.length > 0) return;
    set({ isLoading: true, error: null });
    try {
      const res = await chatService.getRooms();
      const rooms = Array.isArray(res) ? res : [];
      const activeRoomId = get().activeRoomId || (rooms.length > 0 ? rooms[0].id : null);
      set({ rooms, activeRoomId, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải danh sách phòng chat', isLoading: false });
    }
  },

  fetchMessages: async (roomId: string, force = false) => {
    if (!roomId) return;
    if (!force && get().messagesByRoomId[roomId]) return;
    const isFirstLoad = !get().messagesByRoomId[roomId];
    if (isFirstLoad) set({ isLoading: true, error: null });
    try {
      const res: any = await chatService.getRoomMessages(roomId);
      let fetched: any[] = [];
      if (Array.isArray(res)) {
        fetched = res;
      } else if (res && Array.isArray(res.data)) {
        fetched = res.data;
      } else if (res && res.data && Array.isArray(res.data.data)) {
        fetched = res.data.data;
      }
      // Backend returns messages in desc order, reverse so newest is at bottom
      const sortedMessages = [...fetched].reverse();

      set((state) => {
        const existingMsgs = state.messagesByRoomId[roomId] || [];
        const merged = [...sortedMessages];
        existingMsgs.forEach((msg) => {
          if (msg && msg.id && !merged.some((m) => m.id === msg.id)) {
            merged.push(msg);
          }
        });
        return {
          messagesByRoomId: { ...state.messagesByRoomId, [roomId]: merged },
          isLoading: false,
        };
      });
    } catch (err: any) {
      set({ error: isFirstLoad ? (err?.message || 'Không thể tải tin nhắn phòng chat') : get().error, isLoading: false });
    }
  },

  sendMediaMessage: async (roomId: string, dto: SendMediaMessageDto) => {
    set({ isSending: true, error: null });
    try {
      await chatService.sendMediaMessage(roomId, dto);
      set({ isSending: false });
      await get().fetchMessages(roomId, true);
      return true;
    } catch (err: any) {
      set({ error: err?.message || 'Không thể gửi hình ảnh/media', isSending: false });
      return false;
    }
  },

  sendMessage: async (roomId: string, content: string, file?: File) => {
    set({ isSending: true, error: null });
    try {
      const res: any = await chatService.sendMessage(roomId, content, file);
      set({ isSending: false });

      const newMsg = res?.message || res?.data?.message || (res?.id ? res : null);
      if (newMsg) {
        set((state) => {
          const currentMsgs = state.messagesByRoomId[roomId] || [];
          if (!currentMsgs.some((m) => m.id === newMsg.id)) {
            return {
              messagesByRoomId: {
                ...state.messagesByRoomId,
                [roomId]: [...currentMsgs, newMsg],
              },
            };
          }
          return state;
        });
      }

      await get().fetchMessages(roomId, true);
      return true;
    } catch (err: any) {
      set({ error: err?.message || 'Không thể gửi tin nhắn', isSending: false });
      return false;
    }
  },
}));
