import { AuthGuard } from '@/components/auth/auth-guard';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-dvh bg-[var(--color-bg-secondary)]">
        <Sidebar />
        <div className="flex flex-1 flex-col lg:pl-64">
          <Header />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
