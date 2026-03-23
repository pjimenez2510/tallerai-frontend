import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Órdenes de Trabajo',
};

export default function WorkOrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
        Órdenes de Trabajo
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Próximamente: listado y gestión de órdenes de trabajo.
      </p>
    </div>
  );
}
