import axiosInstance from '@/lib/axios';
import { ChatMessage, ChatRoom, SendMediaMessageDto } from '../types/chat.types';

export const chatService = {
  getRooms: async (): Promise<ChatRoom[]> => {
    const response = await axiosInstance.get<ChatRoom[]>('/api/chat/rooms');
    return response.data;
  },

  getRoomMessages: async (roomId: string): Promise<ChatMessage[]> => {
    const response = await axiosInstance.get<ChatMessage[]>(`/api/chat/rooms/${roomId}/messages`);
    return response.data;
  },

  sendMediaMessage: async (roomId: string, dto: SendMediaMessageDto): Promise<ChatMessage> => {
    const response = await axiosInstance.post<ChatMessage>(`/api/chat/rooms/${roomId}/media`, dto);
    return response.data;
  },
};
