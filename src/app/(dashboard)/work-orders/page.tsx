import type { Metadata } from 'next';
import { PagePermissionGuard } from '@/components/auth/page-permission-guard';
import { WorkOrdersTable } from '@/components/work-orders/work-orders-table';

export const metadata: Metadata = {
  title: 'Órdenes de Trabajo',
};

export default function WorkOrdersTablePage() {
  return (
    <PagePermissionGuard permission="work_orders.view">
      <WorkOrdersTable />
    </PagePermissionGuard>
  );
}
