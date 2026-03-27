import { apiClient } from './client';
import type {
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
} from '@/types/service.types';
import type { PaginatedResponse } from '@/types/pagination.types';

export interface ServicesListParams {
  page?: number;
  limit?: number;
}

export const servicesApi = {
  list(params?: ServicesListParams) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiClient.get<PaginatedResponse<Service>>(
      `/services${qs ? `?${qs}` : ''}`,
    );
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
