export interface AuthUser {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  roleId: string | null;
  roleSlug: string | null;
  roleName: string | null;
  permissions: string[];
}

export interface AuthTenant {
  id: string;
  name: string;
  ruc: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  tenantName: string;
  tenantRuc: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminPhone?: string;
}

export interface AuthResponse {
  user: AuthUser;
  tenant: AuthTenant;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  tenantId: string;
  tenantName: string;
  roleId: string | null;
  roleName: string | null;
  roleSlug: string | null;
  permissions: string[];
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
