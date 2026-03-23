export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-[var(--color-bg-secondary)]">
      {/* Sidebar placeholder — implemented in Epic 0 */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[var(--color-primary)]">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
          <span className="text-xl font-bold text-white">TallerIA</span>
        </div>
        <nav className="flex-1 px-4 py-4">
          <p className="text-xs text-white/50 uppercase tracking-wider">Navegación</p>
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top bar placeholder */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 lg:px-6">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
            TallerIA Dashboard
          </span>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
