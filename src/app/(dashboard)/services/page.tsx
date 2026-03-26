import type { Metadata } from 'next';
import { PagePermissionGuard } from '@/components/auth/page-permission-guard';
import { ServicesTable } from '@/components/services/services-table';

export const metadata: Metadata = {
  title: 'Servicios',
};

export default function ServicesTablePage() {
  return (
    <PagePermissionGuard permission="services.view">
      <ServicesTable />
    </PagePermissionGuard>
  );
}
