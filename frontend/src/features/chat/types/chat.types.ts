export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName?: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  name?: string;
  bookingId?: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: string;
}

export interface SendMediaMessageDto {
  mediaUrl: string;
  caption?: string;
}
