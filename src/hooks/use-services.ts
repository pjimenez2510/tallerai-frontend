'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { servicesApi } from '@/lib/api/services';
import type {
  CreateServiceRequest,
  UpdateServiceRequest,
} from '@/types/service.types';
import { ApiError } from '@/types/api.types';

export interface UseServicesParams {
  page?: number;
  limit?: number;
}

export function useServices(params?: UseServicesParams) {
  return useQuery({
    queryKey: ['services', params?.page ?? 1, params?.limit ?? 20],
    queryFn: async () => {
      const response = await servicesApi.list(params);
      return response.data;
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateServiceRequest) => {
      const response = await servicesApi.create(data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al crear servicio');
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateServiceRequest;
    }) => {
      const response = await servicesApi.update(id, data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al actualizar servicio');
    },
  });
}

export function useDeactivateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await servicesApi.deactivate(id);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al desactivar servicio');
    },
  });
}
