export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  link?: string;
}

export interface UnreadCountResponse {
  count: number;
}
