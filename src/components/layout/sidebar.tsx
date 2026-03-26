'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Wrench,
  Users,
  Car,
  Package,
  ClipboardList,
  Kanban,
  UserCog,
  Receipt,
  UserCircle,
  ShoppingCart,
  LayoutDashboard,
  HardHat,
  Settings,
  BarChart3,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { usePermissions } from '@/hooks/use-permissions';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const tenant = useAuthStore((s) => s.tenant);
  const { hasPermission } = usePermissions();

  const navItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-[#f97316]',
      visible: true,
    },
    {
      href: '/work-orders',
      label: 'Órdenes de Trabajo',
      icon: ClipboardList,
      color: 'text-blue-400',
      visible: hasPermission('work_orders.view'),
    },
    {
      href: '/kanban',
      label: 'Kanban',
      icon: Kanban,
      color: 'text-purple-400',
      visible: hasPermission('kanban.view'),
    },
    {
      href: '/clients',
      label: 'Clientes',
      icon: Users,
      color: 'text-emerald-400',
      visible: hasPermission('clients.view'),
    },
    {
      href: '/vehicles',
      label: 'Vehículos',
      icon: Car,
      color: 'text-cyan-400',
      visible: hasPermission('vehicles.view'),
    },
    {
      href: '/inventory',
      label: 'Inventario',
      icon: Package,
      color: 'text-amber-400',
      visible: hasPermission('inventory.view'),
    },
    {
      href: '/services',
      label: 'Servicios',
      icon: Receipt,
      color: 'text-teal-400',
      visible: hasPermission('services.view'),
    },
    {
      href: '/purchases',
      label: 'Compras',
      icon: ShoppingCart,
      color: 'text-indigo-400',
      visible: hasPermission('purchases.view'),
    },
  ].filter((item) => item.visible);

  const adminItems = [
    {
      href: '/users',
      label: 'Usuarios',
      icon: UserCog,
      color: 'text-rose-400',
      visible: hasPermission('users.view'),
    },
    {
      href: '/roles',
      label: 'Roles',
      icon: Shield,
      color: 'text-violet-400',
      visible: hasPermission('roles.view'),
    },
    {
      href: '/reports',
      label: 'Reportes',
      icon: BarChart3,
      color: 'text-violet-400',
      visible: hasPermission('reports.view'),
    },
    {
      href: '/settings',
      label: 'Configuración',
      icon: Settings,
      color: 'text-slate-400',
      visible: hasPermission('settings.view'),
    },
  ].filter((item) => item.visible);

  const showMechanic = hasPermission('mechanic.view');
  const showAdmin = adminItems.length > 0;

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-gradient-to-b from-[#1e3a5f] to-[#0f1f33] border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f97316] shadow-lg shadow-[#f97316]/25">
          <Wrench className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-white tracking-tight">
            TallerIA
          </span>
          <span className="ml-1.5 inline-flex items-center rounded-md bg-[#f97316]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#f97316]">
            PRO
          </span>
        </div>
      </div>

      {/* Tenant info */}
      {tenant && (
        <div className="mx-4 mb-4 rounded-xl bg-white/5 border border-white/5 px-4 py-3">
          <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
            Taller
          </p>
          <p className="text-sm font-semibold text-white/90 truncate mt-0.5">
            {tenant.name}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
        <p className="px-3 pt-2 pb-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
          Principal
        </p>
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80',
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-white/10 shadow-inner'
                    : 'bg-transparent group-hover:bg-white/5',
                )}
              >
                <item.icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isActive ? item.color : 'text-white/40 group-hover:text-white/60',
                  )}
                />
              </div>
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#f97316]" />
              )}
            </Link>
          );
        })}

        {/* Mechanic shortcut */}
        {showMechanic && (
          <>
            <p className="px-3 pt-6 pb-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
              Mecánico
            </p>
            {(() => {
              const isActive = pathname.startsWith('/mechanic');
              return (
                <Link
                  href="/mechanic"
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-white/10 shadow-inner'
                        : 'bg-transparent group-hover:bg-white/5',
                    )}
                  >
                    <HardHat
                      className={cn(
                        'h-4 w-4 transition-colors',
                        isActive ? 'text-[#f97316]' : 'text-white/40 group-hover:text-white/60',
                      )}
                    />
                  </div>
                  Mi Trabajo
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#f97316]" />
                  )}
                </Link>
              );
            })()}
          </>
        )}

        {/* Profile link */}
        <p className="px-3 pt-6 pb-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
          Cuenta
        </p>
        {(() => {
          const isActive = pathname.startsWith('/profile');
          return (
            <Link
              href="/profile"
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80',
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-white/10 shadow-inner'
                    : 'bg-transparent group-hover:bg-white/5',
                )}
              >
                <UserCircle
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isActive ? 'text-sky-400' : 'text-white/40 group-hover:text-white/60',
                  )}
                />
              </div>
              Mi Perfil
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#f97316]" />
              )}
            </Link>
          );
        })()}

        {showAdmin && (
          <>
            <p className="px-3 pt-6 pb-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
              Administración
            </p>
            {adminItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-white/10 shadow-inner'
                        : 'bg-transparent group-hover:bg-white/5',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 transition-colors',
                        isActive
                          ? item.color
                          : 'text-white/40 group-hover:text-white/60',
                      )}
                    />
                  </div>
                  {item.label}
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#f97316]" />
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User info at bottom */}
      {user && (
        <button
          onClick={() => router.push('/profile')}
          className="mx-3 mb-3 rounded-xl bg-white/5 border border-white/5 px-4 py-3 hover:bg-white/10 transition-colors w-[calc(100%-1.5rem)] text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#1e3a5f] text-xs font-bold text-white uppercase shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">
                {user.name}
              </p>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
            </div>
          </div>
        </button>
      )}
    </aside>
  );
}
