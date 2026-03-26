export interface WorkshopUser {
  id: string;
  name: string;
  email: string;
  roleId: string | null;
  roleName: string | null;
  roleSlug: string | null;
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
  phone?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
  phone?: string;
}
