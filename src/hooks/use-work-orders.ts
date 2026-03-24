'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workOrdersApi } from '@/lib/api/work-orders';
import type {
  WorkOrderStatus,
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
} from '@/types/work-order.types';
import { ApiError } from '@/types/api.types';

export function useWorkOrders(status?: WorkOrderStatus) {
  return useQuery({
    queryKey: ['work-orders', status ?? 'all'],
    queryFn: async () => {
      const response = await workOrdersApi.list(status);
      return response.data;
    },
  });
}

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: ['work-orders', id],
    queryFn: async () => {
      const response = await workOrdersApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkOrderRequest) => {
      const response = await workOrdersApi.create(data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al crear orden de trabajo');
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateWorkOrderRequest;
    }) => {
      const response = await workOrdersApi.update(id, data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al actualizar orden de trabajo');
    },
  });
}
