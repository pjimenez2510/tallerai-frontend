'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationsApi } from '@/lib/api/notifications';
import { ApiError } from '@/types/api.types';

export function useNotifications(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: async () => {
      const response = await notificationsApi.list(page, limit);
      return response.data;
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await notificationsApi.getUnreadCount();
      return response.data;
    },
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await notificationsApi.markRead(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al marcar notificación');
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await notificationsApi.markAllRead();
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(response.message || 'Todas las notificaciones marcadas como leídas');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al marcar notificaciones');
    },
  });
}
