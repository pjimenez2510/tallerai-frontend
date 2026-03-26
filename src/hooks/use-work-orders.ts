'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workOrdersApi } from '@/lib/api/work-orders';
import type {
  WorkOrderStatus,
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
  AddTaskRequest,
  UpdateTaskRequest,
  AddPartRequest,
  AddAttachmentRequest,
  CreateSupplementRequest,
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

export function useAddTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ woId, data }: { woId: string; data: AddTaskRequest }) => {
      const response = await workOrdersApi.addTask(woId, data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al agregar tarea');
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      woId,
      taskId,
      data,
    }: {
      woId: string;
      taskId: string;
      data: UpdateTaskRequest;
    }) => {
      const response = await workOrdersApi.updateTask(woId, taskId, data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al actualizar tarea');
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ woId, taskId }: { woId: string; taskId: string }) => {
      const response = await workOrdersApi.deleteTask(woId, taskId);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al eliminar tarea');
    },
  });
}

export function useAddPart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ woId, data }: { woId: string; data: AddPartRequest }) => {
      const response = await workOrdersApi.addPart(woId, data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al agregar repuesto');
    },
  });
}

export function useWorkOrdersByClient(clientId: string) {
  return useQuery({
    queryKey: ['work-orders', 'by-client', clientId],
    queryFn: async () => {
      const response = await workOrdersApi.listByClient(clientId);
      return response.data;
    },
    enabled: !!clientId,
  });
}

export function useWorkOrdersByVehicle(vehicleId: string) {
  return useQuery({
    queryKey: ['work-orders', 'by-vehicle', vehicleId],
    queryFn: async () => {
      const response = await workOrdersApi.listByVehicle(vehicleId);
      return response.data;
    },
    enabled: !!vehicleId,
  });
}

export function useWorkOrderQuote(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ['work-orders', id, 'quote'],
    queryFn: async () => {
      const response = await workOrdersApi.getQuote(id);
      return response.data;
    },
    enabled: !!id && enabled,
  });
}

export function useVehicleTimeline(vehicleId: string) {
  return useQuery({
    queryKey: ['work-orders', 'timeline', vehicleId],
    queryFn: async () => {
      const response = await workOrdersApi.getVehicleTimeline(vehicleId);
      return response.data;
    },
    enabled: !!vehicleId,
  });
}

export function useCreateSupplement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      parentId,
      data,
    }: {
      parentId: string;
      data: CreateSupplementRequest;
    }) => {
      const response = await workOrdersApi.createSupplement(parentId, data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al crear OT suplementaria');
    },
  });
}

export function useRemovePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ woId, partId }: { woId: string; partId: string }) => {
      const response = await workOrdersApi.removePart(woId, partId);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al eliminar repuesto');
    },
  });
}

export function useWorkOrderAttachments(woId: string) {
  return useQuery({
    queryKey: ['work-orders', woId, 'attachments'],
    queryFn: async () => {
      const response = await workOrdersApi.listAttachments(woId);
      return response.data;
    },
    enabled: !!woId,
  });
}

export function useAddAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ woId, data }: { woId: string; data: AddAttachmentRequest }) => {
      const response = await workOrdersApi.addAttachment(woId, data);
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', variables.woId, 'attachments'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al subir archivo');
    },
  });
}

export function useRemoveAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ woId, attachmentId }: { woId: string; attachmentId: string }) => {
      const response = await workOrdersApi.removeAttachment(woId, attachmentId);
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', variables.woId, 'attachments'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al eliminar archivo');
    },
  });
}
