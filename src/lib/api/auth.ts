import { apiClient } from './client';
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  MeResponse,
  RegisterRequest,
  UpdateProfileRequest,
} from '@/types/auth.types';

export const authApi = {
  login(data: LoginRequest) {
    return apiClient.post<AuthResponse>('/auth/login', data, {
      skipAuth: true,
    });
  },

  register(data: RegisterRequest) {
    return apiClient.post<AuthResponse>('/auth/register', data, {
      skipAuth: true,
    });
  },

  logout(refreshToken: string) {
    return apiClient.post<null>('/auth/logout', { refreshToken });
  },

  getMe() {
    return apiClient.get<MeResponse>('/auth/me');
  },

  updateProfile(data: UpdateProfileRequest) {
    return apiClient.patch<MeResponse>('/auth/profile', data);
  },

  changePassword(data: ChangePasswordRequest) {
    return apiClient.patch<null>('/auth/password', data);
  },
};
