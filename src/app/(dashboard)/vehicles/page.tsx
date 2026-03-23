import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vehículos',
};

export default function VehiclesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Vehículos</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Próximamente: gestión de vehículos y consulta ANT por placa.
      </p>
    </div>
  );
}
