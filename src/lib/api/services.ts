import { apiClient } from './client';
import type {
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
} from '@/types/service.types';

export const servicesApi = {
  list() {
    return apiClient.get<Service[]>('/services');
  },

  getById(id: string) {
    return apiClient.get<Service>(`/services/${id}`);
  },

  create(data: CreateServiceRequest) {
    return apiClient.post<Service>('/services', data);
  },

  update(id: string, data: UpdateServiceRequest) {
    return apiClient.patch<Service>(`/services/${id}`, data);
  },

  deactivate(id: string) {
    return apiClient.delete<Service>(`/services/${id}`);
  },
};
