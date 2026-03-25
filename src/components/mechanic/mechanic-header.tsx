'use client';

import { useRouter } from 'next/navigation';
import { Wrench, LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api/auth';

export function MechanicHeader() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
      queryClient.clear();
      logout();
      toast.success('Sesión cerrada exitosamente');
      router.refresh();
      router.push('/login');
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-white/10 bg-[#0f172a]/90 backdrop-blur-md px-4">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f97316] shadow-lg shadow-[#f97316]/25">
          <Wrench className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-white tracking-tight">TallerIA</span>
          <p className="text-[10px] text-white/40 -mt-0.5">Vista Mecánico</p>
        </div>
      </div>

      {/* User + Logout */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#1e3a5f] text-sm font-bold text-white uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white/90 leading-tight">{user.name}</p>
              <p className="text-[10px] text-white/40 leading-tight">Mecánico</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-white/50 hover:text-white hover:bg-white/10 min-h-12 min-w-12"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
