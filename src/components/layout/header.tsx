'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Bell, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api/auth';

const pageNames: Record<string, string> = {
  '/work-orders': 'Órdenes de Trabajo',
  '/kanban': 'Tablero Kanban',
  '/clients': 'Clientes',
  '/vehicles': 'Vehículos',
  '/inventory': 'Inventario',
  '/users': 'Usuarios',
};

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  jefe_taller: 'Jefe de Taller',
  recepcionista: 'Recepcionista',
  mecanico: 'Mecánico',
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const logout = useAuthStore((s) => s.logout);

  const currentPage =
    Object.entries(pageNames).find(([path]) =>
      pathname.startsWith(path),
    )?.[1] ?? 'Dashboard';

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

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md px-4 lg:px-6">
      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {currentPage}
        </h1>
      </div>

      {/* Search bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
          <Input
            placeholder="Buscar clientes, vehículos, OTs..."
            className="h-9 pl-10 rounded-xl bg-[var(--color-bg-secondary)] border-transparent focus-visible:border-[var(--color-border)]"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[var(--color-text-secondary)]"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#f97316] text-[10px] font-bold text-white">
            3
          </span>
        </Button>

        {/* User badge */}
        {user && (
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-[var(--color-bg-secondary)] px-3 py-1.5 border border-[var(--color-border)]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-xs font-bold text-white uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--color-text-primary)] truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] text-[var(--color-text-secondary)] leading-tight">
                {roleLabels[user.role] ?? user.role}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-error)] hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
