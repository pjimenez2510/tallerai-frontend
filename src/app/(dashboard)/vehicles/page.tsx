import type { Metadata } from 'next';
import { PagePermissionGuard } from '@/components/auth/page-permission-guard';
import { VehiclesTable } from '@/components/vehicles/vehicles-table';

export const metadata: Metadata = {
  title: 'Vehículos',
};

export default function VehiclesTablePage() {
  return (
    <PagePermissionGuard permission="vehicles.view">
      <VehiclesTable />
    </PagePermissionGuard>
  );
}
