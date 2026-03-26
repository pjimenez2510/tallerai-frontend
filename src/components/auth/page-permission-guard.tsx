'use client';

import { ShieldX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';

interface PagePermissionGuardProps {
  permission: string;
  children: React.ReactNode;
}

export function PagePermissionGuard({
  permission,
  children,
}: PagePermissionGuardProps) {
  const { hasPermission, permissions } = usePermissions();
  const router = useRouter();

  // If permissions haven't loaded yet (empty array from old session), show content
  // The user will need to re-login to get permissions populated
  if (permissions.length === 0) {
    return <>{children}</>;
  }

  if (!hasPermission(permission)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <ShieldX className="h-8 w-8 text-red-400" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Acceso denegado
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-md">
            No tienes permisos para acceder a esta sección.
            Contacta al administrador de tu taller.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.push('/')}
        >
          Volver al Dashboard
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
