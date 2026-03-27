import { apiClient } from './client';
import type {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderTask,
  WorkOrderPart,
  WorkOrderAttachment,
  AddAttachmentRequest,
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
  AddTaskRequest,
  UpdateTaskRequest,
  AddPartRequest,
  QuoteResponse,
  VehicleTimelineEntry,
  CreateSupplementRequest,
} from '@/types/work-order.types';
import type { PaginatedResponse } from '@/types/pagination.types';

export interface WorkOrdersListParams {
  status?: WorkOrderStatus;
  page?: number;
  limit?: number;
}

export const workOrdersApi = {
  list(params?: WorkOrdersListParams) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiClient.get<PaginatedResponse<WorkOrder>>(
      `/work-orders${qs ? `?${qs}` : ''}`,
    );
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

  getQuote(id: string) {
    return apiClient.get<QuoteResponse>(`/work-orders/${id}/quote`);
  },

  getVehicleTimeline(vehicleId: string) {
    return apiClient.get<VehicleTimelineEntry[]>(`/work-orders/by-vehicle/${vehicleId}/timeline`);
  },

  createSupplement(parentId: string, data: CreateSupplementRequest) {
    return apiClient.post<WorkOrder>(`/work-orders/${parentId}/supplement`, data);
  },

  listAttachments(woId: string) {
    return apiClient.get<WorkOrderAttachment[]>(`/work-orders/${woId}/attachments`);
  },

  getAttachment(woId: string, attachmentId: string) {
    return apiClient.get<WorkOrderAttachment>(`/work-orders/${woId}/attachments/${attachmentId}`);
  },

  addAttachment(woId: string, data: AddAttachmentRequest) {
    return apiClient.post<WorkOrderAttachment>(`/work-orders/${woId}/attachments`, data);
  },

  removeAttachment(woId: string, attachmentId: string) {
    return apiClient.delete<null>(`/work-orders/${woId}/attachments/${attachmentId}`);
  },
};
