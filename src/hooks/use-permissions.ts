'use client';

import { useAuthStore } from '@/stores/auth.store';

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const permissions = user?.permissions ?? [];

  function hasPermission(permission: string): boolean {
    return permissions.includes(permission);
  }

  function hasAnyPermission(...perms: string[]): boolean {
    return perms.some((p) => permissions.includes(p));
  }

  function hasAllPermissions(...perms: string[]): boolean {
    return perms.every((p) => permissions.includes(p));
  }

  return { permissions, hasPermission, hasAnyPermission, hasAllPermissions };
}
