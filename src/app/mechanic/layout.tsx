import { AuthGuard } from '@/components/auth/auth-guard';
import { MechanicHeader } from '@/components/mechanic/mechanic-header';

export default function MechanicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="mechanic-view min-h-dvh bg-[#0f172a] flex flex-col dark">
        <MechanicHeader />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </AuthGuard>
  );
}
