import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inventario',
};

export default function InventoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Inventario</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Próximamente: gestión de repuestos, proveedores y movimientos de stock.
      </p>
    </div>
  );
}
