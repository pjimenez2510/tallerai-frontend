import type { Metadata } from 'next';
import { InventoryTable } from '@/components/inventory/inventory-table';

export const metadata: Metadata = {
  title: 'Inventario',
};

export default function InventoryPage() {
  return <InventoryTable />;
}
