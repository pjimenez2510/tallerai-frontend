export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg-secondary)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">TallerIA</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Sistema de Gestión de Talleres Mecánicos
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
