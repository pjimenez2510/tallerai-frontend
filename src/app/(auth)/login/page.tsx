import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
};

export default function LoginPage() {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Iniciar Sesión</h2>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Próximamente: formulario de autenticación.
      </p>
    </div>
  );
}
