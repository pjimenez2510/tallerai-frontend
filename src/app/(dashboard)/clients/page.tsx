import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clientes',
};

export default function ClientsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Clientes</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Próximamente: gestión de clientes del taller.
      </p>
    </div>
  );
}
