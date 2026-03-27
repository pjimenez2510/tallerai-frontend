import { apiClient } from './client';
import type {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
} from '@/types/client.types';
import type { PaginatedResponse } from '@/types/pagination.types';

export interface ClientsListParams {
  page?: number;
  limit?: number;
}

export const clientsApi = {
  list(params?: ClientsListParams) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiClient.get<PaginatedResponse<Client>>(
      `/clients${qs ? `?${qs}` : ''}`,
    );
  },

  search(query: string) {
    return apiClient.get<Client[]>(`/clients/search?q=${encodeURIComponent(query)}`);
  },

  getById(id: string) {
    return apiClient.get<Client>(`/clients/${id}`);
  },

  create(data: CreateClientRequest) {
    return apiClient.post<Client>('/clients', data);
  },

  update(id: string, data: UpdateClientRequest) {
    return apiClient.patch<Client>(`/clients/${id}`, data);
  },

  deactivate(id: string) {
    return apiClient.delete<Client>(`/clients/${id}`);
  },

  activate(id: string) {
    return apiClient.patch<Client>(`/clients/${id}/activate`, {});
  },
};
