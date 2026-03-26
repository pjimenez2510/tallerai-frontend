import type { Metadata } from 'next';
import { PagePermissionGuard } from '@/components/auth/page-permission-guard';
import { InventoryTable } from '@/components/inventory/inventory-table';

export const metadata: Metadata = {
  title: 'Inventario',
};

export default function InventoryTablePage() {
  return (
    <PagePermissionGuard permission="inventory.view">
      <InventoryTable />
    </PagePermissionGuard>
  );
}
