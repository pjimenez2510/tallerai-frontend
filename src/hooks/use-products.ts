'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productsApi } from '@/lib/api/products';
import type {
  CreateProductRequest,
  UpdateProductRequest,
  AddStockMovementRequest,
} from '@/types/product.types';

import { ApiError } from '@/types/api.types';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productsApi.list();
      return response.data;
    },
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: async () => {
      const response = await productsApi.getLowStock();
      return response.data;
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductRequest) => {
      const response = await productsApi.create(data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al crear producto');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductRequest;
    }) => {
      const response = await productsApi.update(id, data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al actualizar producto');
    },
  });
}

export function useDeactivateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productsApi.deactivate(id);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al desactivar producto');
    },
  });
}

export function useProductMovements(id: string) {
  return useQuery({
    queryKey: ['products', id, 'movements'],
    queryFn: async () => {
      const response = await productsApi.getMovements(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useInventoryReport() {
  return useQuery({
    queryKey: ['products', 'report'],
    queryFn: async () => {
      const response = await productsApi.getReport();
      return response.data;
    },
  });
}

export function useAddStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: AddStockMovementRequest;
    }) => {
      const response = await productsApi.addStockMovement(id, data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al registrar movimiento de stock');
    },
  });
}
