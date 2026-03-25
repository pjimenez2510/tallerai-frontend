export type NotificationType =
  | 'work_order'
  | 'inventory'
  | 'payment'
  | 'system'
  | 'client'
  | 'mechanic';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationListData {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnreadCountData {
  count: number;
}
