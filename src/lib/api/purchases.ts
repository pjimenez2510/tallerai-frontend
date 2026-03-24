import { apiClient } from './client';
import type {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
} from '@/types/purchase.types';

export const purchasesApi = {
  list() {
    return apiClient.get<PurchaseOrder[]>('/purchases');
  },

  getById(id: string) {
    return apiClient.get<PurchaseOrder>(`/purchases/${id}`);
  },

  create(data: CreatePurchaseOrderRequest) {
    return apiClient.post<PurchaseOrder>('/purchases', data);
  },

  receive(id: string) {
    return apiClient.patch<PurchaseOrder>(`/purchases/${id}/receive`, {});
  },

  cancel(id: string) {
    return apiClient.patch<PurchaseOrder>(`/purchases/${id}/cancel`, {});
  },
};
