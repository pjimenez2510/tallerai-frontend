import { apiClient } from './client';
import type {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
} from '@/types/purchase.types';
import type { PaginatedResponse } from '@/types/pagination.types';

export interface PurchasesListParams {
  page?: number;
  limit?: number;
}

export const purchasesApi = {
  list(params?: PurchasesListParams) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiClient.get<PaginatedResponse<PurchaseOrder>>(
      `/purchases${qs ? `?${qs}` : ''}`,
    );
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
