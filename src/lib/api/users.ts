import { apiClient } from './client';
import type {
  WorkshopUser,
  CreateUserRequest,
  UpdateUserRequest,
} from '@/types/user.types';

export const usersApi = {
  list() {
    return apiClient.get<WorkshopUser[]>('/users');
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
