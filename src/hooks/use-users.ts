'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '@/lib/api/users';
import type { CreateUserRequest, UpdateUserRequest } from '@/types/user.types';
import { ApiError } from '@/types/api.types';

export interface UseUsersParams {
  page?: number;
  limit?: number;
}

export function useUsers(params?: UseUsersParams) {
  return useQuery({
    queryKey: ['users', params?.page ?? 1, params?.limit ?? 20],
    queryFn: async () => {
      const response = await usersApi.list(params);
      return response.data;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      const response = await usersApi.create(data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al crear usuario');
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserRequest;
    }) => {
      const response = await usersApi.update(id, data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al actualizar usuario');
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await usersApi.deactivate(id);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al desactivar usuario');
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await usersApi.activate(id);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al activar usuario');
    },
  });
}
