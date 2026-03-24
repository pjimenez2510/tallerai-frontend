'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api/auth';

export function Header() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Silent logout even if API fails
    } finally {
      logout();
      toast.success('Sesión cerrada exitosamente');
      router.refresh();
      router.push('/login');
    }
  }

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    jefe_taller: 'Jefe de Taller',
    recepcionista: 'Recepcionista',
    mecanico: 'Mecánico',
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 lg:px-6">
      <span className="text-sm font-medium text-[var(--color-text-secondary)]">
        TallerIA Dashboard
      </span>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-[var(--color-text-secondary)]" />
            <span className="text-[var(--color-text-primary)] font-medium">
              {user.name}
            </span>
            <span className="text-[var(--color-text-secondary)]">
              ({roleLabels[user.role] ?? user.role})
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-error)]"
        >
          <LogOut className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Salir</span>
        </Button>
      </div>
    </header>
  );
}
