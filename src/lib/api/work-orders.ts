import { apiClient } from './client';
import type {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderTask,
  WorkOrderPart,
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
  AddTaskRequest,
  UpdateTaskRequest,
  AddPartRequest,
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

  addTask(woId: string, data: AddTaskRequest) {
    return apiClient.post<WorkOrderTask>(`/work-orders/${woId}/tasks`, data);
  },

  updateTask(woId: string, taskId: string, data: UpdateTaskRequest) {
    return apiClient.patch<WorkOrderTask>(`/work-orders/${woId}/tasks/${taskId}`, data);
  },

  deleteTask(woId: string, taskId: string) {
    return apiClient.delete<null>(`/work-orders/${woId}/tasks/${taskId}`);
  },

  addPart(woId: string, data: AddPartRequest) {
    return apiClient.post<WorkOrderPart>(`/work-orders/${woId}/parts`, data);
  },

  removePart(woId: string, partId: string) {
    return apiClient.delete<null>(`/work-orders/${woId}/parts/${partId}`);
  },

  listByClient(clientId: string) {
    return apiClient.get<WorkOrder[]>(`/work-orders/by-client/${clientId}`);
  },

  listByVehicle(vehicleId: string) {
    return apiClient.get<WorkOrder[]>(`/work-orders/by-vehicle/${vehicleId}`);
  },
};
