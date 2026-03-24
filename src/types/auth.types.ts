export type UserRole = 'admin' | 'jefe_taller' | 'recepcionista' | 'mecanico';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
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
  role: UserRole;
  phone: string | null;
  avatarUrl: string | null;
  tenantId: string;
  tenantName: string;
}
