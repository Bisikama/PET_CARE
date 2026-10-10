export type ChatTabFilter = 'ALL' | 'ACTIVE' | 'CLOSED';

export interface ChatMessage {
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

export interface ChatPartner {
  id: string;
  fullName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
}

export interface ChatBookingSummary {
  id?: string;
  status?: string;
  requested_date?: string;
  pet_name?: string;
  service_title?: string;
}

export interface ChatRoom {
  id: string;
  booking_id: string;
  is_active: boolean;
  created_at?: string;
  partner?: ChatPartner;
  booking?: ChatBookingSummary;
  last_message?: ChatMessage | null;
}
