import type { UserRole } from './auth.types';

export interface WorkshopUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleId: string | null;
  roleName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleId?: string;
  role?: UserRole;
  phone?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
  role?: UserRole;
  phone?: string;
}
