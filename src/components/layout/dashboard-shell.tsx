'use client';

import { usePermissions } from '@/hooks/use-permissions';
import { Sidebar } from './sidebar';
import { Header } from './header';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { permissions } = usePermissions();

  // If user has no permissions at all, show a full-screen no-access message
  // (no sidebar, no header — just the message)
  if (permissions.length === 0) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg-secondary)] px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
            <svg
              className="h-8 w-8 text-[var(--color-primary)]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
            Sin acceso al sistema
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Tu cuenta no tiene permisos asignados. Contacta al administrador de
            tu taller para que te asigne un rol con los permisos necesarios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-[var(--color-bg-secondary)]">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 lg:pl-64">
        <Header />
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
