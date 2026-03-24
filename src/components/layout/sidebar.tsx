'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Car,
  Package,
  ClipboardList,
  Kanban,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

const navItems = [
  { href: '/work-orders', label: 'Órdenes de Trabajo', icon: ClipboardList },
  { href: '/kanban', label: 'Kanban', icon: Kanban },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/vehicles', label: 'Vehículos', icon: Car },
  { href: '/inventory', label: 'Inventario', icon: Package },
];

const adminItems = [
  { href: '/users', label: 'Usuarios', icon: UserCog },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const tenant = useAuthStore((s) => s.tenant);
  const isAdmin = user?.role === 'admin' || user?.role === 'jefe_taller';

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[var(--color-primary)]">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
        <LayoutDashboard className="h-6 w-6 text-[var(--color-accent)]" />
        <span className="text-xl font-bold text-white">TallerIA</span>
      </div>

      {tenant && (
        <div className="px-6 py-3 border-b border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-wider">
            Taller
          </p>
          <p className="text-sm font-medium text-white/90 truncate">
            {tenant.name}
          </p>
        </div>
      )}

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs text-white/40 uppercase tracking-wider">
                Administración
              </p>
            </div>
            {adminItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </aside>
  );
}
