'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientsApi } from '@/lib/api/clients';
import type {
  CreateClientRequest,
  UpdateClientRequest,
} from '@/types/client.types';
import { ApiError } from '@/types/api.types';

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await clientsApi.list();
      return response.data;
    },
  });
}

export function useSearchClients(query: string) {
  return useQuery({
    queryKey: ['clients', 'search', query],
    queryFn: async () => {
      const response = await clientsApi.search(query);
      return response.data;
    },
    enabled: query.length >= 2,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClientRequest) => {
      const response = await clientsApi.create(data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al crear cliente');
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateClientRequest;
    }) => {
      const response = await clientsApi.update(id, data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al actualizar cliente');
    },
  });
}

export function useDeactivateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await clientsApi.deactivate(id);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al desactivar cliente');
    },
  });
}
