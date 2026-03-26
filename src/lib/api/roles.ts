import { apiClient } from './client';
import type {
  Role,
  PermissionGroup,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '@/types/role.types';

export const rolesApi = {
  list() {
    return apiClient.get<Role[]>('/roles');
  },

  getById(id: string) {
    return apiClient.get<Role>(`/roles/${id}`);
  },

  create(data: CreateRoleRequest) {
    return apiClient.post<Role>('/roles', data);
  },

  update(id: string, data: UpdateRoleRequest) {
    return apiClient.patch<Role>(`/roles/${id}`, data);
  },

  delete(id: string) {
    return apiClient.delete<null>(`/roles/${id}`);
  },

  getPermissions() {
    return apiClient.get<PermissionGroup[]>('/roles/permissions');
  },
};
