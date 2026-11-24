export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  content?: string;
  type: string;
  isRead: boolean;
  is_read?: boolean;
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
  link?: string;
  actionUrl?: string;
  metadata?: any;
}

export interface UnreadCountResponse {
  count: number;
}
