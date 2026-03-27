'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { purchasesApi } from '@/lib/api/purchases';
import type { CreatePurchaseOrderRequest } from '@/types/purchase.types';
import { ApiError } from '@/types/api.types';

export interface UsePurchasesParams {
  page?: number;
  limit?: number;
}

export function usePurchases(params?: UsePurchasesParams) {
  return useQuery({
    queryKey: ['purchases', params?.page ?? 1, params?.limit ?? 20],
    queryFn: async () => {
      const response = await purchasesApi.list(params);
      return response.data;
    },
  });
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: ['purchases', id],
    queryFn: async () => {
      const response = await purchasesApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePurchaseOrderRequest) => {
      const response = await purchasesApi.create(data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al crear orden de compra');
    },
  });
}

export function useReceivePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await purchasesApi.receive(id);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al recibir orden de compra');
    },
  });
}

export function useCancelPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await purchasesApi.cancel(id);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al cancelar orden de compra');
    },
  });
}
