import { apiClient } from './client';
import type {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
} from '@/types/client.types';

export const clientsApi = {
  list() {
    return apiClient.get<Client[]>('/clients');
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
