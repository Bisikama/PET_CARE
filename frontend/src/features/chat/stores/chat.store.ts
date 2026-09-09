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
      const rooms = await chatService.getRooms();
      set({ rooms, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải danh sách phòng chat', isLoading: false });
    }
  },

  fetchMessages: async (roomId: string, force = false) => {
    if (!force && get().messagesByRoomId[roomId]) return;
    set({ isLoading: true, error: null });
    try {
      const messages = await chatService.getRoomMessages(roomId);
      set((state) => ({
        messagesByRoomId: { ...state.messagesByRoomId, [roomId]: messages },
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải tin nhắn phòng chat', isLoading: false });
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
}));
