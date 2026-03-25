'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { mechanicApi } from '@/lib/api/mechanic';
import { ApiError } from '@/types/api.types';

export function useMechanicTasks() {
  return useQuery({
    queryKey: ['mechanic', 'my-tasks'],
    queryFn: async () => {
      const response = await mechanicApi.getMyTasks();
      return response.data;
    },
  });
}

export function useMechanicSummary() {
  return useQuery({
    queryKey: ['mechanic', 'summary'],
    queryFn: async () => {
      const response = await mechanicApi.getSummary();
      return response.data;
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await mechanicApi.completeTask(taskId);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['mechanic'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al completar la tarea');
    },
  });
}
