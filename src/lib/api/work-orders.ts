import { apiClient } from './client';
import type {
  WorkOrder,
  WorkOrderStatus,
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
} from '@/types/work-order.types';

export const workOrdersApi = {
  list(status?: WorkOrderStatus) {
    const query = status ? `?status=${status}` : '';
    return apiClient.get<WorkOrder[]>(`/work-orders${query}`);
  },

  getById(id: string) {
    return apiClient.get<WorkOrder>(`/work-orders/${id}`);
  },

  create(data: CreateWorkOrderRequest) {
    return apiClient.post<WorkOrder>('/work-orders', data);
  },

  update(id: string, data: UpdateWorkOrderRequest) {
    return apiClient.patch<WorkOrder>(`/work-orders/${id}`, data);
  },
};
