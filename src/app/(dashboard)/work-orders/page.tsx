import type { Metadata } from 'next';
import { WorkOrdersTable } from '@/components/work-orders/work-orders-table';

export const metadata: Metadata = {
  title: 'Órdenes de Trabajo',
};

export default function WorkOrdersPage() {
  return <WorkOrdersTable />;
}
