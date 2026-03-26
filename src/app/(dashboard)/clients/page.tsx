import type { Metadata } from 'next';
import { PagePermissionGuard } from '@/components/auth/page-permission-guard';
import { ClientsTable } from '@/components/clients/clients-table';

export const metadata: Metadata = {
  title: 'Clientes',
};

export default function ClientsTablePage() {
  return (
    <PagePermissionGuard permission="clients.view">
      <ClientsTable />
    </PagePermissionGuard>
  );
}
