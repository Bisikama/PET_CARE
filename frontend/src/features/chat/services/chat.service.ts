import axiosInstance from '@/lib/axios';
import { ChatMessage, ChatRoom, SendMediaMessageDto } from '../types/chat.types';

export const chatService = {
  getRooms: async (): Promise<ChatRoom[]> => {
    try {
      let response;
      try {
        response = await axiosInstance.get('/chat/rooms');
      } catch {
        response = await axiosInstance.get('/api/chat/rooms');
      }
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      if (data && Array.isArray(data.rooms)) return data.rooms;
      return [];
    } catch (err) {
      console.error('Failed to fetch chat rooms:', err);
      return [];
    }
  },

  getRoomMessages: async (roomId: string): Promise<ChatMessage[]> => {
    if (!roomId) return [];
    try {
      let response;
      try {
        response = await axiosInstance.get(`/chat/rooms/${roomId}/messages`);
      } catch {
        response = await axiosInstance.get(`/api/chat/rooms/${roomId}/messages`);
      }
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      if (data && data.data && Array.isArray(data.data.data)) return data.data.data;
      return [];
    } catch (err) {
      console.error('Failed to fetch room messages:', err);
      return [];
    }
  },

  sendMessage: async (roomId: string, content: string, file?: File): Promise<ChatMessage | null> => {
    const formData = new FormData();
    if (content) {
      formData.append('content', content);
    }
    if (file) {
      formData.append('file', file);
    }
    try {
      let response;
      try {
        response = await axiosInstance.post(`/chat/rooms/${roomId}/messages`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch {
        response = await axiosInstance.post(`/api/chat/rooms/${roomId}/messages`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      return response.data?.message || response.data?.data || response.data || null;
    } catch (err) {
      console.error('Failed to send message:', err);
      return null;
    }
  },

  sendMediaMessage: async (roomId: string, dto: SendMediaMessageDto): Promise<ChatMessage | null> => {
    try {
      let response;
      try {
        response = await axiosInstance.post(`/chat/rooms/${roomId}/media`, dto);
      } catch {
        response = await axiosInstance.post(`/api/chat/rooms/${roomId}/media`, dto);
      }
      return response.data?.message || response.data?.data || response.data || null;
    } catch (err) {
      console.error('Failed to send media message:', err);
      return null;
    }
  },
};
