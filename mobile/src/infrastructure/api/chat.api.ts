import { apiClient } from './client';

export interface ChatPartner {
  id: string;
  fullName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
}

export interface ChatBookingInfo {
  id?: string;
  status?: string;
  requested_date?: string;
  pet_name?: string;
  service_title?: string;
}

export interface ChatMessageItem {
  id: string;
  chat_room_id: string;
  sender_id: string;
  message_type: 'TEXT' | 'IMAGE' | 'VIDEO';
  content?: string | null;
  media_url?: string | null;
  is_read?: boolean;
  created_at: string;
  users?: {
    id: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

export interface ChatRoomItem {
  id: string;
  booking_id: string;
  is_active: boolean;
  created_at?: string;
  partner?: ChatPartner;
  booking?: ChatBookingInfo;
  last_message?: ChatMessageItem | null;
}

export interface RoomMessagesResponse {
  room?: ChatRoomItem;
  messages: ChatMessageItem[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RoomByBookingResponse {
  room: ChatRoomItem | null;
  canChat: boolean;
  message?: string;
}

export const chatApi = {
  getRooms: async (): Promise<ChatRoomItem[]> => {
    try {
      const res = await apiClient.get<any>('/chat/rooms');
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    } catch (err) {
      console.warn('chatApi.getRooms error:', err);
      return [];
    }
  },

  getRoomMessages: async (roomId: string, page = 1, limit = 50): Promise<RoomMessagesResponse> => {
    try {
      const res = await apiClient.get<any>(`/chat/rooms/${roomId}/messages`, {
        params: { page, limit },
      });
      const data = res.data;
      // Handle TransformInterceptor wrapper: { success: true, statusCode: 200, message: "Success", data: { room, messages, meta } }
      const payload = data?.data && typeof data.data === 'object' && !Array.isArray(data.data) ? data.data : data;

      if (payload?.messages && Array.isArray(payload.messages)) {
        return {
          room: payload.room,
          messages: payload.messages,
          meta: payload.meta,
        };
      }
      if (Array.isArray(payload)) {
        return { messages: payload };
      }
      return { messages: [] };
    } catch (err) {
      console.warn('chatApi.getRoomMessages error:', err);
      return { messages: [] };
    }
  },

  getRoomByBookingId: async (bookingId: string): Promise<RoomByBookingResponse> => {
    try {
      const res = await apiClient.get<any>(`/chat/rooms/by-booking/${bookingId}`);
      const data = res.data;
      // Handle TransformInterceptor wrapper
      const payload = data?.data && typeof data.data === 'object' ? data.data : data;
      return {
        room: payload?.room || null,
        canChat: Boolean(payload?.canChat),
        message: payload?.message || data?.message,
      };
    } catch (err: any) {
      console.warn('chatApi.getRoomByBookingId error:', err);
      return {
        room: null,
        canChat: false,
        message: err?.response?.data?.message || err?.message || 'Không thể kiểm tra phòng chat cho đơn này',
      };
    }
  },

  sendMessage: async (
    roomId: string,
    content?: string,
    file?: { uri: string; name?: string; type?: string }
  ): Promise<ChatMessageItem | null> => {
    const formData = new FormData();
    if (content?.trim()) {
      formData.append('content', content.trim());
    }
    if (file?.uri) {
      const filename = file.name || file.uri.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const mimeType = file.type || (ext === 'png' ? 'image/png' : 'image/jpeg');

      formData.append('file', {
        uri: file.uri,
        name: filename,
        type: mimeType,
      } as any);
    }

    try {
      const res = await apiClient.post<any>(`/chat/rooms/${roomId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = res.data;
      // Handle TransformInterceptor wrapper: data has { success, statusCode, message: "Success", data: messageObject }
      if (data?.data && typeof data.data === 'object' && data.data.id) {
        return data.data;
      }
      if (data && typeof data === 'object' && data.id) {
        return data;
      }
      return null;
    } catch (err) {
      console.warn('chatApi.sendMessage error:', err);
      throw err;
    }
  },
};

