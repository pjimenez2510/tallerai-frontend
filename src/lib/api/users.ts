import { apiClient } from './client';
import type {
  WorkshopUser,
  CreateUserRequest,
  UpdateUserRequest,
} from '@/types/user.types';
import type { PaginatedResponse } from '@/types/pagination.types';

export interface UsersListParams {
  page?: number;
  limit?: number;
}

export const usersApi = {
  list(params?: UsersListParams) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiClient.get<PaginatedResponse<WorkshopUser>>(
      `/users${qs ? `?${qs}` : ''}`,
    );
  },

  getById(id: string) {
    return apiClient.get<WorkshopUser>(`/users/${id}`);
  },

  create(data: CreateUserRequest) {
    return apiClient.post<WorkshopUser>('/users', data);
  },

  update(id: string, data: UpdateUserRequest) {
    return apiClient.patch<WorkshopUser>(`/users/${id}`, data);
  },

  deactivate(id: string) {
    return apiClient.delete<WorkshopUser>(`/users/${id}`);
  },

  activate(id: string) {
    return apiClient.patch<WorkshopUser>(`/users/${id}/activate`, {});
  },
};
