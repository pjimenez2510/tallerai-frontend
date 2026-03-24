'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, AuthTenant } from '@/types/auth.types';

interface AuthState {
  user: AuthUser | null;
  tenant: AuthTenant | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  setAuth: (data: {
    user: AuthUser;
    tenant: AuthTenant;
    accessToken: string;
    refreshToken: string;
  }) => void;

  setTokens: (accessToken: string, refreshToken: string) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,

      setAuth: ({ user, tenant, accessToken, refreshToken }) =>
        set({
          user,
          tenant,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      logout: () =>
        set({
          user: null,
          tenant: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'tallerai-auth',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Initialize hydration listener on client side only
if (typeof window !== 'undefined') {
  const unsub = useAuthStore.persist.onFinishHydration(() => {
    useAuthStore.setState({ hasHydrated: true });
    unsub();
  });

  // If already hydrated synchronously
  if (useAuthStore.persist.hasHydrated()) {
    useAuthStore.setState({ hasHydrated: true });
  }
}
