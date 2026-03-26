'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth.store';
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '@/types/auth.types';
import { ApiError } from '@/types/api.types';

export function useUpdateProfile() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const tenant = useAuthStore((s) => s.tenant);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await authApi.updateProfile(data);
      return response;
    },
    onSuccess: (response) => {
      const me = response.data;
      if (tenant && accessToken && refreshToken) {
        setAuth({
          user: {
            id: me.id,
            name: me.name,
            email: me.email,
            role: me.role,
            tenantId: me.tenantId,
            roleId: me.roleId ?? null,
            roleSlug: me.roleSlug ?? null,
            permissions: me.permissions ?? [],
          },
          tenant,
          accessToken,
          refreshToken,
        });
      }
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al actualizar perfil');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await authApi.changePassword(data);
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Contraseña actualizada exitosamente');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al cambiar contraseña');
    },
  });
}
