import { apiClient } from './client';
import type {
  NotificationListData,
  UnreadCountData,
} from '@/types/notification.types';

export const notificationsApi = {
  list(page = 1, limit = 10) {
    return apiClient.get<NotificationListData>(
      `/notifications?page=${page}&limit=${limit}`,
    );
  },

  getUnreadCount() {
    return apiClient.get<UnreadCountData>('/notifications/unread-count');
  },

  markRead(id: string) {
    return apiClient.patch<null>(`/notifications/${id}/read`, {});
  },

  markAllRead() {
    return apiClient.patch<null>('/notifications/read-all', {});
  },
};
